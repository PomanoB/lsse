
/*
 * GET home page.
 */



exports.index = function(req, res){
	res.locals.useDb = req.params.db;
	res.locals.useDbLink = res.locals.useDb ? ('/' + res.locals.useDb) : '';
	
	res.render('index', {
		models: require('./../data_models').models,
		view: 'index'
	});
};

exports.page = require("./page.js").page;