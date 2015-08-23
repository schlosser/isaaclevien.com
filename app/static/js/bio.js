$(function() {
	var timeoutId;
	var $bioForm = $('#bio-form')
	var $status = $('#status');
	var $textareas = $('#bio-form textarea');
	$textareas.autoGrow();

	function save() {
		$status.attr('class', 'saving');
		$.post('/admin/bio', $bioForm.serialize(), function() {
			$status.attr("class","saved");
			setTimeout(function() {
				$status.attr("class","");
			}, 2000);
		}).fail(function() {
			$status.attr("class", "error");
		});
	}

    function autoSave() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
            save();
        }, 1000);
    }

    $('#tagline').on('keyup keypress', autoSave);
	$textareas.on('keyup keypress', autoSave);


	$(document).keydown(function(event) {
        // If Control or Command key is pressed and the S key is pressed
        // run save function. 83 is the key code for S.
        if((event.ctrlKey || event.metaKey) && event.which == 83) {
            // Save Function
            event.preventDefault();
            save();
            return false;
        };
    });
});