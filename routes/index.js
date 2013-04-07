
/*
 * GET home page.
 */



// exports.index = function(req, res){
// 	res.locals.useLang = req.params.db;
// 	res.locals.useLangLink = res.locals.useLang ? ('/' + res.locals.useLang) : '';
	
// 	res.render('index', {
// 		models: require('./../data_models').models,
// 		view: 'index'
// 	});
// };

exports.page = require("./page.js").page;