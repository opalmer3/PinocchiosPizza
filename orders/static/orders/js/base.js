//jshint esversion:6
// show / hide collapsable navbar menu
$('.navbar-toggler').on('click', ()=>{

if ($('.home').attr('data-visibility') === 'hidden'){
  $('.home, .nav-right').slideDown();
  $('.home').attr('data-visibility', "showing");
}
else{
  $('.home').attr('data-visibility', "hidden");
  // Remove style attribute so if user goes back to large screen size the links are still visibility
  $('.home, .nav-right').removeAttr('style');
}
});
