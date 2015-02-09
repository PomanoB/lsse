var sax = require("sax");
var reader = require ("buffered-reader");
var DataReader = reader.DataReader;
var fs = require("fs");
var mysql = require("mysql");

var Serelex = new require('./serelex');
var serelex = new Serelex();

if (process.argv.length < 4)
{
	console.log("Usage:", process.argv[0], process.argv[1], "<file name>", "<lang>");
	process.exit();
}

var fileName = process.argv[2];
var lang = process.argv[3];

var connection = mysql.createConnection(require('./config.js').database);

connection.connect(function(err) {

	console.log("Loading words!");

	var query = connection.query( 'SELECT * FROM words WHERE `lang` = ?', [lang]);
	query.on('result', function(row) {
		serelex.setWordId(row.word, row.lang, row.id);
	}).on('end', function(){

		var escapedLang = connection.escape(lang);

		var newWordsStart = serelex.wordsArray.length;
		console.log("Loaded %d words", newWordsStart);

		var totalLemms = 0;

		var saxStream = sax.createStream(true);

		var numberLemms = 0;
		var lastLogTime = 0;
		var currentTime = 0;

		var currentTag = 0;
		var TagsTypes = {
			"entry": 1,
			"lemma": 2,
			"form": 3
		};
		var currentLemm = 0;
		var lemmsToInsert = [];

		var stream = fs.createReadStream(fileName)

		var queryCount = 0;

		var insertLemms = function(callback){
			var query = "";
			var i, insertArray = [];
			if (newWordsStart < serelex.wordsArray.length)
			{
				for(i = newWordsStart; i < serelex.wordsArray.length; i++)
				{
					insertArray.push(
						"(" + i + ", " + connection.escape(serelex.wordsArray[i]) + ", " + escapedLang + ")");
				}
				newWordsStart = serelex.wordsArray.length;
				query = "INSERT INTO `words` (`id`, `word`, `lang`) VALUES " + insertArray.join(",") + ";";
			}
			insertArray = [];
			for(i = 0; i < lemmsToInsert.length; i++)
			{
				insertArray.push("(" + lemmsToInsert[i][0] + ", " + connection.escape(lemmsToInsert[i][1]) + ")");
			}
			query += ("INSERT INTO `lemms` (`word`, `lemm`) VALUES " + insertArray.join(","));
			lemmsToInsert = [];
			connection.query(query, function(err){
				if (err)
					console.log("Query", query, err);
				callback();
			});
		};


		saxStream.on("error", function (e) {
			console.error("error!", e)
			
			this._parser.error = null
			this._parser.resume();
		});
		saxStream.on("opentag", function (node) {
			if (typeof TagsTypes[node.name] != "undefined")
				currentTag = TagsTypes[node.name];
			else
				currentTag = 0;
			
		});
		saxStream.on("closetag", function (tag) {
			if (tag == "entry")
			{
				
				if (lemmsToInsert.length >= 1000)
				{
					totalLemms += lemmsToInsert.length;

					stream.pause();
					queryCount++;
					insertLemms(function(){
						if (--queryCount == 0)
						{
							stream.resume();
						}
					});
				}

				currentTime = Date.now()/1000|0;
				if (currentTime != lastLogTime)
				{
					lastLogTime = currentTime;
					console.log("Inserting %d lemms..", totalLemms);
				}
			}
			currentTag = 0;
		});
		saxStream.on("text", function (text) {
			var wordId;
			switch (currentTag)
			{
				case TagsTypes["lemma"]:
					currentLemm = connection.escape(serelex.getWordId(text, lang));
					break;
				case TagsTypes["form"]:
					lemmsToInsert.push([currentLemm, serelex.getWordId(text, lang)]);
					break;
			}
		});
		saxStream.on("end", function(){
			insertLemms(function(){
				console.log("Import done!");
			});
		});
		stream.pipe(saxStream);
	});
});