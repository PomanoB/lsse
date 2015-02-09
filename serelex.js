var fs = require("fs");
var reader = require ("buffered-reader");
var DataReader = reader.DataReader;
var util = require('util');

var serelex = function() {
	this.fileName = "";
	this.relations = [];
	this.wordId = {};
	this.wordsArray = [];
	this.relationsCount = {};
	var t = this;

	this.emptyResult = [];

	this.getWordId = function(word, lang){
		var key = word + (lang || "");
		if (!this.wordId.hasOwnProperty(key))
		{
			this.wordsArray.push(word);
			return (this.wordId[key] = this.wordsArray.length - 1);
		}
		return this.wordId[key];
	}
	
	this.getWordById = function(id){
		return this.wordsArray[id];
	}

	this.setWordId = function(word, lang, id)
	{
		this.wordsArray[id] = word;
		this.wordId[word + (lang || "")] = id;
	}
	this.setWordId("", "", 0);
	
	this.addRelationship = function(word, pair, value){
		this.relations.push([word, pair, parseFloat(value)]);
		this.relationsCount++;
	}

	this.loadCSV = function(file, lang, callback){
		if (!fs.existsSync(file))
		{
			callback("File dont exsists!");
			return;
		}

		var stats = fs.statSync(file);
		if (!stats.size)
		{
			callback("Size is zero!");
			return;
		}
		var loaded, lastLoaded;
		this.relations = [];
		this.relationsCount = 0;

		new DataReader (file, { encoding: "utf8" })
			.on ("error", function (error){
				callback(error);
			})
			.on ("line", function (line, offset){
				var d = line.split(";");
				if (d.length == 3)
				{
					t.addRelationship(t.getWordId(d[0], lang), t.getWordId(d[1], lang), d[2]);
				}
				if (offset == -1)
					offset = stats.size;
				loaded = offset/stats.size*100|0;
				if (loaded != lastLoaded)
				{
					lastLoaded = loaded;
					console.log("File " + file + " loading " + loaded + "%");
				}
			})
			.on ("end", function (){
			//	this.close();
				callback(null, t.relations);
			})
			.read ();
	};

	this.getRelationships = function(word){
		// word = this.getWordId(word);
		
		// if (!this.data.hasOwnProperty(word))
		// 	return this.emptyResult;
		
		var result = [];
		// var array = this.data[word];
		// for(var i = 0; i < array.length; i++)
		// {
		// 	result.push({
		// 		"word": this.getWordById(array[i][0]), 
		// 		"value": array[i][1]
		// 	});
		// }
		return result;
	}
}

module.exports = serelex;