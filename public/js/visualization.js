var LinkType = {
	PrimaryLink: 1,
	SecondaryLink: 2,
	UserLoadedLink: 3
}

var Visualization = function(options){

	var defOptions = {
		primaryLinkColor: '#000',
		secondaryLinkColor: '#DDD',
		userLinkColor: '#888',
		highlightLinkColor: '#f00',
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
		mouseout: null,
		mouseover: null,

		show2ndLinks: true,
		limit2ndLinks: 20,
	}

	this.options = {};
	this.secondLinksNodes = [];

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

	var graphFunctions = ['removeNode', 'addNode', 
							'hasLink', 'addLink', 'forEachNode', 
							'forEachLink', 'removeLink', 'getNode', 'forEachLinkedNode'
							];
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
Visualization.prototype.clear = function(){
	this.secondLinksNodes = [];
	this.currentNode = "";
	this.graph.clear();
}

Visualization.prototype.show2ndLinks = function(show){
	if (typeof show == "undefined")
		return this.options.show2ndLinks;
	return this.options.show2ndLinks = show;
}


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
Visualization.prototype.addData = function(data, limit, type){

	var i, firstRel = -1;

	if (!limit)
		limit = Infinity;

	this.graph.addNode(data.word, {parent: type === LinkType.PrimaryLink});

	for(i = 0; i < data.relations.length && i <= limit; i++)
	{
		if (data.relations[i].word == "constructor" || data.relations[i].word == "prototype")
			continue;

		if (firstRel == -1)
			firstRel = data.relations[i].value + 0.001;

		if (type != LinkType.SecondaryLink && i < this.options.limit2ndLinks && this.secondLinksNodes.indexOf(data.relations[i].word) == -1)
			this.secondLinksNodes.push(data.relations[i].word);

		graph.addNode(data.relations[i].word);
		if (!graph.hasLink(data.word, data.relations[i].word))
		{
			graph.addLink(data.word, data.relations[i].word, {
				value: 1 - data.relations[i].value/firstRel,
				type: type
			});
		}
	}
}

Visualization.prototype.removeFreeNodes = function(){
	var graph = this;
	graph.forEachNode(function(node){
		if (node.links.length <= 0)
		{	graph.removeNode(node.id);
		
			var i = graph.secondLinksNodes.indexOf(node.id);
			if (i != -1)
				graph.secondLinksNodes.splice(i, 1);
		}
	});
};
Visualization.prototype.removeCurrentNode = function(){
	this.graph.removeNode(this.currentNode);
	var i = this.secondLinksNodes.indexOf(this.currentNode);
	if (i != -1)
		this.secondLinksNodes.splice(i, 1);
};

Visualization.prototype.getLinkColorByType = function(type){

	var color = this.options.primaryLinkColor;
	switch (type)
	{
		case LinkType.PrimaryLink:
			color = this.options.primaryLinkColor;
			break;
		case LinkType.SecondaryLink:
			color = this.options.secondaryLinkColor;
			break;
		case LinkType.UserLoadedLink:
			color = this.options.userLinkColor;
			break;
	}

	return color;
}

Visualization.prototype.makeLink = function(link){
	var color = this.options.primaryLinkColor;

	if (link.data && link.data.type)
	{
		color = this.getLinkColorByType(link.data.type);
	}
	return Viva.Graph.svg('line').attr('stroke', color);
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

	/*
	.click(function(){
		t.currentNode = $(this).text();

	//	if (t.options.click)
	//		t.options.click.call(t, t.graph.getNode(t.currentNode));

	})
*/
	$(ui).dblclick(function(e){
		t.currentNode = $(this).text();

		if (t.options.dblclick)
			t.options.dblclick.call(t, t.graph.getNode(t.currentNode), e);
	}).mousedown(function(e){
		if (e.button == 0)
		{
			this.clientX = e.clientX;
			this.clientY = e.clientY;
		}
		t.currentNode = $(this).text();
	}).mouseup(function(e){
		if (e.button == 0 && this.clientX == e.clientX && this.clientY == e.clientY && t.options.click)
		{
			t.options.click.call(t, t.graph.getNode(t.currentNode), e);
		}
		this.clientX = null;
		this.clientY = null;
		
	}).mouseout(function(e){
		if (t.options.mouseout)
			t.options.mouseout.call(t, t.graph.getNode($(this).text()), e);
	}).mouseover(function(e){
		if (t.options.mouseover)
			t.options.mouseover.call(t, t.graph.getNode($(this).text()), e);
	});

	return ui;
};