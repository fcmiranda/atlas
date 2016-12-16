var fs = require('fs');
var iconv = require('iconv-lite');
var async = require('async');
var _ = require ('lodash');

var fs = require('fs');
fs.writeFile("./report", JSON.stringify([{nome: 'fe'}, {nome: 'fe'}]), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 