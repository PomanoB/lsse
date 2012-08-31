var fs = require("fs");
var BufferedReader = require("buffered-reader");
var util = require('util');

var serelex = function() {
	this.fileName = "";
	this.data = {};
	this.wordId = {};
	this.wordsArray = [];
	
	var t = this;

	this.emptyResult = [];
	
	this.getWordId = function(word){
		var key = word + "13ashdf";
		if (typeof this.wordId[key] == "undefined")
		{
			this.wordsArray.push(word);
			return (this.wordId[key] = this.wordsArray.length - 1);
		}
		return this.wordId[key];
	}
	
	this.addRelationship = function(alias, word, pair, value){
		if (typeof this.data[alias][word] == "undefined")
			this.data[alias][word] = [];
		this.data[alias][word].push([pair, parseFloat(value)]);
	}

	this.loadCSV = function(file, alias, callback){
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
		this.data[alias] = {};

		new BufferedReader (file, { encoding: "utf8" })
			.on ("error", function (error){
				callback(error);
			})
			.on ("line", function (line, offset){
				var d = line.split(";");
				if (d.length == 3)
				{
					t.addRelationship(alias, t.getWordId(d[0]), t.getWordId(d[1]), d[2]);
				}
				if (offset == -1)
					offset = stats.size;
				loaded = Math.floor(offset/stats.size*100);
				if (loaded != lastLoaded)
				{
					lastLoaded = loaded;
					console.log("File " + file + " loading " + loaded + "%");
				}
			})
			.on ("end", function (){
				this.close();
				callback(false);
			})
			.read ();
	};

	this.getRelationships = function(alias, word){
		word = this.getWordId(word);
		
		if (typeof this.data[alias] == "undefined" || typeof this.data[alias][word] == "undefined")
			return this.emptyResult;
		
		var result = [];
		var array = this.data[alias][word];
		for(var i = 0; i < array.length; i++)
		{
			result.push({
				"word": this.wordsArray[array[i][0]], 
				"value": array[i][1]
			});
		}
		return result;
	}
}

exports.serelex = serelex;