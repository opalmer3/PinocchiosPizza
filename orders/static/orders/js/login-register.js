verticalCentre();

// Recenter when window size changed
window.addEventListener('resize', verticalCentre);

function verticalCentre(){
  // get height of box body and nav
  var boxHeight =  document.querySelector('.login-register-box').offsetHeight;
  var bodyHeight = document.querySelector('body').offsetHeight
  var navHeight =  document.querySelector('nav').offsetHeight

  // calculate top margin
  var top = (bodyHeight - navHeight - boxHeight) / 2;

  if (top > 10){
    // set top margin
    $('.login-register-box').css('margin-top', ((bodyHeight - navHeight - boxHeight) / 2).toString() +'px');
  }
}
