var allowedPages = {
	about: {
		title: "About",
		view: "about"
	}
};

exports.page = function(req, res){
	if (typeof req.params.page != "undefined" && typeof allowedPages[req.params.page] != "undefined")
		res.render(allowedPages[req.params.page].view, allowedPages[req.params.page]);
	else
		res.status(404);
};