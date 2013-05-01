var cfg = {
	database: {
		driver: 'SQL Server Native Client 11.0',
		server: 'tcp:127.0.0.1,1433',
		user: 'lsse',
		password : '',
		database: 'lsse',
	},
	models: {
		'norm60-corpus-all': 'en',
		'pairsfr-efreq-rnum-cfreq-pnum': 'fr'
	},
	defalutLang: 'en'
}

module.exports = cfg;