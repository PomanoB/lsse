var util = require('util');

var nextId = 0;

function DawgNode()
{
	// this.id = nextId++;
	// this.final = false;
	this.word = null;
	this.edges = {};
}
DawgNode.prototype.toString = function(){
	var arr = [];
	if (this.final)
		arr.push("1");
	else
		arr.push("0");

	var label;
	for(label in this.edges)
	{
		// if (!this.edges.hasOwnProperty(label))
		// 	continue;
		arr.push(label);
		arr.push(this.edges[label].toString());
	}

	return arr.join("_");
}

function Dawg()
{
	this.prevWord = "";
	this.root = new DawgNode();
	this.uncheckedNodes = [];
	this.minimizedNodes = {};
	// this.minimizedNodes = [];
}
Dawg.prototype.insert = function(word){
	
	var commonPrefix = 0;
	var i = 0;
	var len = Math.min(word.length, this.prevWord.length);

	for(i = 0; i < len; i++)
	{
		if (word[i] != this.prevWord[i])
			break;

		commonPrefix++;
	}

	this.minimize(commonPrefix);

	var node;
	if (this.uncheckedNodes.length == 0)
		node = this.root;
	else
		node = this.uncheckedNodes[this.uncheckedNodes.length - 1][2];

	var nextNode;
	for(i = commonPrefix; i < word.length; i++)
	{
		nextNode = new DawgNode();
		node.edges[word[i]] = nextNode;
		this.uncheckedNodes.push([node, word[i], nextNode]);
		node = nextNode;
	}

	// node.final = true;
	node.word = word;
	this.prevWord = word;
}
Dawg.prototype.finish = function(){
	this.minimize(0);
}
Dawg.prototype.minimize = function(downTo){
	
	var i;
	var parent, letter, child; //, index;

	for(i = this.uncheckedNodes.length - 1; i > downTo - 1; i--)
	{
		parent = this.uncheckedNodes[i][0];
		letter = this.uncheckedNodes[i][1];
		child = this.uncheckedNodes[i][2];

		// index = this.minimizedNodes.indexOf(child)
		// if (index != -1)
		// 	parent.edges[letter] = this.minimizedNodes[index];
		// else
		// 	this.minimizedNodes.push(child);

		if (child in this.minimizedNodes)
			parent.edges[letter] = this.minimizedNodes[child];
		else
			this.minimizedNodes[child] = child;

		this.uncheckedNodes.pop();
	}
}
Dawg.prototype.lookup = function(word){
	var node = this.root;
	var i;

	for(i = 0; i < word.length; i++)
	{
		if (! (word[i] in node.edges))
			return false;
		node = node.edges[word[i]];
	}
	return node.final;
}
Dawg.prototype.search = function(word, maxCostz){
	var currentRow = Array(word.length + 1);
	var i;
	for(i = 0; i <= word.length; i++)
		currentRow[i] = i;
	
	var letter;
	var results = [];
	for(letter in this.root.edges)
	{
		this.searchRecursive(this.root.edges[letter], letter, word, currentRow, results, maxCost);
	}

	return results;
}
Dawg.prototype.searchRecursive = function(node, letter, word, previousRow, results, maxCost){
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

module.exports = Dawg;
/*
var d = new Dawg();

var words = ['cat', 'dog', 'dogs', 'words'];
words.sort();

var i;
for(i = 0; i < words.length; i++)
{
	d.insert(words[i]);
}
d.finish();

// console.log(util.inspect(d, false, 10));
console.log(d.lookup("dog"));
console.log(d.search("dag", 1));
*/