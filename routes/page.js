var fs = require("fs");
var cfg = require('./../config.js');
var models = require('./../data_models').models;

var langToModel = {}
for(var model in cfg.models)
{
	langToModel[ cfg.models[model] ] = model;
}

var allowedPages = {
	index: {
		models: models,
		view: 'index'
	},
	about: {
		view: "about"
	},
	advanced: {
		view: "advanced",
		models: models,
		modelStats: JSON.parse(fs.readFileSync('./stats.json'))
	},
	images: {
		view: "images",
		models: models,
	},
	download: {
		view: "download"
	},
	contacts: {
		view: "contacts"
	}
};

exports.page = function(req, res){
	res.locals.useLang = req.params.lang;
	res.locals.useModel = langToModel[req.params.lang || cfg.defalutLang];

	res.locals.useLangLink = res.locals.useLang ? ('/' + res.locals.useLang) : '';

	if (typeof req.params.page == "undefined")
		req.params.page = "index";

	if (typeof allowedPages[req.params.page] != "undefined")
		res.render(allowedPages[req.params.page].view, allowedPages[req.params.page]);
	else
	{
		res.status(404);
		res.send();
	}	
};
exports.allowedPages = allowedPages;