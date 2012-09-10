$(function(){
	var socket = io.connect();
	var lsse = new LSSE(socket, '/find');

	$('#input_form').submit(function(){
		$('#result').empty();
		$('#show_all').hide();

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
	
	function displayResults(data)
	{
		var result = 'Nothing found!';
		if (data.totalRelations > 0)
		{
			result = '<span>Results count: ' + data.totalRelations + '</span>';
			var i;
			result += '<ol>';
			for(i = 0; i < data.result.length; i++)
			{
				result += ('<li><a href="#' + data.result[i].word + '">' + data.result[i].word + '</a>'+ (advanced ? (' - ' + data.result[i].value) : '') + '</li>');
			}
			result += '</ol>';
			if (data.result.length < data.totalRelations)
				$('#show_all').show();
		}
		$('#result').html(result);
	}
});