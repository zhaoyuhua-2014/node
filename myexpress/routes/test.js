
let async = require("async");

let DbServerTest = require("../mongodb/mongdb_test");
let dbServer = new DbServerTest();


let DbServerNoval = require("../mongodbNovel/mongdb_test");
let dbTest = new DbServerNoval('test');
// 分割好之后的数组
let indexArr = [];
//每一个数组中的小说数目
let itemArrNum = 100;


var getTestList = function () {
    return new Promise(function (resolve, reject) {
        
        dbServer.find().then(d => {
            console.log("****************************************")
            resolve(d)
        }).catch(e => {
            reject(e);
        })
    });
};

// 对所有小说的数据进行分组
function HandleTestDb() {
    return getTestList().then(d => {
        var itemArr = []
        d.forEach((val, index) => {
            if (index % itemArrNum == 0 && index != 0) {
                indexArr.push(itemArr);
                itemArr = [];
            } else {
                itemArr.push(val);
            }
        });
        return indexArr;
    }).catch(err => {
        console.log('对所有小说的数据进行分组error');
        console.log(err);
    })
}

// 循环处理分组的小说

function forEtch_HandleTestDb() {
    HandleTestDb().then(d =>{


        // 使用async控制异步抓取   
        // mapLimit(arr, limit, iterator, [callback])
        // 异步回调
        async.mapLimit(d, 1, function (item, forEtch_HandleTestDb_callBack) {
            indexItemFun(item, forEtch_HandleTestDb_callBack);
        }, function (err, result) {
            console.log('----------------------------');
            console.log(startNum + '--' + endNum + '条抓取完毕！');
            console.log('----------------------------');
        });
    })
}
// 主页分组之后再分组
function indexItemFun(d, forEtch_HandleTestDb_callBack) {
    console.log(d);

    // 使用async控制异步抓取   
    // mapLimit(arr, limit, iterator, [callback])
    // 异步回调
    async.mapLimit(d, 1, function (item, indexItemFun_callBack) {
        indexItemFun_item(item, indexItemFun_callBack);
    }, function (err, result) {
        console.log('----------------------------');
        console.log(startNum + '--' + endNum + '条抓取完毕！');
        console.log('----------------------------');
        forEtch_HandleTestDb_callBack(null, '主页分组之后再分组')
    });
}

function indexItemFun_item(o, indexItemFun_callBack) {
    console.log(JSON.stringify(o))
}
forEtch_HandleTestDb()
// module.exports.getChapterList = getChapterList;