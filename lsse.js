var async = require("async");
var Trie = require("./tree");

var ObjectID = require('mongodb').ObjectID;

var LSSE = function(){
	this.words = null;
	this.relations = null;
	this.lemms = null;
	this.relevance = null;

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

LSSE.prototype.getBestRelations = function(word, model, limit, skip, callback){
	var t = this;

	this.getLemma(word, function(err, lemms){
		if (lemms.length == 0)
			 lemms = [word];
		else if (lemms.indexOf(word) == -1)
			lemms.unshift(word);

		async.map(lemms, function(lemma, callback){
			t.loadRelations(lemma, model, callback);
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
			var item = results[maxNumber];
			if (typeof limit != "undefined" && (limit = +limit) > 0)
			{
				item.relations.sort(function(a, b){
					return b.value - a.value;
				});
				item.relations.splice(0, skip);
				item.relations.splice(limit, item.totalRelations - limit);
			}

			t.loadRelationsWords(item, function(err){
				if (err)
				{
					callback(err)
					return;
				}
				callback(null, item);
			});
		});
	});
}

LSSE.prototype.getRelations = function(word, model, limit, skip, callback){
	var t = this;
	this.loadRelations(word, model, function(err, item){
		if (err)
		{
			callback(err)
			return;
		}
		if (!item)
		{
			callback(null, null);
			return;
		}
		if (typeof limit != "undefined" && (limit = +limit) > 0)
		{
			item.relations.sort(function(a, b){
				return b.value - a.value;
			});

			item.relations.splice(0, skip);
			item.relations.splice(limit, item.totalRelations - limit - skip);
		}

		t.loadRelationsWords(item, function(err){
			if (err)
			{
				callback(err)
				return;
			}
			callback(null, item);
		});
	});
};

LSSE.prototype.loadRelations = function(word, model, callback){
	var t = this;

	this.words.find({word: {$in: [word, model]}}).toArray(function(err, items){

		if (err)
		{
			callback(err)
			return;
		}

		var i, wordId = -1, modelId = -1;
		for(i = 0; i < items.length; i++)
		{
			if (items[i].word == word)
				wordId = i;
			else
			if (items[i].word == model)
				modelId = i;
		}
		if (wordId < 0 || modelId < 0)
		{
			callback(null);
			return;
		}
		t.relations.findOne({word: items[wordId].id, model: items[modelId].id}, function(err, item){
			
			if (err)
			{
				callback(err)
				return;
			}

			if (!item)
			{
				callback(null, null);
				return;
			}
			item.word = items[wordId].word;
			item.model = items[modelId].word;
			item.totalRelations = item.relations.length;

			callback(null, item);
		});
	});
};

LSSE.prototype.loadRelationsWords = function(item, callback){
	var needWords = [];
	var rel = item.relations;
	for(i = 0; i < rel.length; i++)
	{
		needWords.push(rel[i].word);
	}
	this.words.find({id: {$in: needWords}}).toArray(function(err, items){
		if (err)
		{
			callback(err);
			return;
		}
		var i = 0, j = 0;
		var wordsLength = items.length;
		var length = item.relations.length;

		for(i = 0; i < length; i++)
		{
			for(j = 0; j < wordsLength; j++)
			{
				if (items[j].id == rel[i].word)
				{
					rel[i].word = items[j].word;
					rel[i].icon = !!items[j].icon;
					
					items.splice(j, 1);
					wordsLength--;
				}
			}
		}
		
		callback(null);
	});
}

LSSE.prototype.openDb = function(database, callback){

	database.open(this.dbOpened.bind({
		callback: callback,
		lsse: this
	}));
};
LSSE.prototype.dbOpened = function(err, db){
	if (err)
	{
		this.callback(err);
		return;
	}

	var t = this;
	var collestions = ['words', 'relations', 'lemms', 'relevance'];
	async.map(collestions, db.createCollection.bind(db), function(err, results){
		if (err)
		{
			t.callback(err);
			return;
		}
		var i;
		for(i = 0; i < collestions.length; i++)
		{
			t.lsse[collestions[i]] = results[i];
		}

		t.lsse.loadTree(t.callback)
	//	t.callback(null);
	});
};

LSSE.prototype.suggest = function(word, limit, callback)
{

	this.words.find({word: new RegExp('^'+ word.replace(/[^a-zA-Z0-9\s]/, ''))}, {word: 1, freq: 1})
				.sort({freq: -1, word: 1}).limit(limit).toArray(function(err, items){
		if (err)
		{
			callback([])
			return;
		}
		var result = [];
		for(var i = 0; i < items.length; i++)
		{
			result.push(items[i].word);
		}
		callback(result);
	});
}

LSSE.prototype.saveRelevance = function(word, model, relevance, user){
	this.relevance.insert({
		word: word, 
		model: model, 
		relevance: relevance,
		user: user
	});
}

module.exports = LSSE;