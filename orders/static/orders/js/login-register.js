//jshint esversion:6
// form validation
$('#login-register').on('submit', ()=>{
  var error = false;
  $('#login-register').children('input').each(function(){
    // if value empty add red bottom border to show that
    if ($(this).val() === ''){
      $(this).css('border-bottom', "solid 3px red");
      error = true;
    }
  });
  // Prevent form submission if error
  if (error === true){
  return false;
  }
});

// remove red bottom border on focus
$('input').on('focus', function(){
  $(this).removeAttr('style');
});
