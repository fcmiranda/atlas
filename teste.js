/*var fs = require('fs');
var start1 = new Date().getTime();

fs.readdir('//172.26.87.10/Avaya/IC73/logs', (err, files) => {
  files.forEach(file => {
    console.log(file);
  });
  var end1 = new Date().getTime();
  var time = end1 - start1;
  console.log('Execution time on (10):' + time/1000 + ' seconds');
});


fs.readdir('//172.26.87.52/Avaya/IC73/logs', (err, files) => {
  files.forEach(file => {
    console.log(file);
  });
  var end1 = new Date().getTime();
  var time = end1 - start1;
  console.log('Execution time on (52): ' + time/1000 + ' seconds');
});*/
/*var fs = require('fs');
var start1 = new Date().getTime();

fs.readdirSync('//172.26.87.10/Avaya/IC73/logs').filter(function(file) {
    console.log(file);
});

var end1 = new Date().getTime();
var time = end1 - start1;

console.log('Execution time: ' + time/1000 + ' seconds');

var start1 = new Date().getTime();

fs.readdirSync('//172.26.87.52/Avaya/IC73/logs').filter(function(file) {
    console.log(file);
});

var end1 = new Date().getTime();
var time = end1 - start1;

console.log('Execution time: ' + time/1000 + ' seconds');*/

var child_process = require('child_process')
child_process.exec('teste.bat -a', function(error, stdout, stderr) {
  console.log(stdout);
   // res.json({extracted: stdout});
});