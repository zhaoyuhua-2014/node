var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/test';



var MongoDb = {
	options:{
		url : null,
	},
	init:function(){
		var MongoClient = require('mongodb').MongoClient,
    		assert = require('assert');
    	
	},
	Client : function () {
		MongoClient.connect(url,function(err,db){
		    assert.equal(null,err);
		    console.log("Connection successfully to server");
		    var dbase = db.db("runoob");
		    
		})
	},
	createCollection : function (biao) {
		if (err) throw err;
        console.log("创建集合!");
        db.close();
	},
	insertOne : function (data) {
		MongoClient.connect(url,function(err,db){
		    assert.equal(null,err);
		    console.log("Connection successfully to server");
		    var dbase = db.db("douban");
		    dbase.collection("site").insertOne(data, function(err, res) {
		        if (err) throw err;
		        console.log("文档插入成功");
		        db.close();
		    })
		};
	},
	insertMany : function (data) {
		MongoClient.connect(url,function(err,db){
		    assert.equal(null,err);
		    console.log("Connection successfully to server");
		    var dbase = db.db("douban");
		    dbase.collection("site").insertMany(data, function(err, res) {
		        if (err) throw err;
		        console.log("文档插入成功");
		        db.close();
		    })
		};
	},
	find : function() {
		
	},
	updateOne : function () {
		
	},
	updateMany : function () {
		
	},
	deleteOne : function () {
		
	},
	deleteMany : function () {
		
	},
	sort : function () {
		
	},
	limit : function () {
		
	}
};