var express = require('express') // call express
var app = express() // define out app using express
var http = require('http')
var path = require('path')
var reload = require('reload')
var bodyParser = require('body-parser')
var logger = require('morgan')
var log = require('./log.js') 
var publicDir = path.join(__dirname, 'public')
var moment = require('moment')
var child_process = require('child_process')
var router = express.Router();

app.set('port', process.env.PORT || 3000)
app.use(express.static(__dirname + '/public'));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));
app.use(logger('dev'))

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

router.get('/files', function (req, res) {
  res.json(log.files());
});

router.post('/extractInterval', function (req, res) {
	var body = req.body;
	log.extractInterval(body.start, body.end, body.expression, res);
});

router.post('/extractFiles', function (req, res) {
	var body = req.body;
	setTimeout(function(){
		log.extractFiles(body.files, body.expressions, res);
	},2000)	
});

router.post('/zip', function (req, res) {
	var wait  = '-a'; //wait 5 seconds
	var child_process = require('child_process')
	child_process.exec('teste.bat '+ wait, function(error, stdout, stderr) {
	  console.log(stdout);
	    res.json({extracted: stdout});
	});
});

app.use('/api', router);

app.use('/*', function(req, res) {
  res.sendFile(path.join(publicDir, 'index.html'))
})

var server = http.createServer(app);

// Reload code here 
reload(server, app) 
 
server.listen(app.get('port'), function(){
  console.log("Web server listening on port " + app.get('port'));
});