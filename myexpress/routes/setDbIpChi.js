var request = require("request");
var iconv = require('iconv-lite');
var Promise = require("bluebird");
let DbServerNoval = require("../mongodbNovel/mongdb_test");
let dbServerNoval = new DbServerNoval('ipTable');
let async = require("async"); // 控制并发数，防止被封IP
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
function getProxyList() {
    var apiURL = 'http://d.jghttp.golangapi.com/getip?num=100&type=2&pro=&city=0&yys=0&port=1&pack=9197&ts=1&ys=0&cs=0&lb=1&sb=0&pb=4&mr=1&regions=';

    return new Promise((resolve, reject) => {
        var options = {
            method: 'GET',
            url: apiURL,
            // encoding: null,
            // headers: {
            //     'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            //     'Accept-Encoding': 'gzip, deflate',
            //     'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
            //     'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
            //     'Host': 'Host: d.jghttp.golangapi.com',
            //     'Upgrade-Insecure-Requests': '1',
            //     'Proxy-Connection': 'keep-alive'
            // },

        };

        request(options, function (error, response, body) {


            try {

                if (error) throw error;
                var html = iconv.decode(body, 'gb2312')
                
                console.log("***************gb2312**********************")

                resolve(JSON.parse(html).data);

            } catch (e) {
                return reject(e);
            }


        });
    })
}





var start = function() {
    return new Promise(function (resolve, reject) {
        var arr = [0,1, 2,3,4,5,6,7,8,9];
        let allCount = arr.length * 50;
        let sucCount = 0,
            failCount = 0;
        
        try {
            async.mapLimit(arr, 1, function (d, callback) {

                fn(d, callback);
            }, function (err, result) {
                console.log('-------------抓取ip列表完毕！---------------');
                resolve(obj)
                
            });
        } catch (error) {
            reject(error)
        }

        

        function fn(d , callback) {
            getProxyList().then(function (proxyList) {
                proxyList.forEach((val, index) => {
                    dbServerNoval.find({
                        'ip': val.ip
                    }).then(d => {
                        if (!d.length) {
                            dbServerNoval.insert(val).then(d => {
                                sucCount++
                            }).catch(err => {
                                failCount++
                                console.log(err)
                            })
                        }else{
                            failCount++
                        }
                    }).catch(err =>{
                        failCount++
                        console.log(err)
                    })
                });
                console.log("睡眠两秒")
                sleep(2000)
                callback(null , "==================")
            }).catch(e => {
                console.log(e);
            })
        }
    })
};
module.exports.start = start;