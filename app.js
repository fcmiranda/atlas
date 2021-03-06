var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    fs = require('fs'),
    path = require('path'),
    iconv = require('iconv-lite'),
    config = require('./config.json'),
    moment = require('moment');
    async = require('async'),
    iconv = require('iconv-lite'),
    spawn = require('child_process').spawn;

app
.use(express.static(__dirname + '/client'))
.use('/assets', express.static(__dirname + '/node_modules'))
.all('/*', function(req, res) {
    res.sendFile(path.resolve('client/index.html'));
}).on( 'error', function( error ){
   console.log( "Error: \n" + error.message );
   console.log( error.stack );
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
    'use strict';
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});

function find(socket, query, app) {
    var tempStart = moment(query.dateTimeStart),
        end = moment(query.dateTimeEnd),
        actualPath = path.join(config.pastaBase, app.name);
        query.paths = [];

        //insere pasta do dia anterior na verificacao, pois pode haver arquivos do dia seguinte
        query.paths.push(path.join(actualPath, moment(tempStart).subtract(1, 'day').format('YYYY/MM/DD')));
        do {
        	query.paths.push(path.join(actualPath, tempStart.format('YYYY/MM/DD')));
            tempStart.add(1, 'day');
        } while(tempStart.isSameOrBefore(end));
        findInPaths(socket, query, app);
}

function findInPaths(socket, query, app){
    var filePaths = [];
    async.eachSeries(query.paths, function (dir, callback) {
        fs.readdir(dir, function (err, files) {
            if (err){
                return callback();//se passar callback() vai para o proximo
                //return callback(err);//se passar callback(err) o for para no primeiro error
            }
            async.eachSeries(files, function (file, callback2) {
                var filePath = path.join(dir, file);
                fs.lstat(filePath, function (err, stats) {
                    if (stats && !stats.isDirectory() && path.extname(file) === '.log' && stats.mtime > query.dateTimeStart && stats.mtime < query.dateTimeEnd) {
                        filePaths.push(filePath)
                    }
                    callback2();
                });
            }, function(){
                callback();
            });
        })
    }, function () {
        if(filePaths.length <= 0){
            socket.emit('complete', {
                tabIds: [app.name + ":" + query.expression],
                message: {
                    type: 'warn',
                    description: 'Não há arquivos entre o periodo selecionado'
                }
            });
            return
        }

        var ls = spawn('rg', [query.expression].concat(filePaths).concat(['--no-filename','--no-line-number']));

        ls.stdout.on('data', (data) => {
           app.encode = app.encode || 'UTF-8';
           data = iconv.decode(data, app.encode);
           data = data.split('\n');
           data.splice(-1,1);

           var linesObj = {
               lines: data,
               tabIds: [app.name + ":" + query.expression]
           };
           socket.emit('putInTabs', linesObj);
        });

        ls.on('close', (code) => {
            var complete = 0;
            if(code == 0){
                complete = {
                    tabIds: [app.name + ":" + query.expression],
                    message: {
                        type: 'success',
                        description: 'Sucesso!'
                    }
                }
            }else{
                complete = {
                    message: {
                        type: 'warn',
                        description: 'Expressão não encontrada'
                    }
                }
            }
        	socket.emit('complete', complete);
        });
    });
}

io.on('connection', function (socket) {
    'use strict';
    socket.on('listApps', function () {
        socket.emit('listApps', fs.readdirSync(config.pastaBase).map(function (file) {
            var isDirectory = fs.lstatSync(path.join(config.pastaBase, file)).isDirectory();
            if(!isDirectory)
                return
            return {
                name: file,
                encode: config.encode[file]
            };
        }).filter(function (file){
            return file;
        }));
    });

    socket.on('pesquisar', function (query) {
        query.apps.forEach(function (app) {
            if (app) {
                find(socket, query, app);
            }
        });
    });
});




// var app = {
//     name: "Usabilidade",
//     encode: "win1252"
// }
// var query = {
//     expressions: ["F0100515"],
//     dateTimeStart: +moment('2017-09-18 12:00'),
//     dateTimeEnd: +moment('2017-09-18 12:30')
// }
//
// var x = Date.now();
// var actualPath = path.join(config.pastaBase, app.name);
// expression = query.expressions[0];
// //findRecursiveApp(null, app, actualPath, query.expressions, query.dateTimeStart, query.dateTimeEnd, [])
// find(null, query, app);

// function findRecursiveApp(socket, app, actualPath, expressions, dateTimeStart, dateTimeEnd, filePaths) {
//     'use strict';
//     fs.readdir(actualPath, function (err, files) {
//         async.eachSeries(files, function (file, callback) {
//             var filePath = path.join(actualPath, file);
//             fs.lstat(filePath, function (err, stats) {
//                 if (stats && stats.isDirectory()) {
//                     findRecursiveApp(socket, app, path.join(actualPath, file), expressions, dateTimeStart, dateTimeEnd, filePaths);
//                 } else if (path.extname(file) === '.log' && stats.mtime > dateTimeStart && stats.mtime < dateTimeEnd) {
//                     filePaths.push(filePath);
//                 }
//                 callback();
//             });
//         }, function () {
//             console.log(Date.now() -x, filePaths);
//         });
//     });
// }
//
// function findInFile(socket, app, actualPath, expressions, dateTimeStart, dateTimeEnd) {
//     'use strict';
//     console.log(Date.now() -x ,' - ',actualPath);
// }
