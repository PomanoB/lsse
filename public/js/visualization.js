var graph;

$(function(){

	$('#graph_container>div>a[href="#delete"]').click(function(){
		graph.removeNode(currentNode);
		return false;
	});
	$('#graph_container>div>a[href="#delete_free_nodes"]').click(function(){
		graph.forEachNode(function(node){
			if (node.links.length <= 0)
				graph.removeNode(node.id);
		});
		return false;
	});

	var currentNode = "";
	// var data = [
	// 	{
	// 		adjacencies: [
	// 			{
	// 				"nodeTo": "2",
	// 				"nodeFrom": "1",
	// 				"data": {
	// 					"$color": "#557EAA"
	// 				}
	// 			},
	// 			{
	// 				"nodeTo": "3",
	// 				"nodeFrom": "1",
	// 				"data": {
	// 					"$color": "#557EAA"
	// 				}
	// 			},
	// 			{
	// 				"nodeTo": "4",
	// 				"nodeFrom": "1",
	// 				"data": {
	// 					"$color": "#557EAA"
	// 				}
	// 			}
 //            ],
	// 		data: {
	// 			"$color": "#83548B",
	// 		},
	// 		id: "1",
	// 		name: "Test 1"
	// 	},
	// 	{
	// 		adjacencies: [],
	// 		data: {
	// 			"$color": "#83548B",
	// 		},
	// 		id: "2",
	// 		name: "Test 2"
	// 	},
	// 	{
	// 		adjacencies: [],
	// 		data: {
	// 			"$color": "#83548B",
	// 		},
	// 		id: "3",
	// 		name: "Test 3"
	// 	},
	// 	{
	// 		adjacencies: [],
	// 		data: {
	// 			"$color": "#83548B",
	// 		},
	// 		id: "4",
	// 		name: "Test 4"
	// 	}
	// ];

	// var fd = new $jit.ForceDirected({
	// 	injectInto: 'graph_container',
	// 	Navigation: {
	// 		enable: true,
	// 		panning: 'avoid nodes',
	// 		zooming: 10 //zoom speed. higher is more sensible
	// 	},
	// 	Node: {
	// 		overridable: true,
	// 		color: '#FFF',
	// 		autoWidth: true,
	// 		autoHeight: false,
	// 		type: 'rectangle',
	// 		alpha: 1.0,
	// 		height: 10
	// 	},
	// 	Edge: {
	// 		overridable: true,
	// 		color: '#000',
	// 		lineWidth: 0.4
	// 	},
	// 	Label: {
	// 		type: "Native", //Native or HTML
	// 		size: 12,
	// 		color: '#000',
	// 	},
	// 	Events: {
	// 		enable: true,
	// 		type: 'Native',
	// 		onDragMove: function(node, eventInfo, e) {
	// 			var pos = eventInfo.getPos();
	// 			node.pos.setc(pos.x, pos.y);
	// 			fd.plot();
			
	// 		},
	// 		onTouchMove: function(node, eventInfo, e) {
	// 			$jit.util.event.stop(e); //stop default touchmove event
	// 			this.onDragMove(node, eventInfo, e);
	// 		}
	// 	}
	// });
	
	// graph = fd;


	graph = Viva.Graph.graph();
	var geom = Viva.Graph.geom();

	var graphics = Viva.Graph.View.svgGraphics();
	graphics.node(function(node) {

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

		// var ui = Viva.Graph.svg('text')
		// 	.attr('class', 'node')
		// 	.text(node.id); //.text(node.id);

		if (node.data && node.data.parent)
		{
			ui.attr('fill', '#000');
			ui.attr('class', 'parent node');
		}	
		else
			ui.attr('fill', '#00B7FF');

		$(ui).dblclick(function(){
	//		location.href = '#' + $(this).text();
			var word = $(this).text();
			currentNode = word;
			
			lsse.search(word, $('#model').val(), 20, function(data){
				if (data.totalRelations > 0)
				{
					var i, link;
					// var a = parseFloat($('#graph_option_links_length_type_a').val());
					// var b = parseFloat($('#graph_option_links_length_type_b').val());
					var firstRel = -1;
					// graph.beginUpdate();

					for(i = 0; i < data.relations.length; i++)
					{
						if (i == 0)
							firstRel = data.relations[i].value;

						link = graph.hasLink(word, data.relations[i].word);
						if (!link)
						{

							link = graph.addLink(word, data.relations[i].word, {
								secondary: true,
								value: 1 - data.relations[i].value/firstRel
							});
						}
					}
					// graph.endUpdate();
					$('#graph_apply_button').click();
				}
			});
		}).click(function(){
			currentNode = $(this).text();
		});

		return ui;
					
                    
    }).link(function(link){
		return Viva.Graph.svg('line').attr('stroke', link.data && link.data.secondary ? '#888' : '#000');
    })/*.placeLink(function(linkUI, fromPos, toPos) {

    	var fromNode = graph.getNode(linkUI.fromId).ui;
    	var toNode = graph.getNode(linkUI.toId).ui;

    	var from = geom.intersectRect(
			fromPos.x - fromNode.clientWidth / 2, // left
			fromPos.y - fromNode.clientHeight / 2, // top
			fromPos.x + fromNode.clientWidth / 2, // right
			fromPos.y + fromNode.clientHeight / 2, // bottom

			fromPos.x, fromPos.y, toPos.x, toPos.y) 
		|| fromPos;

		var to = geom.intersectRect(
			toPos.x - toNode.clientWidth / 2, // left
			toPos.y - toNode.clientHeight / 2, // top
			toPos.x + toNode.clientWidth / 2, // right
			toPos.y + toNode.clientHeight / 2, // bottom
			
			toPos.x, toPos.y, fromPos.x, fromPos.y) 
		|| toPos;
		var data = 'M' + from.x + ',' + from.y +
		'L' + to.x + ',' + to.y;

		linkUI.attr("d", data);
	})*/.placeNode(function(nodeUI, pos){

		// var rect = nodeUI.children('rect')[0];
		// var text = nodeUI.children('text')[0];

		// rect.attr('width', text.clientWidth);
		// rect.attr('height', text.clientHeight);
		// text.attr('y', text.clientHeight - 4);

		nodeUI.attr('transform', 
			'translate(' + 
			(pos.x - nodeUI.width/2) + ',' + (pos.y - nodeUI.height/2) + 
			')');

        // nodeUI.attr('x', pos.x - nodeUI.clientWidth/2).attr('y', pos.y + nodeUI.clientHeight/4);
    });

	var layout = Viva.Graph.Layout.forceDirected(graph, {
		springLength : 150,
		springCoeff : 0.00005,
		dragCoeff : 0.02,
		gravity : -1.2
	});

	var renderer = Viva.Graph.View.renderer(graph, {
		container: $('#graph_container').get(0),
		graphics : graphics,
		layout : layout
	});
	renderer.run();


	var graphOptions = [
		'gravity',
		'springCoeff',
		'theta',
		'drag'
	];
	var i;
	for(i = 0; i < graphOptions.length; i++)
	{
		$('#graph_option_' + graphOptions[i]).val(layout[graphOptions[i]]());
	}

	$('#graph_option_links_length_type_a').val(0);
	$('#graph_option_links_length_type_b').val(layout.springLength());

	$('#graph_apply_button').click(function(){
		graph.beginUpdate();
		for(i = 0; i < graphOptions.length; i++)
		{
			layout[graphOptions[i]](parseFloat($('#graph_option_' + graphOptions[i]).val()));
		}

		var a = parseFloat($('#graph_option_links_length_type_a').val());
		var b = parseFloat($('#graph_option_links_length_type_b').val());

		graph.forEachLink(function(link){
			link.force_directed_spring.length = a * link.data.value + b;
		});

		graph.endUpdate();
	//	layout.run();
	//	renderer.run();
	//	graph.fire('resize');
		graph.addNode('dffsdfasfdsafd');
		graph.removeNode('dffsdfasfdsafd');
	});

	$('#graph_toogle_rel_length_button').click(function(){
		

		var baseLength = layout.springLength();

		
		
	});

	$('#graph_option_links_length_type').change(function(){
		$('tr.graph_option_links_length_options').toggle();
	});
});