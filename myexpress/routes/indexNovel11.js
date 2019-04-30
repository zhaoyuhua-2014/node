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
        fs = require('fs');
let bookdir = "../public/"
let total = 0 // 总章节数
let startNum = 0;
let endNum = 1000;
let id = 0 // 计数器
const chapter = 2 // 爬取多少章
// const url = 'https://book.qidian.com/info/1011146676#Catalog' // 章节列表页面
const url = 'https://www.booktxt.net/'
const pathName = 'xiaoshuodaquan';
const encodedList = ['BG2312', 'utf-8'];
let DbServerTest = require("../mongodb/mongdb_test");
let dbServer = new DbServerTest();


let DbServerNoval = require("../mongodbNovel/mongdb_test");
let dbServerNoval = new DbServerNoval('novel');

let dbServerNovalChapter = new DbServerNoval('novelChapter');

let dbServerChapter = new DbServerNoval('chapter');

let dbServerSelfIndex = new DbServerNoval('selfIndex');

let dbServerTag = new DbServerNoval('tag');
//小说条目模板
let novalObj = {
    id: null,
    name: '',
    author: '',
    createDate: '',
    details: '',
    chapterNumber: '',
    targetUrl: '',
    type: 1,
    tag: [],
};
// 小说目录模板
let novalChapterObj = {
    id: null,
    number: null,
    arrlist: [{
        chaptersId: null,
        chaptersName: '',
        targetUrl: ''
    }]
}
// 章节内容模板
let chapterObj = {
    id: null,
    content: '',
    name: '',
}


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




function fistPage() {
    let allArr = [];
    // {}, {
    //     'skip': 11688
    // }
    dbServer.mixFind({}, {
        'limit': 1000,
        'skip': 10000
    }).then(d => {
        allArr = d;

        async.mapLimit(d, 1, function (d, callback) {

            novalChapterObj = {
                id: null,
                number: null,
                arrlist: [],
            };
            item(d, callback);
        }, function (err, result) {
            console.log('----------------------------');
            console.log('0--' + allArr.length + '抓取完毕！');
            console.log('----------------------------');
        });
    })


    function item(obj, callback) {


        novalChapterObj.number = obj.allChapterNumber;

        dbServerNoval.find({
            'name': obj.name
        }).then(d => {

            if (d.length) {
                console.log('*****************1111********************')
                return d[0];
            } else {
                callback(null, d.name + 'Call back content');
            }
        }).then(d => {
            console.log(d.id)
            novalChapterObj.id = d.id;
            novalChapterObj.name = obj.name;
            (obj.chapterList).forEach((val, index) => {
                novalChapterObj.arrlist.push({
                    novalId: novalChapterObj.id,
                    index: index,
                    chaptersId: novalChapterObj.id + '_' + index,
                    chaptersName: '',
                    targetUrl: val
                })
            });
            dbServerNovalChapter.insert(novalChapterObj).then(d => {
                console.log('章节表插入成功')
                callback(null, "成功123456789")
            }).catch(err => {
                console.log('发生错误！+dbServerNovalChapter', err)
            })
        }).catch(err => {
            console.log('发生错误！+dbServerNoval 123 ', err)
        })


    }
}

fistPage()
