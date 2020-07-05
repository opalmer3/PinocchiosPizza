//jshint esversion:6
// show / hide collapsable navbar menu
$('.nav-toggler').on('click', ()=>{

if ($('.collapsable-nav-links').attr('data-visibility') === 'hidden'){
  $('.collapsable-nav-links').css('max-height', '200px');
  $('.collapsable-nav-links').attr('data-visibility', "showing");
}
else{
  $('.collapsable-nav-links').attr('data-visibility', "hidden");
  // Remove style attribute so if user goes back to large screen size the links are still visibility
    $('.collapsable-nav-links').removeAttr('style');
}
});
