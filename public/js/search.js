$(function(){
	var socket = io.connect();
	var lsse = new LSSE(socket, '/find');

	$('#input_form').submit(function(){
		$('#result').empty();
		$('#show_all').hide();
		$('#suggest_results').hide();

		lsse.search($('#input_word').val(), $('#model').val(), 20, displayResults);
		return false;
	});

	$(document).on("click", "#result a", function(){

		var newWord = $(this).attr('href').slice(1);
		lsse.completeLog(newWord);

		$('#input_word').val(newWord);
		$('#input_form').submit();

		return false;
	});

	$('#model').change(function(){
		$('#input_form').submit();
	});

	$('#show_all').click(function(){
		$('#show_all').hide();

		lsse.search($('#input_word').val(), $('#model').val(), 0, displayResults);

		return false;
	});
	$('#show_all').hide();


	$(window).unload(function(){
		lsse.completeLog();
	});
	
	var suggestTimeout = null;
	var currentHighLight = -1;
	var suggestLength = 0;
	$('#input_word').keydown(function(e){
		// UP - 38 DOWN - 40 ENTER - 13;
		if (e.keyCode == 13)
		{
			if (currentHighLight != -1)
				$(this).val($('#suggest_results>li').eq(currentHighLight).text());
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
			var word = $('#input_word').val().replace(/[^a-zA-Z0-9]/, '');
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
		}, 200);
	});

	$(document).on("click", "#suggest_results>li", function(){
		$('#input_word').val($(this).text());
		$('#input_form').submit();
	})

	function displayResults(data)
	{
		var result = lingua.not_found;

		if (data.totalRelations > 0)
		{
			result = '<span>' + lingua.results_count+ ': ' + data.totalRelations + '</span>';
			var i;
			result += '<table>';
			for(i = 0; i < data.result.length; i++)
			{
				result += ('<tr><td>'+ (i + 1)+ '</td><td><img src="/svg/' + (data.result[i].icon ? data.result[i].word : 'no') + '.svg" style="height: 32px;"/></td><td><a href="#' + data.result[i].word + '">' + data.result[i].word + '</a>'+ (advanced ? (' - ' + data.result[i].value) : '') + '</td></tr>');
			}
			result += '</table>';
			if (data.result.length < data.totalRelations)
				$('#show_all').show();
		}
		$('#result').html(result);
	}
});