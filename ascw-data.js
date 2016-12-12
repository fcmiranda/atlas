var fs = require('fs');
var iconv = require('iconv-lite');
var async = require('async');
var _ = require ('lodash');

const servers = [/*47,52,10,48,11,49,53,12,*/15,16];
var dates = ['20161209'];
var types = ['ASCW'];
var rg = new RegExp('%DATE%', 'g');
var startTimeReport = new Date().getTime();

var expressions = function() {
    return {
    "!NEW REQUEST": 0,
    "Delayed socket read 1 times":0,
    "Delayed socket read 50 times":0,
  }
}
var reportList = [];

var arr = []
for(var key in expressions()){
  arr.push(key);
}
var patternList = arr.join('|');
//(ASCW.*((20161127+)|(20161128+)))
//(ASCW.*20161127+)|(ASCW.*20161128+)

types.forEach((type, index) => {
  types[index] = '('+type+'.*'+'%DATE%'+'+)'
});
var patternPart1 = types.join('|')


dates.forEach((date, index) => {
  dates[index] = patternPart1.replace(rg, date);  
});
var pattern = dates.join('|');


async.eachSeries(servers, function (server, callback) {  
  //*pt var dir = '//172.26.87.'+server+'/Avaya/IC73/logs';
  var dir = './server'+server//*dv

  var report = {
    server:'//172.26.87.'+server,
    expressions:expressions()
  };

  console.log('Reading directory ',dir);

  fs.readdir(dir, function (err, files) {
    var filtredFiles = [];
    files.forEach(file => {
      if((new RegExp(pattern)).test(file)){
        filtredFiles.push(file);
      }
    });

    var startTimeFileReading = new Date().getTime();
    async.eachSeries(filtredFiles, function (file, callback) {
 
        var lineReader = require('readline').createInterface({
          input: require('fs').createReadStream(dir+'/'+file)          
        });

        lineReader.on('line', function (line) {          
            var result = line.match(patternList); //return a array contain the result of match
              result = result || ''; //handle null result            
              report.expressions[_.first(result)]++; //increment the expression count    
        });

        lineReader.on('close', function(){          
          callback();
        });      
     
    }, function () {
      reportList.push(report.expressions);
      delete report.expressions.null;  
      logTime('File', startTimeFileReading);
      callback();    
    });
  });
}, function(){
  for(var key in expressions()){
    reportList[key] = _.sumBy(reportList, key);
  }
  console.log(reportList);
  logTime('Report', startTimeReport);
});

function logTime(string, start){
    console.log(string + ' executed in ' + (new Date().getTime() - start)/1000 + ' seconds');
}