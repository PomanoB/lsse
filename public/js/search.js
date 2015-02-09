var lsse;
var graph = null;
var displayResults = null;
var currentSkip = 0;
var showImages = true;
var showInfoPanel = true;

function turnIconsOn()
{
	showImages = true;
	// $('img.result_icon').show();
	$('g.node>image').css('display', 'block');

	$('#icons_switcher a').removeClass('current');
	$('#icons_switcher a[href="#on"]').addClass('current');
}
function turnIconsOff()
{
	showImages = false;
	// $('img.result_icon').hide();
	$('g.node>image').hide();

	$('#icons_switcher a').removeClass('current');
	$('#icons_switcher a[href="#off"]').addClass('current');
}

$(function(){
	var socket = io.connect();
	lsse = new LSSE(socket, useLang);

	
/*
	var sampleSearch = [
		"python",
		"jaguar",
		"blackberry",
		"flash",		
		"brother",
		"operating system",
		"java",
		"ruby",
		"fedora",
		"linux",
		"queen",
		"windows",
		"zurich",
		"fruit",
		"vehicle",
		"computational linguistics",
		"machine learning",
		"weapon",
		"machine gun",
		"antelope",
		"airplane",
		"mango",
		"strawberry",
		"Russia",
		"Belgium",
		"France",
		"mathematics",
		"biology",
		"moose",
		"racoon",
		"dog",
		"cat",
		"animal",
		"vegetable",
		"Moscow",
		"Stanford",
		"Brussels",
		"Vienna",
		"Berlin",
		"ferrari",
		"porsche",
		"lamborghini",
		"pizza",
		"hot dog",
		"hamburger",
		"soft drink",
		"cottage cheese",
		"local speciality"
	];
*/
	var suggestTimeout = null;

	turnIconsOn();

	// $('select.relevance_select').change(function(){

	// 	$(this).parents('div.relevance').hide();

	// 	var relevance = parseInt($(this).val());
	// 	if (relevance <= 3 && relevance >= 1)
	// 		lsse.saveRelevance(relevance);
	// });
	
	$('ul.relevance_select>li').click(function(){
		var relevance = parseInt($(this).data('relevance'));
		if (relevance <= 3 && relevance >= 1)
			lsse.saveRelevance(relevance);
		$(this).parents('div.relevance').hide();
	});

	$('#input_form').submit(function(){
		$('#result').empty();
		$('#show_all').hide();
		$('#suggest_results').hide();
		$('#info_panel').html('').hide();
		$('div.disambiguates_info').hide();

		clearTimeout(suggestTimeout);

		currentSkip = 0;
		var word = $('#input_word').val();
		location.hash = "#" + word;
		lsse.search(word, $('#model').val(), 0, 20, displayResults);
		return false;
	});

	// $(document).on("click", "#result a", function(){

	// 	var newWord = (location.hash = $(this).attr('href')).slice(1);
	// 	lsse.completeLog(newWord);

	// 	$('#input_word').val(newWord);
	// 	$('#input_form').submit();


	// 	return false;
	// });

	$('#model').change(function(){
		$('#input_form').submit();
	});

	$('#show_all').click(function(){
		$('#show_all').hide();

		currentSkip += 20;

		lsse.search($('#input_word').val(), $('#model').val(), currentSkip, 20, displayResults, true);

		return false;
	});
	$('#show_all').hide();


	$(window).unload(function(){
		lsse.completeLog();
	});
	
	$(window).on('hashchange', function(){
		var hashWord = location.hash.slice(1);
		if (lsse.lastQuery.word != hashWord)
		{
			$('#input_word').val(location.hash.slice(1));
			$('#input_form').submit();
		}
	});

	
	var currentHighLight = -1;
	var suggestLength = 0;
	$('#input_word').keydown(function(e){
		// UP - 38 DOWN - 40 ENTER - 13;
		if (e.keyCode == 13)
		{
			if (currentHighLight != -1)
			{
				location.hash = '#' + $('#suggest_results>li').eq(currentHighLight).text();
				return false;
			}
				// $(this).val($('#suggest_results>li').eq(currentHighLight).text());
			return;
		}
		else
		if (e.keyCode == 40)
		{
			if(++currentHighLight >= suggestLength)
				currentHighLight = suggestLength - 1;
			$('#suggest_results>li').removeClass('active').eq(currentHighLight).addClass('active');
			return false;
		}
		else
		if (e.keyCode == 38)
		{
			if(--currentHighLight < 0)
				currentHighLight = 0;
			$('#suggest_results>li').removeClass('active').eq(currentHighLight).addClass('active');
			return false;
		}
		clearTimeout(suggestTimeout);
		setTimeout(function(){
			currentHighLight = -1;
			suggestLength = 0;
			var word = $('#input_word').val().replace(/[^a-zA-Z0-9\s]/, '');
			// console.log("word = \"" + word + "\"");
			if (word.length >= 2)
			{
				lsse.suggest(word, function(words){
					suggestLength = words.length;
					if (suggestLength > 0)
					{
						var res = '<li>' + words.join('</li><li>') + '</li>';
						$('#suggest_results').html(res).show();
					}
					else
						$('#suggest_results').hide();
				});
			}
			else
				$('#suggest_results').hide();
		}, 200);
	});

	// $('#switch_images').click(switchImages);

	$('#info_panel_switcher a').click(function(){

		if ($(this).attr('href') == "#on")
		{
			$('#info_panel').show();
			$('#graph_container').css('right', '270px');
			showInfoPanel = true;
		}	
		else
		{
			$('#info_panel').hide();
			$('#graph_container').css('right', '20px');
			showInfoPanel = false;
		}	

		$('#info_panel_switcher a').removeClass('current');
		$('#info_panel_switcher a[href="#' + (showInfoPanel ? 'on' : 'off') + '"]').addClass('current');

		return false;
	});
	$('#info_panel_switcher a[href="#on"]').addClass('current');

	$('#icons_switcher a').click(function(){

		if ($(this).attr('href') == "#on")
			turnIconsOn();
		else
			turnIconsOff();

		return false;
	});

	$(document).on("click", "#suggest_results>li", function(){
		location.hash = '#' + $(this).text();
		// $('#input_word').val($(this).text());
		// $('#input_form').submit();
	})

	$('#grpah_options>a[href="#close"]').click(function(){
		$(this).parent().hide();
		return false;
	});
	$('div.infobox>a[href="#close"]').click(function(){
		$(this).parent().hide();
		return false;
	});


	// $('#switch_secondary_links').click(function(){
	// 	if (graph.show2ndLinks())
	// 	{
	// 		hide2ndLinks();
	// 		$(this).text(lingua.show_second_links);
	// 	}
	// 	else
	// 	{
	// 		show2ndLinks();
	// 		$(this).text(lingua.hide_second_links);
	// 	}	

	// 	return false;
	// });

	var lastScroll = 0;
	$(document).bind('scroll', function(){
		$('#scroll_to_top').css('opacity', Math.min(1.0, $(window).scrollTop()/500));
	});
	$('#scroll_to_top').click(function(){
		var currentScroll = $('body').scrollTop();
		if (currentScroll)
		{
			lastScroll = currentScroll;
			$('html, body').animate({scrollTop: 0}, 1000);
		}
		else
			$('html, body').animate({scrollTop: lastScroll}, 1000);		
	});

	var currentExample = sampleSearch[ Math.floor( Math.random() * sampleSearch.length ) ];
	$('#example_search>a').attr('href', '#' + currentExample).text(currentExample);

	var _displayResults = displayResults;
	displayResults = function(data)
	{
		$('#suggest_results').hide();
		$('.social_buttons').show();

		$('a.remember_word_link').each(function(){
			var href = $(this).attr('href');
			var anchor = href.split('#');
			$(this).attr('href', anchor[0] + '#' + data.word)
		});

		var result = _displayResults(data);
		
		if (showImages)
			turnIconsOn();

		if (data.totalRelations <= 0 && !result)
		{
			var pLen = data.perhaps.length;
			if (pLen > 0)
			{
				result = lingua.not_found_try_perhaps.replace('%s', data.word);

				data.perhaps.sort(function(a, b){
					return b.totalRelations - a.totalRelations;
				});;

				result += "<ul>";
				var i;
				for(i = 0; i < pLen; i++)
				{
					result += ('<li><a href="#' + data.perhaps[i].word + '">' + data.perhaps[i].word + '</a>');
					result += (' - ' + data.perhaps[i].totalRelations + ' ' + plural(data.perhaps[i].totalRelations, lingua.results));
				}
				result += "</ul>";
			}
			else
			{
				result = lingua.not_found;
				if (/[а-я]/i.test(data.word) && location.pathname !== "/ru")
					location.href = "/ru#" + data.word
			}

			$('#result').html(result);
		}
	}


	if (location.hash != "")
	{
		$('#input_word').val(location.hash.slice(1));
		$('#input_form').submit();
	}

});

function plural(n, variants)
{
	return variants[(
		(n % 10 == 1 && n % 100 != 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2)
	)];
}
