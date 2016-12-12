var fs = require('fs');
var path = require('path');
var fstream = require('fstream');
var _ = require('lodash');
var iconv = require('iconv-lite');
var unzipSync = require('unzip-sync');
var Fiber = require('fibers');
var moment = require('moment');
var config = require('./config.json'); 

module.exports.extractInterval = extractInterval;
module.exports.extractFiles = extractFiles;
module.exports.folders = folders;
module.exports.files = getFiles;
module.exports.generate = generate;

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
	return fs.readdirSync(config.zip.path).filter(function(file) {
	    return path.extname(file) === '.zip';
	});
}

function onError (err){
	 throw err;
}

function fsExistsSync(myDir) {
  try {
    fs.accessSync(myDir, fs.F_OK);
    return true;
  } catch (e) {
    return fsExistsSync(myDir);
  }
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

function exec (files, expression, res) {
	var dir = config.file.path;
	if (!fs.existsSync(dir)){
    	fs.mkdirSync(dir);
	}

	Fiber(function() {
		var temp = '/' + moment().format(config.temp.name) + '/';
		var obj = {
			lines : []
		};
		for (var i = 0; i < files.length; i++){
			var unzipSync = require('unzip-sync');
	    	var dir = config.file.path+temp+files[i].replace(/\.[^/.]+$/, "");			
			
	    	if(!fs.existsSync(dir)){
		    	var unzipSync = new unzipSync.UnzipSync({folderPath: dir});		    	
		    	unzipSync.extract(path.join(config.zip.path,files[i]));
		    	l("Files extracted on path: "+dir);
		    }		    
		    generate(dir, obj, expression);			
	    };		
		obj.lines = obj.lines.sort();

		//send to client
		res.json({extracted: obj.lines.join('\n')});
	}).run();
}

function generate (dir, obj, expression){
	var filenames = fs.readdirSync(dir);
	var times = 0;

	l("Reading files on directory: "+dir);
	for(var index = 0; index < filenames.length; index++){
		var start1 = new Date().getTime();
		var binary = fs.readFileSync(dir + "/" + filenames[index]);
		var array = iconv.decode(binary, 'win1252').split("\n");	
		var i = array.length;


		RegExp.escape = function(text) {
		  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
		};

		while (i--) {
			if(!array[i].match(new RegExp(expression)) || obj.lines.indexOf(array[i]) > -1){
				array.splice(i, 1);
			}
		}
		obj.lines = obj.lines.concat(array);
		delete array;

		var end1 = new Date().getTime();
		var time = end1 - start1;
		console.log('Execution time: ' + time/1000 + ' seconds');
		times = times + time;
	}

	console.log('Execution time: ' + times + ' seconds');	
}


var deleteFolderRecursive = function(path) {	
  if( fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;      
      var x = moment().format(config.temp.name);
      if(fs.lstatSync(curPath).isDirectory() && file !== x && file.indexOf('t3p') >= 0) { // recurse
        	deleteFolderRecursive(curPath);
        	fs.rmdirSync(curPath);
      } else if(!fs.lstatSync(curPath).isDirectory() && path !== config.file.path){ // delete file
      		l("Deletando :: " + curPath)
        	fs.unlinkSync(curPath);
      }
    });    
  }
};