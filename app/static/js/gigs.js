$(function() {
    var $textareas = $('#gig-form textarea');
    $textareas.autoGrow();

    $('a[href="#edit"]').click(function(e) {
        var $this = $(this)
        e.preventDefault();
        e.stopPropagation();
        $('.gig').show();
        $this.parents('.gig').hide();
        $('#date').val($this.data('date'));
        $('#time').val($this.data('time').slice(0,5)); // Only hour:minute
        $('#location').val($this.data('location'));
        $('#band').val($this.data('band'));
        $('#details').val($this.data('details'));
        $('#gig_id').val($this.data('id'));
    });

    $('a[href="#delete"]').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $this = $(this);
        $.post('/admin/gigs/delete/' + $(this).data('id'), null, function() {
            console.log('done');
            $this.parents('.gig').hide();
        }).fail(function() {

        });
    })
});