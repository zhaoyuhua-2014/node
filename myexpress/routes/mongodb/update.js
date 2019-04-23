var mongodb = require('mongodb')
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/sun';

var URL = require('url');
var express = require('express');
var router = express.Router();

function updateData(client, params, callback) {
    var db = client.db('sun');
    var connectionTest = db.collection('test');
    var whereData = {
        "name": params.oldName
    }
    var updateDat = {
        $set: {
            "name": params.newName
        }
    }; //如果不用$set，替换整条数据
    connectionTest.update(whereData, updateDat, function (error, result) {
        if (error) {
            console.log('Error:' + error);
        } else {
            console.log(result);
        }

        callback(result.result.n);
    });

    var connectionOther = db.collection('other');
    connectionOther.update(whereData, updateDat, function (error, result) {
        if (error) {
            console.log('Error:' + error);
        } else {
            console.log(result);
        }
    });
}

router.get('/update', function (req, res, next) {

    var params = URL.parse(req.url, true).query;

    MongoClient.connect(DB_CONN_STR, function (err, client) {
        console.log("连接成功！");
        updateData(client, params, function (result) {
            res.send("Delete Success:" + result);

            client.close();
            console.log("连接断开！");
        });
    });
})

module.exports = router;