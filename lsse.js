var async = require("async");
var Trie = require("./tree");
var fs = require('fs');
var obj;
fs.readFile('dbs.json', 'utf8', function (err, data) {
  if (err) throw err;
  obj = JSON.parse(data);
});
var LSSE = function(){
	
	this.connection = null;

	this.searchTree = new Trie();
};

LSSE.prototype.correctWord = function(word, cost){
	var results = this.searchTree.search(word, cost);

	results.sort(function(a, b){
		return a.cost - b.cost;
	});
	return results;
}

LSSE.prototype.loadTree = function(callback){

	// callback();
	// return;
	var query = this.connection.query('SELECT word FROM `words`');
	query
	.on('result', function(row) {
		this.searchTree.insert(row.word);
	}.bind(this))
	.on('end', function() {
		callback();
	})
	.on('error', function(err){
		callback(err);
	});
/*
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
*/
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

	this.connection.query(
		"SELECT w.word FROM lemms l " +
		"INNER JOIN words w ON w.id = l.word AND w.lang = ? " +
		"WHERE l.lemm = (SELECT id FROM words WHERE word = ? AND lang = ?)", [lang, word, lang], 
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
	/*var actual_model = "";
	console.log("Null Models:"+model.length);
	console.log("Lang:"+lang);
	if(model.length==0){
		console.log("Index1:");
		console.log("Name:"+obj[0].name);
		model = obj[0].name;
		lang = obj[0].lang;

	}else{
        	console.log("Index>1");
		for(var i=3;i<model.length;i++){
			actual_model = actual_model + model[i];
		}
		console.log("Actual Model:"+actual_model);
		model = actual_model;
                
	}*/
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
	//console.log("Model is:"+ model);
	if(model.length==0){
		//console.log("Model Length==0");
		//console.log("Name:"+obj[0].name);
		//console.log("Lang:"+lang);
		model = obj[0].name;
		lang = obj[0].lang;

	}
	//console.log("Loading Relations..Model:"+model);
	//console.log("Lang:"+lang);
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
	this.connection.connect((function(err) {
		this.loadTree(callback);
		// t.callback(null);
		// callback(err);
	}).bind(this));
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
