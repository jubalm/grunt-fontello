// TODO: Clean up comments

var fs      = require('fs');
var path    = require('path');
var async   = require('async');
var needle  = require('needle');
var unzip   = require('unzip');
var mkdirp  = require('mkdirp');
var grunt   = require('grunt');

var getOptions = {
  follow: 10
};

/* Verify or build paths */
var processPath = function(options, dir, callback){
  fs.exists(dir, function(exists){
    if(!exists) {
      if(!options.force) {
        callback(dir + ' missing! use `force:true` to create');
      } else {
        // Force create path
        mkdirp(dir, function(err){
          if (err) { callback(err); }
          else {
            callback(null, dir + ' created!');
          }
        });
      }
    } else {
      callback(null, dir + ' verified!');
    }
  });
};

var setSession = function(options, session, config){
  var dest = path.resolve(process.cwd(), options.config);

  if (undefined == config)
    config = require(dest);

  // Write session to config file. Save session in name field since the
  // Fontello api dislikes custom members.
  config.name = session;
  fs.writeFileSync(dest, JSON.stringify(config, null, '\t'));
}

/*
* Initial Checks
* @callback: options
* */
var init = function(options, callback){

  grunt.log.write('Verify paths...');
  var tests = [
    processPath.bind(null, options, options.fonts),
    processPath.bind(null, options, options.styles)
  ];
  async.parallel(options.styles ? tests : [tests[0]], function(err, results){
    if(err) {
      grunt.log.error(err);
      callback(err);
    }
    else {
      grunt.log.ok();
      results.forEach(function(result){
        grunt.log.debug(result);
      });
      callback(null, options);
    }
  });

};

/*
* Check Session
* URL: http://fontello.com
* GET: http://fontello.com/SESSIONID/get
* @callback: bool representing expiration of session
* */
var checkSession = function(options, callback){
  var expired = false;
  var config = require(process.cwd() + '/' + options.config);

  grunt.log.write('Checking session...');
  needle.get(options.host + '/' + config.name + '/get', getOptions, function(err, response, body){
    if(response.statusCode == 500)
      expired = true;

    grunt.log.ok();
    callback(null, options, expired);
  });
};

/*
* Create Session
* URL: http://fontello.com
* POST: config.json
* @callback: session id
* */
var createSession = function(options, expired, callback){

  // TODO: save session somewhere else?

  var data = {
    config: {
      file: options.config,
      content_type: 'application/json'
    }
  };

  var session = null;
  var config = require(path.resolve(process.cwd(), options.config));

  if (config.name && !expired) {
    session = config.name
    callback(null, options, session);
  }
  else {
    grunt.log.write('Creating session...');
    needle.post( options.host, data, { multipart: true }, function(err, res, body){
         if (err) {
           grunt.log.error();
           callback(err);
         }
         else {
           grunt.log.ok();
           grunt.log.debug('sid: ' + body);
           callback(null, options, body);
         }
       }
    );
  }

};

/*
* Download Archive
* URL: http://fontello.com
* GET: http://fontello.com/SESSIONID/get
* callback: fetch/download result
**/
var fetchStream = function(options, session, callback){

  // The Fontello api outputs an error message instead of a session id if the
  // config file contains unexpected data. Pass that error on.
  if (/Invalid/.test(session))
    throw new Error(session);

  var tempConfig = path.resolve(process.cwd(), 'config-tmp.json');
  var tempZip = path.resolve(process.cwd(), 'fontello-tmp.zip');
  setSession(options, session);

  grunt.log.write('Fetching archive...');
  needle.get(options.host + '/' + session + '/get', getOptions, function(err, response, body){

    if (err) {
      throw err;
    }

    if(response.statusCode == 404)
    {
      setSession(options, '');
	  createSession(options, fetchStream);
    }
    else
    {
      fs.writeFileSync(tempZip, body);
      var readStream = fs.createReadStream(tempZip);

      /* Extract Files */
      if(options.fonts || options.styles) {
      return readStream.pipe(unzip.Parse())
        // TODO: fix inconsistent return point
        .on('entry', function(entry){
          var ext = path.extname(entry.path);
          var name = path.basename(entry.path);

          if(entry.type === 'File') {
            if(options.exclude.indexOf(name) !== -1) {
                grunt.verbose.writeln('Ignored ', entry.path);
                entry.autodrain();
            } else {
              switch(ext){
              // Extract Fonts
              case '.woff':case '.svg': case '.ttf': case '.eot': case '.woff2':
                var fontPath = path.join(options.fonts, path.basename(entry.path));
                return entry.pipe(fs.createWriteStream(fontPath));
              // Extract CSS
              case '.css':
                // SCSS:
                if (options.styles) {
                  var cssPath = (!options.scss) ?
                  path.join(options.styles, path.basename(entry.path)) :
                  path.join(options.styles, '_' + path.basename(entry.path).replace(ext, '.scss'));
                  return entry.pipe(fs.createWriteStream(cssPath));
                }
              case '.json':
                if (options.updateConfig) {
                  var r = entry.pipe(fs.createWriteStream(tempConfig));
                  r.on('finish', function() {
                    var config = require(tempConfig);
                    setSession(options, session, config);
                    fs.unlinkSync(tempConfig);
                  });
               }
              // Drain everything else
              default:
                grunt.verbose.writeln('Ignored ', entry.path);
                entry.autodrain();
              }
            }
          }
        })
        .on('close', function(){
           fs.unlinkSync(tempZip);
           grunt.log.ok();
           callback(null, 'extract complete');
        });
      }
      /* Extract full archive */
      return readStream.pipe(unzip.Extract({ path: options.zip }))
        .on('close', function(){
          grunt.log.ok();
          fs.unlinkSync(tempZip);
          callback(null, 'Fontello extracted to '+options.zip);
      });
    }
    if(err){
      grunt.log.err();
      callback(err);
    }
  });


};

module.exports = {
  init    : init,
  check   : checkSession,
  post    : createSession,
  fetch   : fetchStream
 };
