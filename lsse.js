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

LSSE.prototype.getLemma = function(word, callback){

	callback(null, []);
	return;
	this.lemms.find({forms: word}).toArray(function(err, items){
		if (err)
		{
			callback(err, []);
			return;
		}
		var lemms = [];
		var i;
		for(i = 0; i < items.length; i++)
		{
			lemms.push(items[i].lemma);
		}
		callback(null, lemms);
	});
};

LSSE.prototype.getBestRelations = function(word, model, lang, limit, skip, callback){
	var t = this;

	this.getLemma(word, function(err, lemms){
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

	var query = "\
	SELECT SQL_CALC_FOUND_ROWS w.word, r.value\
	FROM relations r\
	INNER JOIN words w  ON w.id = r.relation\
	WHERE r.word = (SELECT id FROM words WHERE word = ? AND lang = ? LIMIT 1)\
		AND\
	r.model = (SELECT id FROM models WHERE name = ? LIMIT 1)\
	ORDER BY r.value DESC ";
	if (skip >= 0)
		query += "LIMIT ?, ?";
	else
	if (limit >= 0)
		query += "LIMIT ?";
	query += "; SELECT FOUND_ROWS() AS `total`";
	
	this.connection.query(query, [word, lang, model, skip|0, limit|0], function(err, results) {
 		
 		if (err)
 		{
 			callback(err);
 			return;
 		}
 		var result = {
 			word: word,
 			model: model,
 			totalRelations: results[1][0].total,
 			relations: []
 		}
 		var i;
 		for(i = 0; i < results[0].length; i++)
 		{
 			result.relations.push({
 				word: results[0][i].word,
 				value: results[0][i].value
 			});
 		}
 		callback(null, result);
	});
};

LSSE.prototype.openDb = function(connection, callback){

	this.connection = connection;
	this.connection.connect(function(err) {
	//	t.lsse.loadTree(t.callback)
		// t.callback(null);
		callback(err);
	});
};

LSSE.prototype.suggest = function(word, lang, limit, callback)
{
	word = word.replace(/[%_']/g, '');
	var query = "SELECT word FROM words WHERE lang = ? AND word LIKE '" + word + "%' ORDER BY frequency DESC";
	if (limit)
		query += " LIMIT " + (limit|0);
	this.connection.query(query, [lang], function(err, results){
		if (err)
			callback([]);
		else
			callback(results);
	});	
}

module.exports = LSSE;
