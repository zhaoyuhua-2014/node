let premist_mongdb = require("./promise_mongdb");


module.exports = {
    // 创建
    insert: function (obj) {
        var res =  premist_mongdb.insert(this.collectionName, obj);
        return res;
    },

    // 更新
    update: function (obj) {
        var res =  premist_mongdb.update(this.collectionName, obj);
        return res;
    },

    // 删除
    remove: function (query) {
        var res =  premist_mongdb.remove(this.collectionName, query);
        return res;
    },


    // 查询
    find: function (query, option) {
        console.log("find -----")
        var res =  premist_mongdb.find(this.collectionName, query, option);
        return res;
    },

    // 查询
    findOne: function (query, option) {
        var res =  premist_mongdb.findOne(this.collectionName, query, option);
        return res;
    },

    // 取全部
    getAll: function () {
        var res =  premist_mongdb.find(this.collectionName, {});
        return res;
    },

    // // 按照id查询
    // getById: function (id) {
    //     var res =  premist_mongdb.findOne(this.collectionName, {
    //         _id: new ObjectID(id)
    //     });
    //     return res;
    // },

    // // 按照很多id来查询
    // getByIds: function (ids, option) {
    //     ids = ids.map(function (id) {
    //         return new ObjectID(id);
    //     });
    //     var res =  premist_mongdb.find(this.collectionName, {
    //         _id: {
    //             $in: ids
    //         }
    //     }, option);
    //     return res;
    // },

    // // 列出（带分页）
    // getByPage: function (query, sort, pageSize, pageNum) {
    //     if (!query)
    //         query = {};
    //     if (!sort)
    //         sort = [
    //             ['_id', 'desc']
    //         ];
    //     var option = {
    //         sort: sort,
    //         limit: pageSize,
    //         skip: (pageNum - 1) * pageSize
    //     };
    //     var res =  premist_mongdb.find(this.collectionName, query, option);
    //     return res;
    // },

    // 计数
    count: function (query) {
        if (!query)
            query = {};
        var res =  premist_mongdb.count(this.collectionName, query);
        return res;
    }
}