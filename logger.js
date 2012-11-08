var fs = require("fs");

var LsseLogger = function(logdir){
	this.logDir = logdir;
	fs.exists(logdir, function(exists){
		if (!exists)
			fs.mkdir(logdir);
	})
};
LsseLogger.prototype.pad = function (val, len) {
	val = String(val);
	len = len || 2;
	while (val.length < len)
		val = "0" + val;
	return val;
};
LsseLogger.prototype.writeLogEntry = function(data){
	var date = new Date();
	var fileName = this.logDir + '/' + this.pad(date.getDate()) + '_' + this.pad(date.getMonth() + 1) + '_' + date.getFullYear() + '.log';
	fs.appendFile(
		fileName, 
		Math.floor(data.time/1000) + ';"' + data.query.model + '/' + data.query.word + '";"' + 
		(typeof data.click == "undefined" ? '' : data.click) + '";"' +
		JSON.stringify(data.user).replace(/"/g, "\\\"") + 
		'"\n');
}

module.exports = LsseLogger;