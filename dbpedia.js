var request = require('request'), fs = require('fs');
var PageRank = require('pagerank'), async = require('async');

var dbPedia = {
	
	sort: function(data, callback){
		async.parallel([
			function(callback){
				dbPedia.sortByWikipediaLength(data, callback);
			},
			function(callback){
				dbPedia.sortByPageRank(data, callback);
			}
		], function(error, sortedResult){
			// console.log(error, result);
			var pageRank = {};
			var pageLength = {};
			var i;
			for(i = 0; i < sortedResult[0].length; i++)
				pageLength[ sortedResult[0][i].word ] = sortedResult[0][i].length;
			for(i = 0; i < sortedResult[1].length; i++)
				pageRank[ sortedResult[1][i].word ] = sortedResult[1][i].pageRank;
			var resultArray = [];
			data.sort(function(a, b){
				if (pageRank[b] > pageRank[a])
					return 1;
				if (pageRank[a] > pageRank[b])
					return -1;	
				return pageLength[b] > pageLength[a];
			});
			for(i = 0; i < data.length; i++)
			{
				resultArray[i] = {
					word: data[i],
					pageRank: pageRank[ data[i] ],
					pageLength: pageLength[ data[i] ]
				};
			}
			callback(error, resultArray);
		});
	},
	sortByPageRank: function(words, callback){
		async.map(words, function(word, callback){
			new PageRank('http://en.wikipedia.org/wiki/' + word, function(error, pageRank) {
				callback(error, {
					word: word,
					pageRank: pageRank ? pageRank : 0
				});
			});
		}, function(err, result){
			if (!err)
			{
				result.sort(function(a, b){
					return b.pageRank - a.pageRank;
				});
			}
			callback(err, result);
		});
	},
	sortByWikipediaLength: function(words, callback){
		async.map(words, function(word, callback){
			
			request('http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&page=' + word, {
				headers: {'User-Agent': 'LSSE'}
			}, function (error, response, body) {
				if (!response || response.statusCode != 200)
				{
					callback(null, {word: word, length: 0});
					return;
				}
				var data
				try
				{
					data = JSON.parse(body);
				}
				catch(e)
				{
					callback(null, {word: word, length: 0});
					return;
				}
				if (data.error)
				{
					callback(null, {word: word, length: 0});
					return;
				}
				callback(null, {word: word, length: data.parse.text['*'].length});
			});
			
		}, function(err, result){
			result.sort(function(a, b){
				return b.length - a.length;
			});
			callback(err, result);
		});
	},
	getDefinition: function(word, callback, disambiguates, oldResult) {

		word = word.charAt(0).toUpperCase() + word.slice(1);
		word = word.replace(/ /g, '_');
		request('http://dbpedia.org/data/' + word + '.json', {
			headers: {'User-Agent': 'LSSE'}
		}, function (error, response, body) {
			// console.log(response.statusCode, body);
			if (response && response.statusCode == 200)
			{
				// fs.writeFileSync('3.js', body);
				var data
				try
				{
					data = JSON.parse(body);
				}
				catch(e)
				{
					callback('Invalid JSON!', null);
					return;
				}
				var name = 'http://dbpedia.org/resource/' + word;
				var i;
				if (typeof data[name] == "undefined")
				{
					callback('Not found1!', null);
					return;
				}
				if (typeof data[name]['http://dbpedia.org/ontology/wikiPageDisambiguates'] != "undefined")
				{
					var dis = [], wikiPageDisambiguates = data[name]['http://dbpedia.org/ontology/wikiPageDisambiguates'];
					for(i = 0; i < wikiPageDisambiguates.length; i++)
						dis.push(wikiPageDisambiguates[i].value.substring(28));

					if (typeof oldResult != "undefined")
					{
						oldResult.disambiguates = dis;
						callback(null, oldResult);
					}
					else
					{
						var newWord = dis[0];
						dbPedia.getDefinition(newWord, callback, dis);
					}
					return;
				}
				if (typeof data[name]['http://dbpedia.org/ontology/abstract'] == "undefined")
				{
					if (typeof data[name]["http://dbpedia.org/ontology/wikiPageRedirects"] == "undefined" || !data[name]["http://dbpedia.org/ontology/wikiPageRedirects"].length)
					{
						callback('Not found2!', null);
						return;
					}
					dbPedia.getDefinition(
						data[name]["http://dbpedia.org/ontology/wikiPageRedirects"][0].value.substring(28),
						callback
					);
					return;
				}
				var result = {
					word: word, 
					definition: {
						en: null,
						ru: null
					},
					labels: {
						en: null,
						ru: null
					}, 
					image: null, 
					disambiguates: []
				};
				var abstract = data[name]['http://dbpedia.org/ontology/abstract'];
				if (typeof disambiguates != "undefined")
					result.disambiguates = disambiguates;

				for(i = 0; i < abstract.length; i++)
				{
					if (abstract[i].lang == "en" || abstract[i].lang == "ru")
						result['definition'][abstract[i].lang] = abstract[i].value
				}
				if (typeof data[name]["http://www.w3.org/2000/01/rdf-schema#label"] != "undefined" && data[name]["http://www.w3.org/2000/01/rdf-schema#label"].length)
				{
					var langNames = data[name]["http://www.w3.org/2000/01/rdf-schema#label"];
					for(i = 0; i < langNames.length; i++)
					{
						if (langNames[i].lang == "en" || langNames[i].lang == "ru")
							result['labels'][langNames[i].lang] = langNames[i].value
					}

				}
				
				if (typeof data[name]['http://dbpedia.org/ontology/thumbnail'] != "undefined")
				{
					result['image'] = data[name]['http://dbpedia.org/ontology/thumbnail'][0].value;
				}

				if (typeof data[name + '_(disambiguation)'] != "undefined")
				{
					dbPedia.getDefinition(
						word + '_(disambiguation)',
						callback,
						undefined,
						result
					);
				}
				else
					callback(null, result);
			}
			else
				callback('Not found3!', null);
		});				
	}
}
module.exports = dbPedia;

// dbPedia.getDefinition('Linux', function(error, result){
// dbPedia.getDefinition('Morphology_(biology)', function(error, result){
// dbPedia.getDefinition('Apple', function(error, result){
	// dbPedia.sort(result, function(error, res){
		// console.log(result, res);
	// });
// })