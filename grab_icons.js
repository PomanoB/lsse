var request = require('request');
var fs = require("fs");
var async = require("async");

var dir = "public/svg/";
var timeOut = 10000; // 10 sec.

var iconsCount = 0;

var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db;

if (!fs.existsSync(dir))
	fs.mkdirSync(dir);

// 0 - start page, null to disable download
downloadIcons(0, function(){
	console.log("Start updating database");
	
	var server = new Server('localhost', 27017, {auto_reconnect: true});
	var db = new Db('serelex2', server);
	
	db.open(function(err, db) {
		if(err) 
		{
			console.log(err);
			return;
		}
		
		db.collection('words', function(err, wordsCollection){
			if(err) 
			{
				console.log(err);
				db.close();
				return;
			}
			
			fs.readdir(dir, function(err, files){
				var i, fileName;
				var icons = [];
				for(i = 0; i < files.length; i++)
				{
					if (files[i].substring(files[i].length - 4, files[i].length) == ".svg")
					{
						icons.push(files[i].substring(0, files[i].length - 4));
					}
				}
				wordsCollection.update({word: {$in: icons}}, {$set:{icon: true}}, {multi: true}, function(){
					console.log("Update completed!");
					db.close();
				});
			});
		});
	});
});

/**
 * Download icons
 * @param number start page, null to disabled download
 * @param callback callback, called before download, or immediately if number is null
 */
function downloadIcons(number, callback)
{
	if (number === null)
	{
		callback();
		return;
	}
	console.log("Start fetching page", number);
	
	request('http://thenounproject.com/en-us/retrieve/partial/' + number + '/?svg=true', function (error, response, body) {
		
		if (response.statusCode != 500)
		{
			var result;
			var iconRegExp = /<div id="icon-(\d+)" class="noun ">[\s\S]*?(<svg[\s\S]*?<\/svg>)[\s\S]*?<a class="noun-name" href="\/noun.*">(.*)<\/a>/gim;
			
			while ((result = iconRegExp.exec(body)) != null)
			{
				iconsCount++;
				fs.writeFile(dir + result[3].toLowerCase() + ".svg", result[2]);
			}
			
			console.log("Done fetching page", number);
			
			setTimeout(downloadIcons, timeOut, number + 1, callback);
		}
		else
		{
			console.log("Done! Total", iconsCount, "icons downlaoded");
			callback()
		}
	});
}