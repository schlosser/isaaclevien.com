$(function() {
    $('.gig .item').click(function() {
        $(this).siblings('.details').slideToggle();
    });
});