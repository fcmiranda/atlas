var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var iconv = require('iconv-lite');
var Fiber = require('fibers');
var moment = require('moment');
var config = require('./config.json');
var async = require('async');

module.exports.extractInterval = extractInterval;
module.exports.extractFiles = extractFiles;
module.exports.folders = folders;
module.exports.files = getFiles;

function l (info){
	console.log(info);
}

function folders (){
	var srcpath = './logs'
	return fs.readdirSync(srcpath).filter(function(file) {
	    return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
}

function getFiles (){
	return fs.readdirSync(config.zip.prod).filter(function(file) {
	    return path.extname(file) === '.zip';
	});
}

function extractInterval (start, end, expression, res){
	var files = [];
	getFiles().forEach(function (file){
		var fileName = file.replace(/\.[^/.]+$/, "");
		if(fileName >= start && fileName <= end){
			files.push(file);
		}
	});
	if(files.length <= 0){
		res.status(500).send({status:500, message: 'Arquivos não encontrados no período selecionado', type:'internal'});
	}else{
		exec(files, expression, res);
	}
}


function l (info){
	console.log(info);
}

function extractFiles (files, expression, res){
	exec(files, expression, res);
	deleteFolderRecursive(config.file.path);
}

function exists (regex, text) {
   regex = regex.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
   return new RegExp(regex).test(text);
};

function exec (files, expressions, res) {
	var pattern = expressions.join('|');
	var expressions = _.zipObject(expressions);
	for (var expression in expressions) {
        expressions[expression] = '';
    }

	var dir = config.file.path;
	if (!fs.existsSync(dir)){
    	fs.mkdirSync(dir);
	}

	Fiber(function() {
		var temp = '/' + moment().format(config.temp.name) + '/';
		var dirs =[];

		files.forEach((file) => {
		  	var unzipSync = require('unzip-sync');
	    	var dir = config.file.path+temp+file.replace(/\.[^/.]+$/, "");
			if(!fs.existsSync(dir)){
		    	var unzipSync = new unzipSync.UnzipSync({folderPath: dir});
		    	unzipSync.extract(path.join(config.zip.prod,file));
		    	l("Files extracted on path: "+dir);
		    }
		    dirs.push(dir);
		});

		async.eachSeries(dirs, function (dir, callback) {
		  console.log('Reading directory ',dir);
		  fs.readdir(dir, function (err, files) {

		    var startTimeFileReading = new Date().getTime();
		    async.eachSeries(files, function (file, callback) {

		        var lineReader = require('readline').createInterface({
		          input: require('fs').createReadStream(dir+'/'+file).pipe(iconv.decodeStream('win1252'))
		        });

		        lineReader.on('line', function (line) {
		            var result = line.match(pattern);
		            if(result)
		            	expressions[result[0]] += (!exists(line,expressions[result[0]])) ? (line+("\n")) : "";
		        });

		        lineReader.on('close', function(){
		          callback();
		        });

		    }, function () {
		      logTime('File', startTimeFileReading);
		      callback();
		    });
		  });
		}, function(){
			var extracted = []
			for(var expression in expressions){
		    	extracted.push({
		    		title: expression,
		    		content : expressions[expression].split('\n').sort().join('\n'),
		    		highlights: [],
		    		chighlights: []
		    	});
		    	delete expressions[expression];
		    };
			res.json({extracted: extracted});
		});
	}).run();
}

function logTime(string, start){
    console.log(string + ' executed in ' + (new Date().getTime() - start)/1000 + ' seconds');
}

var deleteFolderRecursive = function(path) {
	console.log(path);

  if( fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file){
      var curPath = path + "/" + file;
      var x = moment().format(config.temp.name);
      if(fs.lstatSync(curPath).isDirectory() && file !== x) { // recurse
        	deleteFolderRecursive(curPath);
        	fs.rmdirSync(curPath);
      } else if(!fs.lstatSync(curPath).isDirectory() && path !== config.file.path){ // delete file
      		l("Deletando :: " + curPath)
        	fs.unlinkSync(curPath);
      }
    });
  }
};
