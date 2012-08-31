var fs = require("fs");

var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db;

var count = 5;
if (process.argv.length >= 3)
	count = parseInt(process.argv[2]);

var fileName = "access.log";
if (process.argv.length >= 4)
	fileName = process.argv[3];


var stream = fs.createWriteStream(fileName, {
	flags: 'w',
	encoding: "utf8",
	mode: 0666
});

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('serelex', server);

db.open(function(err, db) {
	if(!err) 
	{
		db.collection('words', function(err, collection) {
			if (err)
			{
				console.log(err);
				db.close();
				return;
			}
			collection.count(function(err, wordsCount) {
				if (err)
				{
					console.log(err);
					db.close();
					return;
				}
				var completedCount = 0;
				var i;
				for(i = 0; i < count; i++)
				{
					collection.find().limit(-1).skip(Math.floor(Math.random()*wordsCount)).toArray(function(err, items){
						items = items[0];
						stream.write("\"GET /find/" + items.model + "/" + encodeURIComponent(items.word) + "\n");
						if (++completedCount == count)
						{
							db.close();
							stream.end();
						}	
					});
				}
	        });
		});
	}
	else
	{
		console.log(err);
	}
});