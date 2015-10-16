//var dropdown = require('./dd.js');

var mysql = require('mysql');
var dbModelValues = null;
var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'root',
   database : 'lsse'
});
connection.connect();

 var cfg = {
	database: {
		host: '127.0.0.1',
		user: 'root',
		password : 'root',
		database: 'lsse',
		multipleStatements: true
	},
	models: {
		/*'norm60-corpus-all': 'en',
		'pairsfr-efreq-rnum-cfreq-pnum': 'fr',
		'ru-wiki': 'ru'*/
		//dbModels: dbModelValues
		dbModelValues:dbModelValues
	},
	images: {
		wordsExtensionsFilename: 'words_extensions.csv',
		baseUrl: 'https://serelex.blob.core.windows.net/images/{word}{ext}',
		fallbackUrl: 'http://{word}.jpg.to',
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
			"империя",
			"теория",
			"соль"
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
		cfg.models.dbModelValues = data;
		
		module.exports = cfg;
	}
	else{
		console.log("Error while selecting models...");
	}
});
 


module.exports = cfg;
