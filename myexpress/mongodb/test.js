let DbServer = require("./mongdb_test");


let dbServer = new DbServer();



var a = dbServer.find({"name":'斗破苍穹'})
console.log(a);