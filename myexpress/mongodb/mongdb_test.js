
var service = require('./server');
var premist_mongdb = require("./promise_mongdb")

var Service = function () {
    this.collectionName = 'test';

    //这里扩充你自己的方法 比如 按照邀请码搜索
    this.getSearch = function (query) {
        var res =  this.find(query);
        return res;
    };
    this.addData = function (data) {
        var res =  this.insert(data);
        return res;
    };

    this.delData = function ( data ) {
        var res =  this.remove( data )
        return res;
    };

    this.updata = function ( data ) {
        var res =  this.updata(data)
        return res;
    };

    if (Service.instance == null) {
        Service.instance = this;
    }
    return Service.instance;
}

Service.prototype = service;

module.exports = Service;