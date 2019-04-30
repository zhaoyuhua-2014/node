let DbServer = require("./mongdb_test");


let dbServer = new DbServer('selfIndex');



var a = dbServer.find().then(d=>{
    console.log(d);
})
console.log(a);