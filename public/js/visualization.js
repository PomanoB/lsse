
var Visualization = function(options){

	var defOptions = {
		primaryLinkColor: '#000',
		secondaryLinkColor: '#888',
		parentNodeColor: '#000',
		nodeColor: '#00B7FF',

		springLengthA: 0,
		springLengthB: 150,
		springCoeff: 0.00005,
		dragCoeff: 0.02,
		gravity: -1.2,
		container: null,
		dblclick: null,
		click: null,
	}

	this.options = {};

	for(var opt in defOptions)
	{
		if (typeof options[opt] != "undefined")
			this.options[opt] = options[opt];
		else
			this.options[opt] = defOptions[opt];
	}
	var t = this;

	this.currentNode = "";

	this.graph = Viva.Graph.graph();

	this.graphics = Viva.Graph.View.svgGraphics();
	this.graphics.link(this.makeLink.bind(this)).placeNode(this.placeNode).node(this.makeNode.bind(this));

	this.layout = Viva.Graph.Layout.forceDirected(this.graph, {
		springLength : this.options.springLength,
		springCoeff : this.options.springCoeff,
		dragCoeff : this.options.dragCoeff,
		gravity : this.options.gravity
	});

 	this.renderer = Viva.Graph.View.renderer(this.graph, {
		container: this.options.container,
		graphics : this.graphics,
		layout : this.layout
	});

	var i;

	var graphFunctions = ['removeNode', 'addNode', 'hasLink', 'addLink', 'clear', 'forEachNode', 'forEachLink'];
	var layoutFunctions = ['gravity', 'springCoeff', 'theta', 'drag'];

	for(i = 0; i < graphFunctions.length; i++)
	{
		this[graphFunctions[i]] = this.graph[graphFunctions[i]].bind(this.graph);
	}
	for(i = 0; i < layoutFunctions.length; i++)
	{
		this[layoutFunctions[i]] = this.layout[layoutFunctions[i]].bind(this.layout);
	}

	this.renderer.run();
};

Visualization.prototype.update = function(){

	var a = this.options.springLengthA;
	var b = this.options.springLengthB;

	this.graph.beginUpdate();
	this.graph.forEachLink(function(link){
			link.force_directed_spring.length = a * link.data.value + b;
	});
	this.graph.endUpdate();

	// Update graph O_o;
	graph.addNode('dffsdfasfasdfdsafd');
	graph.removeNode('dffsdfasfasdfdsafd');
};
Visualization.prototype.springLengthA = function(value){
	if (typeof value != "undefined")
		return this.options.springLengthA = value;
	else
		return this.options.springLengthA;
};
Visualization.prototype.springLengthB = function(value){
	if (typeof value != "undefined")
		return this.options.springLengthB = value;
	else
		return this.options.springLengthB;
};
Visualization.prototype.addData = function(data, limit, parent){
	
	var i, firstRel;

	if (!limit)
		limit = Infinity;

	this.graph.addNode(data.word, {parent: parent === true});

	for(i = 0; i < data.relations.length && i <= limit; i++)
	{
		if (i == 0)
			firstRel = data.relations[i].value + 0.001;

		graph.addNode(data.relations[i].word);
		if (!graph.hasLink(data.word, data.relations[i].word))
		{
			graph.addLink(data.word, data.relations[i].word, {
				value: 1 - data.relations[i].value/firstRel,
				secondary: parent === false
			});
		}
	}
}

Visualization.prototype.removeFreeNodes = function(){
	var graph = this.graph;
	graph.forEachNode(function(node){
		if (node.links.length <= 0)
			graph.removeNode(node.id);
	});
};
Visualization.prototype.removeCurrentNode = function(){
	this.graph.removeNode(this.currentNode);
};
Visualization.prototype.makeLink = function(link){
	return Viva.Graph.svg('line').attr('stroke', link.data && link.data.secondary ? this.options.secondaryLinkColor : this.options.primaryLinkColor);
};
Visualization.prototype.placeNode = function(nodeUI, pos){
	nodeUI.attr('transform', 'translate(' + (pos.x - nodeUI.width/2) + ',' + (pos.y - nodeUI.height/2) + ')');
};
Visualization.prototype.makeNode = function(node) {

	var t = this;
	var ui = Viva.Graph.svg('g').attr('class', 'node');
	var rect = ui.append('rect').attr('fill', '#fff');
	var text = ui.append('text').text(node.id);

	setTimeout(function(){
		var bbox = text.getBBox();
		rect.attr('width', bbox.width);
		rect.attr('height', bbox.height);
		text.attr('y', bbox.height - 4);
		ui.width = bbox.width;
		ui.height = bbox.height;
	}, 10);

	if (node.data && node.data.parent)
	{
		ui.attr('fill', this.options.parentNodeColor);
		ui.attr('class', 'parent node');
	}	
	else
		ui.attr('fill', this.options.nodeColor);

	$(ui).click(function(){
		t.currentNode = $(this).text();

		if (t.options.click)
			t.options.click.call(t, t.graph.getNode(t.currentNode));

	}).dblclick(function(){
		t.currentNode = $(this).text();

		if (t.options.dblclick)
			t.options.dblclick.call(t, t.graph.getNode(t.currentNode));
	});

	return ui;
};