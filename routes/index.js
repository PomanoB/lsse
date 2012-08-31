
/*
 * GET home page.
 */



exports.index = function(req, res){
  res.render('index', {
  	title: 'Lexico-Semantic Search Engine', 
  	models: require('./../data_models').models 
  });
};

exports.page = require("./page.js").page;