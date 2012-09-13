var dataModels = require('./data_models').models;
var BufferedReader = require("buffered-reader");
var fs = require("fs");

var s = require('./serelex');

var serelex = new s();

var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('serelex', server);

db.open(function(err, db) {
	if(!err) 
	{
		db.createCollection('words', function(err, collection) {
			if (err)
			{
				console.log(err);
				return;
			}
			var modelsLoaded = 0;
			for(var i = 0; i < dataModels.length; i++)
			{
				serelex.loadCSV(dataModels[i].fileName, dataModels[i].alias, function(error){
					modelsLoaded++;
					if (error)
					{
						console.log(error);
					}
					else
						console.log("Data loaded");
					if (modelsLoaded == dataModels.length)
					{
						console.log("All Data loaded");
						
						var model;
						
						for(model in serelex.data)
						{
							if (serelex.data.hasOwnProperty(model))
							{
								console.log("Start importing model " + model);
							
								var word;
								var wordStr;
								var wordCount = 0;
								for(word in serelex.data[model])
								{
									if (serelex.data[model].hasOwnProperty(word))
									{
										wordStr = serelex.wordsArray[word];
										collection.insert({
											"word": wordStr,
											"model": model,
											"relations": serelex.getRelationships(model, wordStr)
										});
									}
									if (++wordCount % 5000 == 0)
										console.log("Importing ", wordCount, " words...");
								}
								console.log("Importing total ", wordCount, " words in model ", model);
							}
						}
					}
				})
			//	importFile(collection, dataModels[i].fileName, dataModels[i].alias);
			}
		});
	}
	else
	{
		console.log(err);
	}
});



function importFile(collection, fileName, alias)
{
	var stats = fs.statSync(fileName);
	var progress, lastProgress;
	new BufferedReader (fileName, { encoding: "utf8" })
	.on ("error", function (err){
		console.log(err);
	})
	.on ("line", function (line, offset){
		var d = line.split(";");
		if (d.length == 3)
		{
			collection.update({
				word: d[0],
				model: alias
			}, {
				$push: {
					relations: {
						word: d[1],
						value: d[2]
					}
				}
			}, {upsert: true});
		}
		if (offset == -1)
			offset = stats.size;

		progress = Math.floor(offset/stats.size*100);
		if (progress != lastProgress)
		{
			lastProgress = progress;
			console.log("File " + fileName + " import " + progress + "%");
		}
	})
	.on ("end", function (){
		this.close();
	})
	.read ();
}