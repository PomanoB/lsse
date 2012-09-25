var sax = require("sax");
var fs = require("fs");
var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db;


var fileName = process.argv[2] || "data/dela-en-public-u8.dic.xml";


var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('serelex2', server);

db.open(function(err, db) {
	if(err) 
	{
		console.log(err);
		return;
	}

	db.createCollection('lemms', function(err, collection){
		if(err) 
		{
			console.log(err);
			db.close();
			return;
		}

		var saxStream = sax.createStream(true);


		var numberLemms = 0;

		var currentTag = 0;
		var currentEntry = {}
		var TagsTypes = {
			"entry": 1,
			"lemma": 2,
			"form": 3
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
				
				collection.insert(currentEntry);

				if (++numberLemms % 5000 == 0)
				{
					console.log("Insertnig %d entryes...", numberLemms);
				}
			}
			currentTag = 0;
		});
		saxStream.on("text", function (text) {

			switch (currentTag)
			{
				case TagsTypes["lemma"]:
					currentEntry = {
						lemma: text,
						forms: []
					};
					break;
				case TagsTypes["form"]:
					if (currentEntry.forms.indexOf(text) == -1)
						currentEntry.forms.push(text);
					break;
			}
		});
		saxStream.on("end", function(){
			console.log("Done!");
		});

		fs.createReadStream(fileName).pipe(saxStream);

	});
});