$(function() {
	$status = $('#status');
	$soundcloudUrls = $('.soundcloud-urls');
	$hiddenSoundcloudUrls = $('#soundcloud_urls');
	$embedForm = $('#add-soundcloud-embed');
	$adminForm = $('#admin-form');
	$embedFormControl = $embedForm.find('.form-control');
	$embedUrlBox = $embedForm.find('#soundcloud-url');
	$embedErrors = $embedForm.find('.errors');

	function hiddenInput(id, url) {
		return '<li><input id="' + id + '" name="' + id +
			'" type="text" value="' + url + '"></li>';
	}

	function update() {
		var html = '';
		$soundcloudUrls.children().each(function(index, element) {
			var id = 'soundcloud_urls-' + index;
			html += hiddenInput(id, $(element).data('url'));
		});
		$hiddenSoundcloudUrls.html(html);
		$status.attr("class","saving");
		$.post('/admin/recordings', $adminForm.serialize(), function() {
			$status.attr("class","saved");
			setTimeout(function() {
				$status.attr('class', '');
			}, 2000);
		}).fail(function() {
			$status.attr("class", "error");
		});
	}

	$embedForm.submit(function(e) {
		e.preventDefault();
		e.stopPropagation();

		var soundcloudUrl = $embedUrlBox.val();
		$embedForm[0].reset();
		$embedErrors.html('');
		$embedFormControl.removeClass('invalid');
		if (!soundcloudUrl) {
			return;
		}

		embed = $.get('/admin/list_item/soundcloud', {
			url: soundcloudUrl
		}, function( html ) {
			$('.soundcloud-urls').append( html ).sortable();
			update();
		}).fail(function() {
		    $('#add-soundcloud-embed .form-control').addClass('invalid');
		    $('#add-soundcloud-embed .errors').html('<li>Invalid Soundcloud URL</li>');
		});
	});

	$(document).on('click', '.delete', function() {
		$(this).parents('.draggable').remove();
		update();
	});

	$soundcloudUrls.sortable().bind('sortupdate', function(e, ui) {
	    update();
	});

	$(document).keydown(function(event) {
        // If Control or Command key is pressed and the S key is pressed
        // run save function. 83 is the key code for S.
        if((event.ctrlKey || event.metaKey) && event.which == 83) {
            // Save Function
            event.preventDefault();
            update();
            return false;
        };
    })
});
