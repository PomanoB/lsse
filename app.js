var express = require('express')
	, routes = require('./routes')
	, http = require('http');
	
var LSSE = require('./lsse');
var lsse = new LSSE();
	
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
	lsse.getRelations(req.params.word.toLowerCase(), req.params.model.toLowerCase(), function(err, item) {
		var result = [];
		if (err)
		{
			console.log(err);
		}
		else if (item != null)
		{
			result = item.relations;
		}
		res.send({result: result});
	})
});

var dataModels = require('./data_models').models;

var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('serelex2', server);

lsse.openDb(db, function(err){
	if (err)
	{
		console.log(err);
		return;
	}
	
	var server = http.createServer(app);

	server.listen(app.get('port'), function(){
		console.log("Express server listening on port " + app.get('port'));
	});
	var io = require('socket.io').listen(server);
	io.set('log level', 3); // 0 - error, 1 - warn, 2 - info, 3 - debug
	
	io.sockets.on('connection', function (socket) {
		socket.on('get relationships', function (data) {
			lsse.getRelations(data.word.toLowerCase(), data.model.toLowerCase(), function(err, item){
				var result;
				if (err)
				{
					console.log(err);
					result = [];
				}
				else
					result = item ? item.relations : [];
				socket.emit('result', { result: result });
			});
		});
	});
});
