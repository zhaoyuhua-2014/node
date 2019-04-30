const ipTable = require("./setDbIpChi");

let DbServerNoval = require("../mongodbNovel/mongdb_test");
let dbServerNoval = new DbServerNoval('ipTable');

var getIpList = function (arr) {
    return new Promise(function (resolve, reject) {
        if (arr && arr.length) {
            arr.forEach((val, index) => {
                dbServerNoval.remove(val).then(d => {
                    
                })
            });
            console.log("+++删除ip+++");
        }

        dbServerNoval.find().then( d =>{
            if (d.length < 400) {
                console.log("重新获取500个ip")
                ipTable.start();
            }
            if (d.length > 200) {
                let m = d.slice(100, 200);
                console.log("返回了1" + m.length + "条IP")
                resolve(m)
            }else{
                console.log("返回了" + d.length + "条IP")
                resolve(d);
            }
            
        }).catch(e => {
            reject(e);
        })
    });
};

module.exports.getIpList = getIpList;