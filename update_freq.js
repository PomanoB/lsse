var reader = require ("buffered-reader");
var DataReader = reader.DataReader;
var fs = require("fs");
var mysql = require("mysql");

var async = require("async");

var Serelex = new require('./serelex');
var serelex = new Serelex();

if (process.argv.length < 4)
{
	console.log("Usage:", process.argv[0], process.argv[1], "<file name>", "<lang>");
	process.exit();
}
var fileName = process.argv[2];
var wordLang = process.argv[3];

if (!fs.existsSync(fileName))
{
	console.log("File", fileName, "does not exists!");
	process.exit();
}

var fileStat = fs.statSync(fileName);

var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db;

var cfg = require('./config.js');

var connection = mysql.createConnection(cfg.database);

connection.connect(function(err){
	if (err)
	{
		console.log(err);
		return;
	}

	var fileSize = fileStat.size;
	var progress = 0;
	var data = [];
	var lines = [];
	var currentLine = 0;
	var currentQueries = 0;
	var fileDone = false;
	var lastTime = 0;
	var query = "";
	var i = 0;

	// function updateWord()
	// {
	// 	if (lines.length > 0 && currentQueries <= 0)
	// 	{
	// 		currentQueries++;
	// 		data = lines.shift();

	// 		connection.query("UPDATE words SET frequency = ? WHERE word = ? AND lang = ?", [data[1], data[0], wordLang], function(err){
	// 			if (err)
	// 				console.log(err);
	// 			currentQueries--;
	// 			if (lines.length > 0 && currentQueries <= 0)
	// 				process.nextTick(updateWord);
	// 		});
	// 	}
	// }

	var reader = new DataReader (fileName, { encoding: "utf8" });
	reader.on ("error", function (error){
			console.log(error);
			process.exit();
		})
		.on ("line", function (line, offset){
			if (offset == -1)
				offset = fileSize;
			progress = offset/fileSize*100|0;

			currentTime = Date.now()/1000|0;

			if (currentTime != lastTime)
			{
				lastTime = currentTime;
				console.log("File", fileName, "loading", progress, "%");
			}

			data = line.split(";");
			if (data.length != 2)
				return;

			// lines.push([data[0], data[1]|0]);

			reader.pause();
			connection.query("UPDATE words SET frequency = ? WHERE word = ? AND lang = ?", [data[1]|0, data[0], wordLang], function(err){
				if (err)
					console.log(err);
				reader.resume();
			});

			// if (lines.length >= 1000)
			// {
			// 	reader.pause();
			// 	query = "";
			// 	for(i = 0; i < lines.length; i++)
			// 	{
			// 		query += ("UPDATE words SET frequency = " + 
			// 					connection.escape(lines[i][1]) + " WHERE word =  " + 
			// 					connection.escape(lines[i][0]) + " AND lang =  " + 
			// 					connection.escape(wordLang) + ";");
			// 	}
			// 	lines = [];
			// 	connection.query(query, function(err){
			// 		if (err)
			// 			console.log(err);
			// 		reader.resume();
			// 	});
			// }
		})
		.on ("end", function (){
			// if (lines.length >= 0)
			// {
			// 	query = "";
			// 	for(i = 0; i < lines.length; i++)
			// 	{
			// 		query += ("UPDATE words SET frequency = " + 
			// 					connection.escape(lines[i][1]) + " WHERE word =  " + 
			// 					connection.escape(lines[i][0]) + " AND lang =  " + 
			// 					connection.escape(wordLang) + ";");
			// 	}
			// 	connection.query(query, function(err){
			// 		if (err)
			// 			console.log(err);
			// 		connection.end();
			// 	});
			// }
			// else
			// 	connection.end();
			connection.end();
		}).read();

});