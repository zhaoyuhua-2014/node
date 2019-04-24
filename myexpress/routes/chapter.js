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
const PinYin = require('node-pinyin');


let bookdir = "../public/"
let total = 500 // 总章节数
let startNum = 1;
let endNum = 10;
let id = 0 // 计数器
const chapter = 2 // 爬取多少章
const encodedList = ['BG2312', 'utf-8'];
let fileArr =[];
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
    readdir( dir )
    .then( d => {
        d.sort( function (a , b ){
            return fs.statSync(dir + a).mtime.getTime() - fs.statSync(dir + b).mtime.getTime()
        })
        return d;
    }).then( d =>{
        if (d.length > endNum) {
            fileArr = d.slice(startNum, endNum)
        }else{
            fileArr = d.slice(startNum, d.length)
        }
        
        return fileArr;
     })
     .then( d => {
        return d.map( i =>{
            return dir + i ;
        })
     })
     .then(d =>{
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
    .catch( err =>{
        console.log(err)
    })


    function readFileFn(url , callback) {
        let pageUrls = [];
        let fileItemName = ''
        readFile(url)
        .then( d => {
            return JSON.parse(d);
        })
        .then( d => {
            let oneBookNumber = d.chapterList.map( (i,index) =>{
                return {
                    url: i,
                    index:index
                }
            });
            let tarUrlArr = d.targetUrl.split("/");
            let fileName = tarUrlArr[tarUrlArr.length -1];
            console.log(fileName)
            fileItemName = fileName;
            mkdir(bookdir+"book/"+fileName).then( r =>{
                console.log(r);
                // 使用async控制异步抓取   
                // mapLimit(arr, limit, iterator, [callback])
                // 异步回调
                async.mapLimit(oneBookNumber, 1, function (item, callback) {
                    console.log(item)
                    reptileMove(item, callback);
                }, function (err, result) {
                    console.log('----------------------------');
                    console.log(startNum + '--' + endNum + '条抓取完毕！');
                    console.log('----------------------------');
                    callback(null, url + 'Call back content');
                });
            })
            
           
        })
        .catch(err => {
            console.log(err)
            callback(null, url + 'err');
        })
        var reptileMove = function (item, callback) {
            let startTime = Date.now(); // 记录该次爬取的开始时间
            let url = item.url;
            let bookIndexName = item.index;
            request({
                url: url,
                encoding: null // 关键代码
            }, function (err, res, body) {
                if (err || res.statusCode != 200) {
                    console.error(err);
                    console.log('抓取该页面失败，重新抓取该页面..')
                    reptileMove(url, callback);
                    return false;
                }
                var html = iconv.decode(body, 'gb2312')
                var $ = cheerio.load(html);
                let bookItem = {};
                let bookText = $("#content").text();
                let bookTitle = $(".bookname h1").text();
                
                bookItem.title = bookTitle;
                bookItem.content = bookText;
                bookItem.length = bookText.length;
                bookItem.index = bookIndexName;

                let fileStr = bookdir + 'book/' + fileItemName+"/" + bookIndexName + '.json';

                var time = Date.now() - startTime;


                fs.writeFileSync(fileStr, JSON.stringify(bookItem));

                countSuccess++;
                console.log(bookItem.index + ', ' + url + ', 耗时 ' + time + 'ms');
                if (countSuccess % 100 == 0) {
                    console.log("100 的整数倍睡眠2秒")
                    sleep(2000)
                }

                callback(null, url + 'Call back content');
            });
        };

        
    }
    
}

/**
 * 每一个章节信息
 */
function fetchBrand( pageUrl ) {
    var pageUrls = pageUrl; // 存放爬取网址
    let countSuccess = 0; // 成功数
    let countFail = 0; //失败数
    
    var reptileMove = function (url, callback) {
        var startTime = Date.now(); // 记录该次爬取的开始时间

        request({
            url: url,
            encoding: null // 关键代码
        }, function (err, res, body) {
            if (err || res.statusCode != 200) {
                console.error(err);
                console.log('抓取该页面失败，重新抓取该页面..')
                reptileMove(url, callback);
                return false;
            }
            var html = iconv.decode(body, 'gb2312')
            var $ = cheerio.load(html);

            //var $ = cheerio.load(data.text); // 读取章节列表页面
            let urls = [];
            let bookName = $("#info h1").text();
            let bookAuthor = $("#info p").eq(0).text().split("：")[1];
            let lastUpdateTime = $("#info p").eq(2).text().split("：")[1];
            let downloadUrl = $("#info p").eq(3).find("a").attr('href');

            let total = $("#wrapper .box_con").eq(1); // 获取所以章节元素拿到总章节数
            let dds = total.find("dd");
            jsonData.name = bookName;
            jsonData.author = bookAuthor;
            jsonData.downloadUrl = downloadUrl;
            jsonData.targetUrl = url;
            jsonData.lastUpdateTime = lastUpdateTime;


            // 循环获取每个章节的页面url并push进urls
            dds.each(function (i, v) {
                if (i < dds.length) {
                    let eIndex = $(v).find("a").attr('href').split(".")[0];
                    if (urls.indexOf(eIndex) == -1) {
                        urls.push(eIndex)
                    }
                }
            })
            urls = urls.sort(function (a, b) {
                return a - b;
            });
            let newArr = urls.map((i) => {
                return url + "/" + i + ".html"
            })
            jsonData.allChapterNumber = newArr.length;
            jsonData.chapterList = newArr;
            jsonData.index = countSuccess + countFail + startNum;
            jsonData.timeStamp = Date.now();


            let fileStr = bookdir + 'json/' + jsonData.index + '.json';

            var time = Date.now() - startTime;
            jsonData.graspTimeDifference = time;


            fs.writeFileSync(fileStr, JSON.stringify(jsonData));

            countSuccess++;
            console.log(jsonData.index + ', ' + url + ', 耗时 ' + time + 'ms');
            if (countSuccess % 100 == 0) {
                console.log("100 的整数倍睡眠2秒")
                sleep(2000)
            }

            callback(null, url + 'Call back content');
        });
    };

    // 使用async控制异步抓取   
    // mapLimit(arr, limit, iterator, [callback])
    // 异步回调
    async.mapLimit(pageUrls, 1, function (url, callback) {
        reptileMove(url, callback);
    }, function (err, result) {
        console.log('----------------------------');
        console.log(startNum + '--' + endNum + '条抓取完毕！');
        console.log('----------------------------');
    });

}

//fetchBrand();


redFile()
