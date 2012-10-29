var async = require('async');

function TrieNode()
{
	this.word = null;
	this.edges = {};
}
TrieNode.prototype.insert = function(word){
	var c, i, len = word.length;
	var node = this;
	for(i = 0; i < len; i++)
	{
		c = word.charAt(i);
		if (!node.edges[c])
			node = (node.edges[c] = new TrieNode());
		else
			node = node.edges[c];
	}
	node.word = word;
}
TrieNode.prototype.search = function(word, maxCost){
	var currentRow = Array(word.length + 1);
	var i;
	for(i = 0; i <= word.length; i++)
		currentRow[i] = i;
	
	var letter;
	var results = [];
	for(letter in this.edges)
	{
		this.searchRecursive(this.edges[letter], letter, word, currentRow, results, maxCost);
	}

	return results;
}

TrieNode.prototype.searchAsync = function(word, maxCost, callback){
	var currentRow = Array(word.length + 1);
	var i;
	for(i = 0; i <= word.length; i++)
		currentRow[i] = i;
	
	var letter;
	var results = [];

	var callsCount = 0;

	var q;
	q = async.queue(function (task, callback) {
		var columns = word.length + 1;
		var currentRow = [ task.previousRow[0] + 1 ];
		var column = 0;
		var insertCost = 0;
		var deleteCost = 0;
		var replaceCost = 0;

		for(column = 1; column < columns; column++)
		{
			insertCost = currentRow[column - 1] + 1;
			deleteCost = task.previousRow[column] + 1;

			if (word[column - 1] != task.letter)
				replaceCost = task.previousRow[column - 1] + 1;
			else
				replaceCost = task.previousRow[column - 1];

			currentRow.push(Math.min(insertCost, deleteCost, replaceCost));
		}

		if (currentRow[currentRow.length - 1] <= maxCost && task.node.word != null)
			results.push({word: task.node.word, cost: currentRow[currentRow.length - 1]});

		if (Math.min.apply(Math, currentRow) <= maxCost)
		{
			var c;
			for(c in task.node.edges)
			{
				q.push({
					node: task.node.edges[c],
					letter: c,
					previousRow: currentRow
				});
			}
		}
		if (callsCount++ < 5)
			callback()
		else
		{
			callsCount = 0;
			process.nextTick(callback);
		}
	}, 5000);

	q.drain = function() {
		
	    callback(results);
	};

	for(letter in this.edges)
	{
		q.push({
			node: this.edges[letter],
			letter: letter,
			previousRow: currentRow
		});
		// this.searchRecursive(this.edges[letter], letter, word, currentRow, results, maxCost);
	}
}

TrieNode.prototype.searchRecursive = function(node, letter, word, previousRow, results, maxCost){
	var columns = word.length + 1;
	var currentRow = [ previousRow[0] + 1 ];
	var column = 0;
	var insertCost = 0;
	var deleteCost = 0;
	var replaceCost = 0;

	for(column = 1; column < columns; column++)
	{
		insertCost = currentRow[column - 1] + 1;
		deleteCost = previousRow[column] + 1;

		if (word[column - 1] != letter)
			replaceCost = previousRow[column - 1] + 1;
		else
			replaceCost = previousRow[column - 1];

		currentRow.push(Math.min(insertCost, deleteCost, replaceCost));
	}

	if (currentRow[currentRow.length - 1] <= maxCost && node.word != null)
		results.push({word: node.word, cost: currentRow[currentRow.length - 1]});

	if (Math.min.apply(Math, currentRow) <= maxCost)
	{
		var c;
		for(c in node.edges)
		{
			this.searchRecursive(node.edges[c], c, word, currentRow, results, maxCost);
		}
	}
}

module.exports = TrieNode;