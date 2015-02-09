/**
 * Usage: node import_v2 <file name> <alias> [lang]
 * Example: node import_v2 "data/data/pairs-fr-raw.csv" "pairs-fr-raw" "fr"
 */

var BufferedReader = require("buffered-reader");
var fs = require("fs");

if (process.argv.length < 4)
{
	console.log("Usage:", process.argv[0], process.argv[1], "<file name>", "<alias>", "[lang]");
	process.exit();
}
var fileName = process.argv[2];
var alias = process.argv[3];
var wordsLang = process.argv.length >= 5 ? process.argv[4] : null;

if (!fs.existsSync(fileName))
{
	console.log("File", fileName, "does not exists!");
	process.exit();
}

var Serelex = require('./serelex');
var serelex = new Serelex();

var mysql = require('mysql');
var connection = mysql.createConnection({
	host     : '127.0.0.1',
	user     : 'lsse',
	password : '',
	database: 'lsse',
	multipleStatements: true
});

connection.connect(function(err) {

	connection.query('SELECT * FROM `models` WHERE `name` = ?', [alias], function(err, rows, fields) {
		if (err)
		{
			console.log(err);
			connection.end();
			return;
		}
		if (rows.length <= 0)
		{
			connection.query('INSERT INTO models SET ?', {name: alias}, function(err, result) {
				if (err)
				{
					console.log(err);
					connection.end();
					return;
				}
				startImport(result.insertId);
			});
		}
		else
		{
			startImport(rows[0].id);
		}
	});
});

function startImport(modelId)
{
	console.log("Loading words!");
	var query = connection.query( 'SELECT * FROM words');
	query.on('result', function(row) {
		serelex.setWordId(row.word, row.lang, row.id);
	}).on('end', function(){
		
		var newWordsStart = serelex.wordsArray.length;
		console.log("Words loaded! ", newWordsStart);

		serelex.loadCSV(fileName, wordsLang, function(err, result){
			if (err)
			{
				console.log(err);
				connection.end();
				return;
			}

			var wordId, relations, lastLogTime = 0, currentRel = 0, currTime = 0;
			var length = serelex.wordsArray.length;
			var wordsArray = [];
			var runQuery = 0;
			console.log("New words:", length - newWordsStart);

			function insertThousandWords(startIndex, callback)
			{
				var maxLen = Math.min(startIndex + 1000, length);
				var wordsArray = [];

				if (startIndex >= length)
				{
					callback();
					return;
				}	

				for(i = startIndex; i < maxLen; i++)
				{
					wordsArray.push("(" + i + ", \"" + serelex.wordsArray[i] + "\", \"" + wordsLang + "\")");
				}
				connection.query("INSERT INTO `words` (`id`, `word`, `lang`) VALUES " + wordsArray.join(", "), function(err){
					if (err)
					{
						console.log(err);
					}
					currTime = Date.now()/1000|0;
					if (currTime != lastLogTime)
					{
						lastLogTime = currTime;
						console.log("Inserting words ", maxLen + "/" + length);
					}
					process.nextTick(function(index){
						return function(){
							insertThousandWords(index, callback);
						};						
					}(i));
				});
			};
			insertThousandWords(newWordsStart, function(){
				console.log("Insert words done");

				lastLogTime = -1;

				processArray(result, 1000, function(item, i){
					return "(" + item[0] + ", " + modelId + ", " + item[1] + ", "  + item[2] + ")";
				}, function(items, total, callback){
					connection.query("INSERT INTO `relations` (`word`, `model`, `relation`, `value`) VALUES " + items.join(", "), function(err){
						if (err)
							console.log(err);
						currTime = Date.now()/1000|0;
						if (currTime != lastLogTime)
						{
							lastLogTime = currTime;
							console.log("Inserting", total + '/' + serelex.relationsCount, "complete");
						}
						callback();
					});
				}, function(){
					console.log("Inesrt relations done!");
					connection.end();
				});


			});


	//		connection.end();
		});
		

	//	connection.end();
	});
}

function processArray(array, step, itemFunction, stepFunction, callback)
{
	var length = array.length;
	var current = 0;

	var processStep = function(){
		var len = Math.min(current + step, length);
		var results = [];
		for(; current < len; current++)
		{
			results.push(itemFunction(array[current], current));
		};
		stepFunction(results, current, function(){
			if (current >= length)
				callback();
			else
				process.nextTick(processStep);
		});
	};
	processStep();
}
