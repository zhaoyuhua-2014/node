/*   
   以爬取起点小说某文为例
*/
// 1. 首先引入模块

var express = require('express'),
    app = express(),
    request = require('request'),
    iconv = require('iconv-lite'),
    cheerio = require('cheerio'),
    async = require("async"), // 控制并发数，防止被封IP
    fs = require('fs'),
    JSONStream = require('JSONStream'),
    path = require('path');

let DbServer = require("./mongdb_test");


let dbServer = new DbServer();


let bookdir = "../public/"
let total = 500 // 总章节数
let startNum = 5001;
let endNum = 15000;
let id = 0 // 计数器
const chapter = 2 // 爬取多少章
const encodedList = ['BG2312', 'utf-8'];
let fileArr = [];
let countSuccess = 0;
let {
    readFile,
    readdir,
    writeFile,
    mkdir
} = require('../untils/fsPromise.js'); //引入要使用的方法


/**
 * 睡眠模拟函数
 * @param  {Number} numberMillis 毫秒
 */
function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}


function redFile() {
    let dir = '../public/json/'
    readdir(dir)
        .then(d => {
            d.sort(function (a, b) {
                return fs.statSync(dir + a).mtime.getTime() - fs.statSync(dir + b).mtime.getTime()
            })
            return d;
        }).then(d => {
            if (d.length > endNum) {
                fileArr = d.slice(startNum, endNum)
            } else {
                fileArr = d.slice(startNum, d.length)
            }

            return fileArr;
        })
        .then(d => {
            return d.map(i => {
                return dir + i;
            })
        })
        .then(d => {
            console.log(d)
            // 使用async控制异步抓取   
            // mapLimit(arr, limit, iterator, [callback])
            // 异步回调
            async.mapLimit(d, 1, function (url, callback) {
                readFileFn(url, callback);
            }, function (err, result) {
                console.log('----------------------------');
                console.log(startNum + '--' + endNum + '条抓取完毕！');
                console.log('----------------------------');
            });
        })
        .catch(err => {
            console.log(err)
        })


    function readFileFn(url, callback) {
        readFile(url)
            .then(d => {
                
                return JSON.parse(d);
            })
            .then(d => {
                dbServer.insert(d)
                .then( d =>{
                    console.log(d);
                    callback(null, url + 'Call back content');
                })
            })
            .catch(err => {
                console.log(err)
                callback(null, url + 'err');
            })
        


    }

}


redFile()
