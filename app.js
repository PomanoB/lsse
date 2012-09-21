var express = require('express')
	, routes = require('./routes')
	, http = require('http')
	, lingua  = require('lingua');
	
var LSSE = require('./lsse');
var lsse = new LSSE();

var LsseLogger = require('./logger');
var logger = new LsseLogger('logs');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 80);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');

	// Lingua configuration
    app.use(lingua(app, {
		defaultLocale: 'en',
		path: __dirname + '/i18n'
	}));

	app.use(function(req, res, next){
		res.locals.locale = res.lingua.locale;
		next();
	});

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

	lsse.getBestRelations(req.params.word.toLowerCase(), req.params.model.toLowerCase(), 0, function(err, item) {
		var result = null;

		if (err)
		{
			console.log(err);
		}
		else if (item)
		{
			result = item;
		}
		res.send(result);
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
	io.set('log level', 1); // 0 - error, 1 - warn, 2 - info, 3 - debug
	
	io.sockets.on('connection', function (socket) {
		socket.on('get relationships', function (data) {
			lsse.getBestRelations(data.word.toLowerCase(), data.model.toLowerCase(), data.limit, function(err, item){

				var result;
				if (err)
				{
					result = {totalRelations: 0};
				}
				else if (item)
					result = item;
				socket.emit('result', item);
			});
		});

		socket.on('log', function (data) {
			logger.writeLogEntry(data);
		});

		socket.on('suggest', function (data) {
			lsse.suggest(data.word.toLowerCase(), 10, function(words){
				socket.emit('suggest result', words);
			})
		});
	});
});
