var BufferedReader = require("buffered-reader");
var fs = require("fs");

var async = require("async");

var Serelex = new require('./serelex');
var serelex = new Serelex();


var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('serelex2', server);

var fileNames = ['./data/pairs-all-freq.csv', './data/conc-all-freq.csv', './data/corpus-all-freq.csv'];

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
			
			var i, words = {};
			for(i = 0; i < items.length; i++)
			{
				words[items[i].word + "bnud"] = items[i].id;
			}

			console.log("Complete...");

			var fileData = [];
			async.map(fileNames, fs.stat, function(err, results){
				if (err) 
					console.log(err);
				for(var i = 0; i < results.length; i++)
				{
					fileData[i] = {
						size: results[i].size, 
						loaded: 0,
						name: fileNames[i]
					};
				}

				async.forEach(fileData, function(file, callback){
					new BufferedReader (file.name, { encoding: "utf8" })
						.on ("error", function (error){
							callback(error);
						})
						.on ("line", function (line, offset){
							if (offset == -1)
								offset = file.size;
							var progress = Math.floor(offset/file.size*100);
							if (progress != file.loaded)
							{
								file.loaded = progress;
								console.log("File", file.name, "loading", progress, "%");
							}

							var data = line.split(";");
							if (data.length != 2)
								return;

							if (typeof words[data[0] + "bnud"] != "undefined")
							{
								wordsCollection.update({word: data[0]}, {$set: {freq: parseInt(data[1])}});
							}
						})
						.on ("end", function (){
							console.log("File", file.name, "complete processing");
							this.close();
							callback();
						})
						.read ();
				}, function(err){
					if (err != null)
						console.log(err);
				});
			});
		});
	});
});