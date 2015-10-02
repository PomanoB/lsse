console.log("page.js")
var fs = require("fs");
var cfg = require('./../config.js');
var models = require('./../data_models').models;

var langToModel = {};
console.log("For");
for(var model in cfg.models)
{
	langToModel[ cfg.models[model] ] = model;
}
console.log("AfterFor");


var allowedPages = {
	index: {
		models: models,
		view: 'index',
		dbModels : JSON.parse(fs.readFileSync('./dbs.json'))
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

	res.locals.samples = JSON.stringify(cfg.samples[res.locals.useLang] || cfg.samples[cfg.defalutLang]);


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
console.log("Last")
exports.allowedPages = allowedPages;
