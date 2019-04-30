/*   
   以爬取起点小说某文为例
*/
// 1. 首先引入模块

var async = require("async"); // 控制并发数，防止被封IP
let request = require('request');
let iconv = require('iconv-lite');
let cheerio = require('cheerio');
let Ip = require('./isIpAvailable.js');

//跳过的条目
let skipCount = 0;
// 每次获取的小说数目
const limitCount = 50;
// 过期的ip列表
let expireIpList = [];
let expireIpList1 = [];
// 当前小说列表
let nowNovelList = [];
// 当前的ip列表
let nowIpList =[];
// 当前的小说章节列表
let nowChapterList = [];
//小说的章节数目
let allChapterNum = 0;
// 章节分组存储
let chapterGroup = 100;
//拉取的小说章数
let fetchSucNum = 0;
// 需要批量存储内容
let chapterTextArr = [];



let DbServerNoval = require("../mongodbNovel/mongdb_test");

let dbServerNovalChapter = new DbServerNoval('novelChapter');

let dbServerChapter = new DbServerNoval('chapter');


// 获取小说列表
var getChapterList = function(obj) {
    return new Promise( function (resolve , reject)  {
        if (obj) {
            limitNum = obj.limit || 0;
            skipNum = obj.skip || 0;
        }
        let option = {
            limit: limitNum,
            skip: skipNum,
        }
        dbServerNovalChapter.mixFind({}, option).then( d =>{
            resolve(d)
        }).catch( e =>{
            reject(e);
        })
    })
}

// 获取ip列表
var getIpList = function ( ) {
    return new Promise( function (resolve , reject) {
        Ip.getIpList(expireIpList1).then(d => {
            resolve(d)
        }).catch(e =>{
            reject(e)
        })
    })
}
// 每一本小说处理的函数
var getNovelList = function (d, callBack1) {
    //赋值列表和章节数目
    nowChapterList = d.arrlist;
    allChapterNum = d.number;
    let count = 0;
    
    async.mapLimit(nowChapterList, 50, function (d, callback) {
        getFetchChapter(d, callback)
    }, function (err, result) {
        console.log(err);
        console.log(result);
        fetchSucNum = 0;
        console.log('------------每一本小说抓取完毕----------------');
        callBack1(null, 'Call back content');
        
    })

    // 对于每一章小说的处理
    function getFetchChapter(d, callback) {
        console.log(count)
        console.log("可用的IP数量" + nowIpList.length)
        console.log("过期的IP数量"+expireIpList.length)
        count = +count + 1;
        let ip = nowIpList[0];
        if (nowIpList.length == 0) {
            
            expireIpList1 = expireIpList.map(d => {
                return {
                    'ip':d.ip
                }
            })
            getIpList().then( result =>{
                console.log("已经重新获取ip列表")
                nowIpList = result;
                expireIpList = [];
                expireIpList1 = [];
                getFetchChapter(d, callback)
            })
        }else{
            console.log(d.targetUrl)
            let options = {
                url: d.targetUrl,
                encoding: null, // 关键代码
                timeout: 10000,
            }
            options.proxy = 'http://' + ip.ip + ":" + ip.port + "/";

            request(options, function (err, res, body) {
                if (err || res.statusCode != 200) {
                    console.log('抓取该页面失败，重新抓取该页面..');
                    expireIpList.push(ip);
                    nowIpList = nowIpList.slice(1);
                    getFetchChapter(d, callback)
                    return false;
                }
                var html = iconv.decode(body, 'gb2312')
                var $ = cheerio.load(html);
                let bookItem = {};
                let content = $("#content").text();
                let name = $(".bookname h1").text();
                bookItem.content = content;
                bookItem.id = d.chaptersId;
                bookItem.name = name;
                bookItem.novalId = d.novalId;
                bookItem.index = d.index;

                dbServerChapter.insert(bookItem).then(d => {
                    console.log("---插入成功----")
                    fetchSucNum++;
                })
                console.log(bookItem.id)
                callback(null, d.targetUrl + 'text back')
                // callback(null, url + 'Call back content');
            });
        }
        
    };
    
}
//第50本  少了三章  找不到原因
//下次从50本开始。 
function fistPage() {
    Promise.all([getChapterList({
            'limit':80,
            'skip': 20,
        }), getIpList()]).then(d => {
        nowNovelList = d[0];
        nowIpList = d[1];

        try {
             async.mapLimit(nowNovelList, 1, function (d, callBack) {
                 try {
                     getNovelList(d, callBack)
                 } catch (error) {
                     console.log(error)
                 }
                 
             }, function (err, result) {
                 console.log('----------------------------');
                 console.log('123456789');
                 console.log('----------------------------');
             })
        } catch (error) {
            console.log(error)
        }

    }).catch(e =>{
        console.log(e)
    })
}

fistPage()
