var LSSE = function(socket, apiAdress)
{
	this.search = function(word, model, callback){
		if (socket)
		{
			socket.once('result', callback);
			socket.emit('get relationships', { word: word, model: model});
		}
		else
			$.getJSON(apiAdress + '/' + model + '/' + word).success(callback);
	}
}