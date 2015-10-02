var cfg = {
	database: {
		host: '127.0.0.1',
		user: 'root',
		password : 'root',
		database: 'lsse',
		multipleStatements: true
	},
	models: {
		'norm60-corpus-all': 'en',
		'pairsfr-efreq-rnum-cfreq-pnum': 'fr',
		'ru-wiki': 'ru'
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

module.exports = cfg;
