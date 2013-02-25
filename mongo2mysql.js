var util = require('util');
var async = require('async');
var fs = require('fs');

var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('serelex2', server);

var mysql = require('mysql');

var ignoreWords = {
	"norm31": true,
	"overlap-mknn-5-12130": true,
	"overlap-mknn-20-12130": true,
	"pairs-all-raw-sort": true,
	"raw-wacky": true,
	"cos-mknn-20-12130": true,
	"norm51-corpus": true,
	"cos-mknn-5-12130": true,
	"norm60-corpus-all": true,
	"raw-pukwac": true,
	"overlap-mknn-10-12130": true,
	"norm42": true,
	"cos-mknn-10-12130": true
};

var connection = mysql.createConnection({
	host     : '127.0.0.1',
	user     : 'root',
	password : 'vjybnjh78',
	database: 'lsse',
	multipleStatements: true
});

var mysqlWordsId = {};
var mongoDbWordsId = {};
connection.connect(function(err) {

	var query = connection.query( 'SELECT * FROM words');
	query.on('result', function(row) {
		mysqlWordsId["__" + row.word] = row.id;
	}).on('end', function(){
		
		var query2 = connection.query( 'SELECT * FROM models');
		query2.on('result', function(row) {
			mysqlWordsId["____" + row.name] = row.id;
		}).on('end', function(){
			
			console.log("MySQL Word loaded");


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
						return;
					}

					var cursor = wordsCollection.find().each(function(err, doc){
						if (doc == null)
						{
							console.log("Mongo DB Word loaded");

							var totalRel = 0, insertRel = 0;
							var runQuery = 0;
							db.collection('relations', function(err, relationsCollection){

								var stream = relationsCollection.find({}, {timeout: false}).stream();
								stream.on("data", function(doc) {
									if (runQuery > 10)
										stream.pause();

									var i, values = [];
									var modelId = mysqlWordsId["____" + mongoDbWordsId[doc.model]];
									var wordId = mysqlWordsId["__" + mongoDbWordsId[doc.word]];

									for(i = 0; i < doc.relations.length; i++)
									{
										values.push("(" + mysqlWordsId["__" + mongoDbWordsId[doc.relations[i].word]] + 
											", " + modelId + ", " + wordId + ", " + doc.relations[i].value + ")");
									}
									runQuery++;
									totalRel++;
									connection.query("INSERT INTO `relations` (`word`, `model`, `relation`, `value`) VALUES " + 
										values.join(", "), 
										function(err, result){
											if (err)
												console.log(err);

											runQuery--;	
											if (runQuery == 0 && stream.paused)
												stream.resume();
										}
									);
									
									if (totalRel % 100 == 0)
									{
										console.log("Insertting %d", totalRel);
									}	
								});
								stream.on("close", function() {
							       console.log("relations stream done");
								});
								// relationsCollection.find().each(function(err, doc){

								// 	if (doc == null)
								// 	{
								// 		console.log("Done");
								// 	}
								// 	else
								// 	{
								// 		var i;
								// 		var modelId = mysqlWordsId["____" + mongoDbWordsId[doc.model]];
								// 		for(i = 0; i < doc.relations.length; i++)
								// 		{
								// 			fs.appendFileSync("relations.sql", 
								// 				"INSERT INTO `relations` (`word`, `model`, `relation`) VALUES (" + 
								// 					mysqlWordsId["__" + mongoDbWordsId[doc.relations[i].word]]
								// 				+ ", " + modelId + ", " + doc.relations[i].value + ");\n");
								// 			totalRel++;
								// 			insertRel++;
								// 		}
										
								// 		if (insertRel >= 1000)
								// 		{
								// 			insertRel = 0;
								// 			console.log("Inserted %d rel", totalRel);
								// 		}
								// 	}

								// });

							});
						}
						else
						{
							mongoDbWordsId[doc.id] = doc.word;
						}
					});
				});

			});
		});
	});


	return;
	var models = JSON.parse(fs.readFileSync('./stats.json'));
	for (var name in models)
	{
		connection.query("INSERT INTO models SET ?", {
			name: name,
			words: models[name].words,
			relations: models[name].relations,
		}, function(err, result){
			console.log(err ? err : ("Insert model succsessful"));
		});
	}


	return;
	if(err) 
	{	
		console.log(err);
		return;
	}


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
				return;
			}


			
			var totalQueries = 0;
			var cursor = wordsCollection.find().each(function(err, doc){
				if (doc != null && !ignoreWords.hasOwnProperty(doc.word))
				{
					if (totalQueries % 100 == 0)
					{
						if (totalQueries != 0)
							fs.appendFileSync("insert.sql", ";\nINSERT INTO `words` (`word`, `frequency`) VALUES ");
						else
							fs.appendFileSync("insert.sql", "INSERT INTO `words` (`word`, `frequency`) VALUES ");
						fs.appendFileSync("insert.sql", " (" + connection.escape(doc.word) + ", " + (doc.freq ? doc.freq : 0) + ")");
					}
					else
						fs.appendFileSync("insert.sql", ", (" + connection.escape(doc.word) + ", " + (doc.freq ? doc.freq : 0) + ")");
					
					totalQueries++;
					

					if (totalQueries % 1000 == 0)
						console.log("Generating %d insert", totalQueries);
				}
			});
		});
	})	

});

/*

*/