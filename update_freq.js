var reader = require ("buffered-reader");
var DataReader = reader.DataReader;
var fs = require("fs");

var async = require("async");

var Serelex = new require('./serelex');
var serelex = new Serelex();

if (process.argv.length < 3)
{
	console.log("Usage:", process.argv[0], process.argv[1], "<file name>", "[db]");
	process.exit();
}
var fileName = process.argv[2];
var wordsDb = process.argv.length >= 4 ? process.argv[3] : null;

if (!fs.existsSync(fileName))
{
	console.log("File", fileName, "does not exists!");
	process.exit();
}

var fileStat = fs.statSync(fileName);

var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('serelex2', server);

//var fileNames = ['./data/pairs-all-freq.csv', './data/conc-all-freq.csv', './data/corpus-all-freq.csv'];

db.open(function(err, db) {
	if(err) 
	{
		console.log(err);
		return;
	}

	db.collection('words', function(err, wordsCollection){
		if(err) 
		{
			console.log(err);
			db.close();
			return;
		}
		console.log("Loading existing words...");
		wordsCollection.find(wordsDb ? {db: wordsDb} : undefined).toArray(function(err, items){
			if(err) 
			{
				console.log(err);
				db.close();
				return;
			}
			
			var i, words = {};
			for(i = 0; i < items.length; i++)
			{
				words[items[i].word + "bnud"] = items[i].id;
			}

			console.log("Complete...");

			var fileSize = fileStat.size;
			var fileLoaded = 0;
			
			new DataReader (fileName, { encoding: "utf8" })
				.on ("error", function (error){
					callback(error);
					process.exit();
				})
				.on ("line", function (line, offset){
					if (offset == -1)
						offset = fileSize;
					var progress = Math.floor(offset/fileSize*100);
					if (progress != fileLoaded)
					{
						fileLoaded = progress;
						console.log("File", fileName, "loading", progress, "%");
					}

					var data = line.split(";");
					if (data.length != 2)
						return;

					if (typeof words[data[0] + "bnud"] != "undefined")
					{
						wordsCollection.update(wordsDb ? {word: data[0]} : {word: data[0], db: wordsDb}, {$set: {freq: parseInt(data[1])}});
					}
				})
				.on ("end", function (){
					console.log("File", fileName, "complete processing");
			//		this.close();
					
				}).read ();
		});
	});
});