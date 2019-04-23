var mongodb = require('mongodb')
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/test';

var URL = require('url');
var express = require('express');
var router = express.Router();

function insertData(client, params, callback) {
    var db = client.db("test");
    var connectionTest = db.collection("test");
    var testData = {
        "name": 'z',
        "age": '25',
        "six":'01',
    };
    connectionTest.insert(testData, function (error, result) {
        if (error) {
            console.log('Error:' + error);
        } else {
            console.log(result)
            console.log(result.result);
        }
        callback(result.ops);
    });
}

router.get('/insert', function (req, res, next) {

    var params = URL.parse(req.url, true).query;

    MongoClient.connect(DB_CONN_STR, function (err, client) {
        console.log("连接成功！");
        insertData(client, params, function (result) {
            res.send(JSON.stringify(Object.assign({}, {
                msg: "插入成功:",
            },result)));

            client.close();
            console.log("连接断开！");
        });
    });
})

module.exports = router;