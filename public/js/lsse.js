var LSSE = function(socket, apiAdress)
{
	this.lastQuery = {
		model: null,
		word: null
	}
	this.queryTime = 0;
	this.logCompleted = true;

	this.suggestResults = {};

	this.search = function(word, model, limit, callback){

		if (!this.logCompleted)
		{
			this.completeLog();
		}
		this.lastQuery.model = model;
		this.lastQuery.word = word;
		this.queryTime = (new Date()).getTime();
		this.logCompleted = false;

		if (socket)
		{
			socket.once('result', callback);
			socket.emit('get relationships', { word: word, model: model, limit: limit});
		}
		else
			$.getJSON(apiAdress + '/' + model + '/' + word).success(callback);
	}

	this.completeLog = function(click){
		if (!socket)
			return;
		this.logCompleted = true;
		socket.emit('log', { query: this.lastQuery, time: this.queryTime, click: click});
	}

	this.suggest = function(word, callback){
		var key = word + "un12";
		
		if (typeof this.suggestResults[key] == "undefined")
		{
			var t = this;
			socket.once('suggest result', function(words){
				t.suggestResults[key] = words;
				callback(words);
			});
			socket.emit('suggest', { word: word});
		}
		else
			callback(this.suggestResults[key]);
	}
}