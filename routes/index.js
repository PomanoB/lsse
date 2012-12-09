
/*
 * GET home page.
 */



exports.index = function(req, res){
  res.render('index', {
	models: require('./../data_models').models,
	view: 'index'
  });
};

exports.page = require("./page.js").page;