'use strict';

var os        = require('os');
var fs        = require('fs');
var path      = require('path');
var async     = require('async');
var needle    = require('needle');
var unzip     = require('unzipper');
var mkdirp    = require('mkdirp');
var grunt     = require('grunt');
var normalize = require('normalize-path');

/* Fontello API parameters */
var getOptions = {
  follow: 10
};

/* Verify or build paths */
var processPath = function(options, dir, callback){

  fs.exists(dir, function(exists){

    if(!exists) {
      if(!options.force) {
        callback(dir + ' missing! use `force:true` to create');
      }
      else {
        // Force create path
        mkdirp(dir, function(err){
          if (err) {
            callback(err);
          }
          else {
            callback(null, dir + ' created!');
          }
        });
      }
    }
    else {
      callback(null, dir + ' verified!');
    }

  });

};

/* Get session */
var getSession = function(){

  var src = path.resolve(os.tmpdir(), 'grunt-fontello-session');

  // Make sure the session file exists, return `null` otherwise.
  if(!fs.existsSync(src))
    return null;

  // Read session from the session file.
  return fs.readFileSync(src, { encoding: 'utf-8' });

}

/* Set session */
var setSession = function(session){

  var dest = path.resolve(os.tmpdir(), 'grunt-fontello-session');

  // Write session to the session file since the Fontello
  // api dislikes custom members.
  fs.writeFileSync(dest, session);

}

/* Set relative font path */
var setFontPath = function(options, callback){

  var css2FontPath = options.cssFontPath || normalize(path.relative(options.styles, options.fonts));
  grunt.log.write('Processing font path...');

  try {
    fs.readdir(options.styles, function(err, files){

      for(var i in files) {
        if(!files.hasOwnProperty(i))
          continue;

        var filePath = path.join(options.styles, files[i]);

        if(fs.statSync(filePath).isDirectory())
          continue;

        var content = fs.readFileSync(filePath);
        fs.writeFileSync(filePath, content.toString().replace(/\.\.\/font/g, css2FontPath));
      }

    });

    grunt.log.debug('Font path is ' + css2FontPath);
    grunt.log.ok();
    callback(null, 'extract complete');
  } catch(err) {
    grunt.log.error(err);
    grunt.log.fail();
    callback(err);
  }

}

/*
* Display Deprecated Message(s)
* @callback: options
* */
var deprecated = function(options, callback){
  if(options.scss)
    grunt.log.warn('You\'re using the deprecated option "scss", please switch to "preprocessor" as soon as possible');

  callback(null, options);
};

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
  var session = getSession();

  grunt.log.write('Checking session...');
  if(session !== null) {
    needle.get(options.host + '/' + session + '/get', getOptions, function(err, response, body){

      if(response.statusCode === 500)
        expired = true;

      grunt.log.ok();
      callback(null, options, expired);

    });
  }
  else {
    callback(null, options, true);
  }

};

/*
* Create Session
* URL: http://fontello.com
* POST: config.json
* @callback: session id
* */
var createSession = function(options, expired, callback){

  var data = {
    config: {
      file: options.config,
      content_type: 'application/json'
    }
  };

  var session = getSession();

  if (session !== null && !expired) {
    callback(null, options, session);
  }
  else {
    grunt.log.write('Creating session...');
    needle.post( options.host, data, { multipart: true }, function(err, response, body){

       if (err) {
         grunt.log.error();
         callback(err);
       }
       else {
         grunt.log.ok();
         grunt.log.debug('sid: ' + body);

         // Store the new sid and continue
         setSession(body);
         callback(null, options, body);
       }

     });
  }

};

/*
* Download Archive
* URL: http://fontello.com
* GET: http://fontello.com/SESSIONID/get
* callback: fetch/download result
* */
var fetchStream = function(options, session, callback){

  // The Fontello api outputs an error message instead of a session id if the
  // config file contains unexpected data. Pass that error on.
  if(/Invalid/.test(session))
    throw new Error(session);

  var tempConfig = path.resolve(os.tmpdir(), 'config-tmp.json');
  var tempZip = path.resolve(os.tmpdir(), 'fontello-tmp.zip');

  grunt.log.write('Fetching archive...');
  needle.get(options.host + '/' + session + '/get', getOptions, function(err, response, body){

    if(err)
      throw err;

    if(response.statusCode == 404) {
      setSession(options, '');
      createSession(options, fetchStream);
    } else {
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
              for(var rule of options.exclude) {
                if(rule === name || name.match(rule)) {
                  grunt.verbose.writeln('Ignored ', entry.path);
                  entry.autodrain();
                  return;
                }
              }

              switch(ext) {
                // Extract Fonts
                case '.woff':case '.svg': case '.ttf': case '.eot': case '.woff2':
                  var fontPath = path.join(options.fonts, path.basename(entry.path));
                  return entry.pipe(fs.createWriteStream(fontPath));
                // Extract CSS
                case '.css':
                  if (options.styles) {
                    var basename = path.basename(entry.path).replace('fontello', options.prefix);
                    var cssPath;
                    switch(options.preprocessor.toLowerCase()) {
                      case 'none':
                        if(options.scss === true) {
                          cssPath = path.join(options.styles, '_' + basename.replace(ext, '.scss'));
                        } else {
                          cssPath = path.join(options.styles, basename);
                        }
                        break;
                      case 'less':
                        cssPath = path.join(options.styles, basename.replace(ext, '.less'));
                        break;
                      case 'scss':
                        cssPath = path.join(options.styles, '_' + basename.replace(ext, '.scss'));
                        break;
                      default:
                        grunt.fail.warn('Unknown preprocessor "' + options.output + '"');
                        return;
                    }

                    return entry.pipe(fs.createWriteStream(cssPath));
                  }
                // Drain everything else
                default:
                  grunt.verbose.writeln('Ignored ', entry.path);
                  entry.autodrain();
              }
            }
          })
          .on('close', function(){
             fs.unlinkSync(tempZip);
             grunt.log.ok();
             callback(null, options);
          });
      }

      /* Extract full archive */
      return readStream.pipe(unzip.Extract({ path: options.zip }))
        .on('close', function(){
          grunt.log.ok();
          fs.unlinkSync(tempZip);
          callback(null, options);
      });
    }

  });

};

module.exports = {
  deprecated : deprecated,
  init       : init,
  check      : checkSession,
  post       : createSession,
  fetch      : fetchStream,
  fontPath   : setFontPath
};
