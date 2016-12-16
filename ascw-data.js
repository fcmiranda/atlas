var fs = require('fs');
var iconv = require('iconv-lite');
var async = require('async');
var _ = require ('lodash');

const servers = [47,52,10,48,11,49,53,12,16,15];
var arrDates = ['20161216','20161215','20161214','20161213','20161212','20161211','20161210','20161209','20161208','20161207','20161206','20161205','20161204','20161203','20161202','20161201'];
var types = ['ASCW'];
var rg = new RegExp('%DATE%', 'g');
var startTimeReport = new Date().getTime();


var translate = {
    "!NEW REQUEST": "Requisições:",
    "Delayed socket read 1 times": "Requisições atrasadas",
    "Delayed socket read 50 times": "Requisições não lidas",
    "deslogado por TIMEOUT!": "Deslogues por timeout",
    "!params=action=login&login=": "Logins realizados"
}

var expressions = function() {
    return {
    "!NEW REQUEST": 0,
    "Delayed socket read 1 times":0,
    "Delayed socket read 50 times":0,
    "deslogado por TIMEOUT!":0,
    "!params=action=login&login=":0
  }
}

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

/*var dates = [];
arrDates.forEach((date, index) => {
  dates[index] = patternPart1.replace(rg, date);  
});
var patternFiles = dates.join('|');*/

arrDates.forEach(date => {
  report(date, patternPart1.replace(rg, date));
});

function report(date, patternFiles){    
    var reportList = [];
    var logins = new Set();

    async.eachSeries(servers, function (server, callback) {  
    var dir = '//172.26.87.'+server+'/Avaya/IC73/logs';
    //var dir = './server'+server;///*dv

    var report = {
      server:'//172.26.87.'+server,
      expressions:expressions()
    };    

    fs.readdir(dir, function (err, files) {
      var filtredFiles = [];
      files.forEach(file => {
        if((new RegExp(patternFiles)).test(file)){
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
                report.expressions[result[0]]++; //increment the expression count
                if(result[0] == '!params=action=login&login=') logins.add(line.substring(result[0].length, result[0].length+8));                                              
  /*            var registration = line.substring(result.length, result.length+8);              
                logins += (patternRegistration.test(registration) && (new RegExp(registration).test(logins))) ? registration+'-' : '';*/                             
                    
          });

          lineReader.on('close', function(){          
            callback();
          });      
       
      }, function () {
        reportList.push(report);      
        delete report.expressions.undefined;        
        callback();    
      });
    });
  }, function(){
    var total = {};  
    for(var key in expressions()){
      total[translate[key]] = _.sumBy(reportList, function(item) {
        return item.expressions[key]; 
      });
    }
    total['Logins únicos'] = logins.size;
    reportList.push(total);
    console.log(reportList);

    var file = "//logsusabilidade/logs/Usabilidade/extracaoascw/report-"+date+".txt";
    console.log("!!Saving the file "+file+" ....");
    fs.writeFile(file, JSON.stringify(reportList, null, 4), function(err) {
        if(err) {
            return console.log(err);
        }        
    }); 
    logTime('Report', startTimeReport);
  });

}



function logTime(string, start){
    console.log(string + ' executed in ' + (new Date().getTime() - start)/1000 + ' seconds');
}