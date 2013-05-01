var async = require("async");
var Trie = require("./tree");

var LSSE = function(){
	
	this.connection = null;

	this.searchTree = new Trie();
};

LSSE.prototype.correctWord = function(word, cost){
	return [];
	var results = this.searchTree.search(word, cost);

	results.sort(function(a, b){
		return a.cost - b.cost;
	});
	return results;
}

LSSE.prototype.loadTree = function(callback){
	callback();
	return;
	var t = this;
	this.words.find().sort({word: 1}).toArray(function(err, items){
		if(err) 
		{
			callback(err);
			return;
		}
		var i;
		for(i = 0; i < items.length; i++)
		{
			t.searchTree.insert(items[i].word);
		}
		
		callback();
	});
}

LSSE.prototype.getPerhaps = function(word){
	var words = word.trim().split(/\s+/);
	var i, j, k, len = words.length;
	
	var currWord;
	for(i = 2; i < len; i++)
	{
		for(j = 0; j <= len - i; j++)
		{
			currWord = "";
			for(k = 0; k < i; k++)
				currWord += (" " + words[j + k]);
			words.push(currWord.trim());
		}
	}

	return words;
}

LSSE.prototype.getLemma = function(word, lang, callback){

	var query = "SELECT w.word FROM lsse.lemms l " +
		"INNER JOIN lsse.words w ON w.id = l.word AND w.lang = ? " +
		"WHERE l.lemm = (SELECT id FROM lsse.words WHERE word = ? AND lang = ?)";
	
	this.connection.query(query, [lang, word, lang], 
		function(err, results) {
			if (err)
			{
				console.log(err, word);
				callback(err, []);
			}

			callback(null, results.map(function(item){
				return item.word;
			}));
		}
	);
};

LSSE.prototype.getBestRelations = function(word, model, lang, limit, skip, callback){
	var t = this;

	this.getLemma(word, lang, function(err, lemms){
		if (lemms.length == 0)
			 lemms = [word];
		else if (lemms.indexOf(word) == -1)
			lemms.unshift(word);

		async.map(lemms, function(lemma, callback){
			t.loadRelations(lemma, model, lang, limit, skip, callback);
		}, function(err, results){
			if (err)
			{
				callback(err);
				return;
			}
			var maxResuls = 0;
			var maxNumber = -1;
			var i;

			for(i = 0; i < results.length; i++)
			{
				if (results[i] && results[i].totalRelations > maxResuls)
				{
					maxResuls = results[i].totalRelations;
					maxNumber = i;
				}
			}
			if (maxNumber == -1)
			{
				callback(null, null);
				return;
			}
			callback(null, results[maxNumber]);
		});
	});
}

LSSE.prototype.loadRelations = function(word, model, lang, limit, skip, callback){
	var t = this;

	var query = " \
DECLARE @word INT; \
DECLARE @model INT; \
SELECT TOP 1 @word = id \
FROM lsse.words \
WHERE word = ? AND lang = ?; \
SELECT TOP 1 @model = id \
FROM lsse.models \
WHERE name = ?; \
SELECT COUNT(*) AS total FROM lsse.relations r INNER JOIN lsse.words w ON w.id = r.relation WHERE r.word = @word AND r.model = @model; \
SELECT w.word, r.value \
FROM lsse.relations r \
INNER JOIN lsse.words w \
ON w.id = r.relation \
WHERE r.word = @word AND r.model = @model \
ORDER BY r.value DESC \
OFFSET ? ROWS FETCH NEXT ? ROWS ONLY; \
";
	
	var total = 0;
	
	this.connection.query(query, [word, lang, model, skip|0, limit|20], function(err, results, more) {
		
		if (err)
		{
			callback(err);
			return;
		}

		if(more) // First query
		{
			total = results[0].total;
		}
		else // Second query with results
		{
			var result = {
				word: word,
				model: model,
				totalRelations: total,
				relations: []
			}
			var i;
			for(i = 0; i < results.length; i++)
			{
				result.relations.push({
					word: results[i].word,
					value: results[i].value
				});
			}
			
			callback(null, result);
		}
	});
};

LSSE.prototype.openDb = function(msnodesql, connStr, callback){

	msnodesql.open(connStr, (function (err, conn) {
		this.connection = conn;
		
		setInterval((function(){
			this.connection.query("SELECT 1",function(err, result){console.log("Ping DB!");});
		}).bind(this), 1000 * 60 * 25);		
		
		callback(err);
	}).bind(this));	
};

LSSE.prototype.suggest = function(word, lang, limit, callback)
{
	word = word.replace(/[%_']/g, '');
	var query = "SELECT ";
	if (limit)
		query += " TOP " + (limit|20);
		
	query += " word FROM lsse.words WHERE lang = ? AND word LIKE '" + word + "%' ORDER BY frequency DESC";
	
	this.connection.query(query, [lang], function(err, results){
		if (err)
			callback([]);
		else
			callback(results);
	});	
}

module.exports = LSSE;
