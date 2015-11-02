
var mysql = require('mysql');
var dbModelValues = null;
var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'root',
   database : 'lsse'
});
connection.connect();

connection.on('error', function(err){
	if(err.code == "PROTOCOL_CONNECTION_LOST"){
		var connection = mysql.createConnection({
			host     : 'localhost',
			user     : 'root',
			password : 'root',
			database : 'lsse'
		});
		connection.connect();
	} else {
		throw err;
	}
});

 var cfg = {
	database: {
		host: '127.0.0.1',
		user: 'root',
		password : 'root',
		database: 'lsse',
		multipleStatements: true
	},
	models: {
		dbModelValues:dbModelValues
	},
	images: {
		wordsExtensionsFilename: 'words_extensions.csv',
		baseUrl: 'http://panchenko.me/images/clipart/{word}{ext}',
		fallbackUrl: 'https://serelex.blob.core.windows.net/images/{word}{ext}',
	},
	defalutLang: 'en',
	samples: {
		"en": [
			"python",
			"jaguar",
			"blackberry",
			"flash",		
			"brother",
			"operating system",
			"java",
			"ruby",
			"fedora",
			"linux",
			"queen",
			"windows",
			"zurich",
			"fruit",
			"vehicle",
			"computational linguistics",
			"machine learning",
			"weapon",
			"machine gun",
			"antelope",
			"airplane",
			"mango",
			"strawberry",
			"Russia",
			"Belgium",
			"France",
			"mathematics",
			"biology",
			"moose",
			"racoon",
			"dog",
			"cat",
			"animal",
			"vegetable",
			"Moscow",
			"Stanford",
			"Brussels",
			"Vienna",
			"Berlin",
			"ferrari",
			"porsche",
			"lamborghini",
			"pizza",
			"hot dog",
			"hamburger",
			"soft drink",
			"cottage cheese",
			"local speciality"],
		"fr": [
			"France",
			"fromage",
			"mathématiques",
			"français",
			"espagnol",
			"londres",
			"pizza",
			"quiche"
		],
		"ru": [
			"\u0438\u043C\u043F\u0435\u0440\u0438\u044F",
			"\u0442\u0435\u043E\u0440\u0438\u044F",
			"\u0441\u043E\u043B\u044C"
		],
		"pt": [
			"aca\u00E7\u00E1",
			"su\u00E9cia",
			"redu\u00E7\u00E3o",
			"aachen"
		]
	}
}

function selection(callback){
	connection.query('SELECT * from models', function(err, rows) {
		
		if (!err){
			//assign(rows);
			callback(null, rows);
		}
   else
		callback(err, null);
 });
}

selection(function(err,data){
		
	if(!err){
		
		dbModelValues = data;
		data.sort(function(data1, data2){
			return data1.lang.localeCompare(data2.lang);
		});
		cfg.models.dbModelValues = data;
		
		module.exports = cfg;
	}
	else{
		console.log("Error while selecting models...: ", err);
	}
});
 
module.exports = cfg;
