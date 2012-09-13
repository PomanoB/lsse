var dataModels = require('./data_models').models;
var BufferedReader = require("buffered-reader");
var fs = require("fs");

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
				serelex.setWordId(items[i].word, items[i].id);
			}
			var newWordsStart = i;

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
				for(i = 0; i < dataModels.length; i++)
				{
					serelex.loadCSV(dataModels[i].fileName, dataModels[i].alias, function(error, model, data){
						modelsLoaded++;
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

						console.log("Insert relations complete for model %s!", serelex.getWordById(model));
						delete serelex.data[serelex.getWordById(model)];

						if (modelsLoaded == dataModels.length)
						{
							var wordsArray = [];
							var length = serelex.wordsArray.length;
							var i;
							for(i = newWordsStart; i < length; i++)
							{
								//wordsCollection.insert({word: serelex.wordsArray[i], id: i});
								wordsArray.push({word: serelex.wordsArray[i], id: i});
								if (i % 5000 == 0)
								{
									wordsCollection.insert(wordsArray);
									console.log("Insertnig ", i, "/", length," new words");
									wordsArray = [];
								}	
							}
							if (wordsArray.length > 0)
								wordsCollection.insert(wordsArray);
							console.log("Update words complete!");
							// wordsCollection.insert(wordsArray);
						}
					});
				}
			});
		});
	});
});