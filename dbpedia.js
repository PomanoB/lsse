var request = require('request'), fs = require('fs');

var dbPedia = {

	getDefinition: function(word, callback) {

		word = word.charAt(0).toUpperCase() + word.slice(1);
		word = word.replace(/ /g, '_');
		request('http://dbpedia.org/data/' + encodeURIComponent(word) + '.json', {
			headers: {'User-Agent': 'LSSE'}
		}, function (error, response, body) {
			if (response.statusCode == 200)
			{
				var data = JSON.parse(body);
				var name = 'http://dbpedia.org/resource/' + word;
				if (typeof data[name] == "undefined")
				{
					callback('Not found!', null);
					return;
				}
				if (typeof data[name]['http://dbpedia.org/ontology/wikiPageDisambiguates'] != "undefined")
				{
					var newWord = data[name]['http://dbpedia.org/ontology/wikiPageDisambiguates'][0]['value'].substring(28);
					dbPedia.getDefinition(newWord, callback);
					return;
				}
				if (typeof data[name]['http://dbpedia.org/ontology/abstract'] == "undefined")
				{
					callback('Not found!', null);
					return;
				}
				var result = {word: word, en: null, ru: null, image: null}, i, abstract = data[name]['http://dbpedia.org/ontology/abstract'];
				for(i = 0; i < abstract.length; i++)
				{
					if (abstract[i].lang == "en" || abstract[i].lang == "ru")
						result[abstract[i].lang] = abstract[i].value
				}
				if (typeof data[name]['http://dbpedia.org/ontology/thumbnail'] != "undefined")
				{
					result['image'] = data[name]['http://dbpedia.org/ontology/thumbnail'][0].value;
				}
				callback(null, result);
				// console.log(body);
				// fs.writeFileSync('3.js', body);
			}
			else
				callback('Not found!', null);
		});				
	}
}
module.exports = dbPedia;

// dbPedia.getDefinition('Linux', function(error, result){
// // dbPedia.getDefinition('Morphology_(biology)', function(){
// // dbPedia.getDefinition('Morphology', function(){
// 	console.log(arguments);
// })