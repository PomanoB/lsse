var BufferedReader = require("buffered-reader");
var fs = require("fs");

var async = require("async");

var dataModels = require('./data_models').models;

var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('serelex2', server);

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
		
		db.collection('relations', function(err, relationsCollection){
			if(err) 
			{
				console.log(err);
				db.close();
				return;
			}
			console.log("Start calculating stats, please wait....");
			relationsCollection.mapReduce(function(){
				emit({
					model: this.model
				}, {
					words: 1,
					relations: this.relations.length
				});
			}, function(key, values){
				var words = 0, relations = 0;

				values.forEach(function(value) {
					words += value['words'];
					relations += value['relations'];
				});

				return {words: words, relations: relations};
			}, {
				out: { inline: 1 },
				verbose: true
			}, function(err, results, stats) {
				if (err)
				{
					console.log(err);
					db.close();
					return;
				}

				var stats = {};
				async.forEach(results, function(model, callback){
					wordsCollection.findOne({id: model._id.model}, function(err, item){
						if (err)
						{
							console.log(err);
							callback(err);
							return;
						}
						stats[item.word] = {
							words: model.value.words,
							relations: model.value.relations
						}
						callback();					
					});
				}, function(err){
					if (err != null)
						console.log(err);
					fs.writeFile("./stats.json", JSON.stringify(stats), "utf8", function(err){
						if (err)
							console.log(err);
						else
							console.log("Done! stats.json writing!");
						db.close();
					});
				});		
			});
		});	

	});
});