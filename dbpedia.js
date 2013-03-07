var request = require('request'), fs = require('fs');

var dbPedia = {

	getDefinition: function(word, callback, disambiguates) {

		word = word.charAt(0).toUpperCase() + word.slice(1);
		word = word.replace(/ /g, '_');
		request('http://dbpedia.org/data/' + encodeURIComponent(word) + '.json', {
			headers: {'User-Agent': 'LSSE'}
		}, function (error, response, body) {
			// console.log(response.statusCode, body);
			if (response.statusCode == 200)
			{
				var data = JSON.parse(body);
				var name = 'http://dbpedia.org/resource/' + word;
				if (typeof data[name] == "undefined")
				{
					callback('Not found1!', null);
					return;
				}
				if (typeof data[name]['http://dbpedia.org/ontology/wikiPageDisambiguates'] != "undefined")
				{
					var dis = [], i, wikiPageDisambiguates = data[name]['http://dbpedia.org/ontology/wikiPageDisambiguates'];
					for(i = 0; i < wikiPageDisambiguates.length; i++)
						dis.push(wikiPageDisambiguates[i].value.substring(28));

					var newWord = dis[0];
					dbPedia.getDefinition(newWord, callback, dis);
					return;
				}
				if (typeof data[name]['http://dbpedia.org/ontology/abstract'] == "undefined")
				{
					callback('Not found2!', null);
					return;
				}
				var result = {word: word, en: null, ru: null, image: null, disambiguates: []}, i, abstract = data[name]['http://dbpedia.org/ontology/abstract'];
				if (typeof disambiguates != "undefined")
					result.disambiguates = disambiguates;

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
				callback('Not found3!', null);
		});				
	}
}
module.exports = dbPedia;

// dbPedia.getDefinition('Linux', function(error, result){
// dbPedia.getDefinition('Morphology_(biology)', function(error, result){
// dbPedia.getDefinition('Morphology', function(error, result){
	// console.log(error, result);
// })