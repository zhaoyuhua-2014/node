var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/test';

var ObjectID = require('mongodb').ObjectID;

// 插入方法
let insert = function (collectionName, obj) {
    return new Promise(function (resolve, reject) {
        
        MongoClient.connect(DB_CONN_STR, function (err, client) {
            if (err) reject(err);
            var collection = client.db(collectionName).collection(collectionName);
            
            obj = Object.assign({},obj,{
                _id: new ObjectID(),
            })
            collection.insert(obj, function (err, res) {
                client.close();
                if (err) {
                    console.log(obj.index +"err");
                    reject(err);
                }else{
                    console.log(obj.index + "插入成功")
                    resolve(res[0]);
                }
            });
        });
    });
}



// 更新
var update = function (collectionName, obj) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(DB_CONN_STR, function (err, client) {
            if (err) reject(err);
            var collection = client.db(collectionName).collection(collectionName);
            collection.update(obj, function (err, res) {
                client.close();
                if (err) reject(err);
                else resolve(res);
            });
        });
    });
}

// 查找一个
var findOne = function (collectionName, query, option) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(DB_CONN_STR, function (err, client) {
            if (err) reject(err);

            var collection = client.db(collectionName).collection(collectionName);

            if (option == undefined || option == null) {
                collection.findOne(query, function (err, res) {
                    client.close();
                    if (err) reject(err);
                    else resolve(res);
                });
            } else {
                collection.findOne(query, option, function (err, res) {
                    client.close();
                    if (err) reject(err);
                    else resolve(res);
                });
            }
        });
    });
}



// 查找多个
var find = function (collectionName, query, option) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(DB_CONN_STR, function (err, client) {
            if (err) reject(err);
            var collection = client.db(collectionName).collection(collectionName);
            if (option == undefined || option == null) {
                collection.find(query).toArray(function (err, res) {
                    console.log("find result")
                    console.log(res)
                    client.close();
                    if (err) reject(err);
                    else resolve(res);
                });
            } else {
                collection.find(query, option).toArray(function (err, res) {
                    client.close();
                    if (err) reject(err);
                    else resolve(res);
                });
            }
        });
    });
}



// 删除
var remove = function (collectionName, query) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(DB_CONN_STR, function (err, client) {
            if (err) reject(err);
            var collection = client.db(collectionName).collection(collectionName);

            collection.remove(query, function (err, res) {
                client.close();
                if (err) reject(err);
                else resolve(res);
            });
        });
    });
}

// 计数
var count = function (collectionName, query, option) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(DB_CONN_STR, function (err, client) {
            if (err) reject(err);
            var collection = client.db(collectionName).collection(collectionName);
            if (query == undefined || query == null)
                query = {};
            if (option == undefined || option == null) {
                collection.count(query, function (err, count) {
                    client.close();
                    if (err) reject(err);
                    else resolve(count);
                });
            } else {
                collection.count(query, option, function (err, count) {
                    client.close();
                    if (err) reject(err);
                    else resolve(count);
                });
            }
        });
    });
}

module.exports.insert = insert;
module.exports.update = update;
module.exports.findOne = findOne;
module.exports.find = find;
module.exports.remove = remove;
module.exports.count = count;