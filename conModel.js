var dbModelValues = null;
var mysql      = require('mysql');
var cfg = require('./../config.js');
var connection = mysql.createConnection(cfg.database);
/* var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'root',
   database : 'lsse'
 });

 connection.connect();*/
 connection.query('SELECT * from models', function(err, rows) {
   if (!err){
	console.log(rows);	
	dbModelValues = rows;	
	
   }
   else
     console.log('Error while performing Query.');
 });


