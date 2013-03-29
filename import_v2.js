/**
 * Usage: node import_v2 <file name> <alias> [db]
 * Example: node import_v2 "data/data/pairs-fr-raw.csv" "pairs-fr-raw" "fr"
 */

var BufferedReader = require("buffered-reader");
var fs = require("fs");

if (process.argv.length < 4)
{
	console.log("Usage:", process.argv[0], process.argv[1], "<file name>", "<alias>", "[db]");
	process.exit();
}
var fileName = process.argv[2];
var alias = process.argv[3];
var wordsDb = process.argv.length >= 5 ? process.argv[4] : null;

if (!fs.existsSync(fileName))
{
	console.log("File", fileName, "does not exists!");
	process.exit();
}


var Serelex = new require('./serelex');
var serelex = new Serelex();

var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db,
	ObjectID = mongo.ObjectID;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('serelex2', server);

var words = {};

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
		wordsCollection.find().toArray(function(err, items){
			if(err) 
			{
				console.log(err);
				db.close();
				return;
			}
			console.log("Complete...");
			var i;
			for(i = 0; i < items.length; i++)
			{
				serelex.setWordId(items[i].word, items[i].db, items[i].id);
			}
			var newWordsStart = serelex.wordsArray.length;

			db.collection('relations', function(err, relationsCollection){

				if(err) 
				{
					console.log(err);
					db.close();
					return;
				}

				var queriesCount = 0;

				var modelsLoaded = 0;
				var relations = [];
				var j, wordId;
				
				serelex.loadCSV(fileName, alias, wordsDb, function(error, model, data){
					if (error)
					{
						console.log(error);
						return;
					}

					for(wordId in data)
					{
						if (data.hasOwnProperty(wordId))
						{
							relations = [];
							for(j = 0; j < data[wordId].length; j++)
							{
								relations.push({
									"word": data[wordId][j][0], 
									"value": data[wordId][j][1]
								});
							}
							queriesCount++;
							relationsCollection.insert({
								"word": parseInt(wordId),
								"model": model,
								"relations": relations
							});
							if (queriesCount % 5000 == 0)
								console.log("Importing", queriesCount, "/", serelex.relationsCount[serelex.getWordById(model)], "relations");
						}
					}

					console.log("Insert relations complete!");
					delete serelex.data[serelex.getWordById(model)];

					var wordsArray = [];
					var length = serelex.wordsArray.length;
					var i;
					var oneWord = {word: "", id: 0};
					if (wordsDb)
						oneWord.db = wordsDb;
					for(i = newWordsStart; i < length; i++)
					{
						//wordsCollection.insert({word: serelex.wordsArray[i], id: i});
						oneWord = {word: serelex.wordsArray[i], id: i};
						if (wordsDb)
							oneWord.db = wordsDb;
						wordsArray.push(oneWord);
						if (i % 5000 == 0)
						{
							wordsCollection.insert(wordsArray);
							console.log("Insertnig ", i, "/", length," new words");
							wordsArray = [];
						}	
					}
					if (wordsArray.length > 0)
						wordsCollection.insert(wordsArray);
					
				});
				
			});
		});
	});
});