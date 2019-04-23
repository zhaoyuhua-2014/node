var mongodb = require('mongodb')
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/test';

var URL = require('url');
var express = require('express');
var router = express.Router();

function deleteData(client, params, callback) {
    var db = client.db('test');
    var devices = db.collection('test');
    var data = {
        "name": "z"
    };
    devices.remove(data, function (error, result) {
        if (error) {
            console.log('Error:' + error);
        } else {
            console.log(result.result.n);
        }

        callback(result.result.n);
    })
}

router.get('/delete', function (req, res, next) {

    var params = URL.parse(req.url, true).query;

    MongoClient.connect(DB_CONN_STR, function (err, client) {
        console.log("连接成功！");
        deleteData(client, params, function (result) {
            res.send("Delete Success:" + result);

            client.close();
            console.log("连接断开！");
        });
    });
})

module.exports = router;