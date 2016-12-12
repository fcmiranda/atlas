var fs = require('fs');
var iconv = require('iconv-lite');
var async = require('async');

const servers = [/*47,52,10,48,11,49,53,12,*/15,16];
var start1 = new Date().getTime();
var dates = ['20161209'];
var types = ['ASCW'];
var rg = new RegExp('%DATE%', 'g');

var list = function() {
    return {
    "!NEW REQUEST": 0,
    "Delayed socket read 1 times":0,
    "Delayed socket read 50 times":0,
  }
}

var reportTotal = {  
  list:list()
}

var arr = []
for(var key in list()){
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

servers.forEach( (server, index) => {  
  //*pt var dir = '//172.26.87.'+server+'/Avaya/IC73/logs';
  var dir = './server'+server//*dv

  var report = {
    server:'//172.26.87.'+server,
    list:list()
  };

  console.log('Reading directory ',dir);

  fs.readdir(dir, (err, files) => {
    
    var readedFiles = 0;
    var filtredFiles = 0;
    files.forEach(file => {
      if((new RegExp(pattern)).test(file)){
        filtredFiles = filtredFiles + 1;
      }
    });
    
    files.forEach(file => {
      if((new RegExp(pattern)).test(file)){
        
        var startx = new Date().getTime();
        var lineReader = require('readline').createInterface({
          input: require('fs').createReadStream(dir+'/'+file)          
        });

        lineReader.on('line', function (line) {          
            var key = line.match(patternList);
              first = key || '';              
              report.list[key] = report.list[first[0]]+ 1;
              reportTotal.list[key] = reportTotal.list[first[0]]+ 1;
        });

        lineReader.on('close', function(){
          readedFiles = readedFiles + 1;
          if(filtredFiles == readedFiles){
            var end1 = new Date().getTime();
            var time = end1 - startx;

            console.log(report);    
            console.log(reportTotal);
            console.log('Execution time on end readding ' + time/1000 + ' seconds');             
          }
        });        
      }
    });
/*    var end1 = new Date().getTime();
    var time = end1 - start1;    
    console.log('Execution time on ('+server+'):' + time/1000 + ' seconds'); */       
  });
});

/* ASINCRONO DEMORADO
  var startx = new Date().getTime();                
        fs.readFile(dir+'/'+file, function read(err, data) {
            if (err) {
                throw err;
            }
            var array = iconv.decode(data, 'win1252').split("\n");  
            var i = array.length; 
            
            while (i--) {
              var key = array[i].match(patternList);
              first = key || '';              
              list[key] = list[first[0]]+ 1;                      
            }        
            readedFiles = readedFiles + 1;
            console.log(dir + "/" + file);
            if(filtredFiles == readedFiles){
              var end1 = new Date().getTime();
              var time = end1 - startx;    
              console.log('Execution time on end readding' + time/1000 + ' seconds');
              console.log(list);  
            }
        }); 
*/

/* SINCRONO DEMORADO

var start1 = new Date().getTime();
servers.forEach( (server, index) => { 
  var files = fs.readdirSync('//172.26.87.'+server+'/Avaya/IC73/logs');
  for (var i in files) {    
    console.log(files[i]);
  }

  var end1 = new Date().getTime();
  var time = end1 - start1;
  console.log('Execution time on ('+time+'):' + time/1000 + ' seconds'); 
});*/


/*//LENTO!!
        var startx = new Date().getTime();
        var binary = fs.readFileSync(dir + "/" + file);
        var array = iconv.decode(binary, 'win1252').split("\n");  
        var i = array.length;       
        while (i--) {
          var key = array[i].match(patternList);
          first = key || '';              
          list[key] = list[first[0]]+ 1;                      
        }        
        readedFiles = readedFiles + 1;
        console.log(dir + "/" + file);
        if(filtredFiles == readedFiles){
          var end1 = new Date().getTime();
          var time = end1 - startx;    
          console.log('Execution time on end readding' + time/1000 + ' seconds');
          console.log(list);  
        }*/