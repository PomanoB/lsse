var mysql = require('mysql');
var dbModelValues = null;
var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'root',
   database : 'lsse'
});
connection.connect();

console.log("dd page");
//console.log(connection);

var myCallback = function(data) {
  console.log('got data: '+data);
};

var usingItNow = function(callback) {

connection.query('SELECT * from models', function(err, rows) {
	console.log("query");
   if (!err){
	console.log(rows);	
	dbModelValues = rows;	
   }
   else
     console.log('Error while performing Query.');
 });



  callback('get it?');
};

module.exports = dbModelValues;
