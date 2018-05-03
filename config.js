var mysql = require('mysql');

var conn = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'',
	database:'nodecms'
})

conn.connect(function(err){
	if(err){
		throw err;
	}
	else{
		console.log("database connected")
	}
})


module.exports = conn;