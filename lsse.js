var ObjectID = require('mongodb').ObjectID;

var LSSE = function(){
	this.words = null;
	this.relations = null;
};

LSSE.prototype.getRelations = function(word, model, limit, callback){
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
				callback(null, null, 0);
				return;
			}
			item.word = items[wordId].word;
			item.model = items[modelId].word;

			var i, length = item.relations.length;
			var totalRelations = length;
			if (typeof limit != "undefined" && (limit = +limit) > 0)
			{
				item.relations.sort(function(a, b){
					return b.value - a.value;
				});
				item.relations.splice(limit, length - limit);
				length = item.relations.length;		
			}
				
			var loaded = 0;
			var needWords = [];
			for(i = 0; i < length; i++)
			{
				needWords.push(item.relations[i].word);
			}
			t.words.find({id: {$in: needWords}}).toArray(function(err, items){
				var i = 0, j = 0;
				var wordsLength = items.length;
				var rel = item.relations;
				for(i = 0; i < length; i++)
				{
					for(j = 0; j < wordsLength; j++)
					{
						if (items[j].id == rel[i].word)
						{
							rel[i].word = items[j].word;
							items.splice(j, 1);
							wordsLength--;
						}
					}
				}
				callback(null, item, totalRelations);
			});
		});
	});
};
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
	db.collection('words', this.lsse.wordsOpened.bind({
		callback: this.callback,
		lsse: this.lsse,
		db: db
	}));
};
LSSE.prototype.wordsOpened = function(err, collection) {
	if (err)
	{
		this.callback(err);
		return;
	}
	this.lsse.words = collection;
	this.db.collection('relations', this.lsse.relationsOpened.bind({
		callback: this.callback,
		lsse: this.lsse,
		db: this.db
	}));
};
LSSE.prototype.relationsOpened = function(err, collection) {
	if (err)
	{
		this.callback(err);
		return;
	}
	this.lsse.relations = collection;
	this.callback(null);
};

LSSE.prototype.suggest = function(word, limit, callback)
{

	this.words.find({word: new RegExp('^'+ word.replace(/[^a-zA-Z0-9]/, ''))}, {word: 1, freq: 1})
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

module.exports = LSSE;