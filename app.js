var express = require('express')
	, routes = require('./routes')
	, http = require('http');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 80);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

var wordsCollection = null;

app.get('/', routes.index);
app.get('/page/:page', routes.page);
app.get('/find/:model/:word', function(req, res){
	if (wordsCollection == null)
	{
		res.send([]);
		return;
	}
	wordsCollection.findOne({
		word: req.params.word.toLowerCase(),
		model: req.params.model.toLowerCase()
	}, function(err, item) {
		var result = [];
		if (err)
		{
			console.log(err);
		}
		else if (item != null)
		{
			result = item.relations;
		}
		res.send(result);
	});
});

var dataModels = require('./data_models').models;

var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('serelex', server);

db.open(function(err, db) {
	if(!err) 
	{
		db.collection('words', function(err, collection) {
			if (err)
			{
				console.log(err);
				return;
			}
			wordsCollection = collection;

			var server = http.createServer(app);

			server.listen(app.get('port'), function(){
				console.log("Express server listening on port " + app.get('port'));
			});
			var io = require('socket.io').listen(server);

			io.sockets.on('connection', function (socket) {
				socket.on('get relationships', function (data) {

					collection.findOne({
						word: data.word.toLowerCase(),
						model: data.model.toLowerCase()
					}, function(err, item) {
						var result = [];
						if (err)
						{
							console.log(err);
						}
						else if (item != null)
						{
							result = item.relations;
						}
						socket.emit('result', { result: result });
					});
				});
			});

		});
	}
	else
	{
		console.log(err);
		return;
	}
});

