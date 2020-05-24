//jshint esversion:6
// On page load get the cart session variable and render cart if it exists
var cart = [];

// Get the cart session variable on page load or page back/forwrard
$(window).on('popstate', getCartSession);
$(document).ready(getCartSession);

// Create template for cart items
const cartItemTemplate = Handlebars.compile($('#cartItemTemplate').html());

// Listens for clicks on small / large buttons
$(".size button").on('click', selectSize);
//Listens for clicks on extras
$(".topping-box button").on('click', selectTopping);
//Listens for clicks on add to cart button
$(".addcartbtn").on('click', addToCart);
//Listen for clicks on subs extras
$(".extra-box button").on('click', selectExtra);

function selectSize() {
  // Select sibling of the size button clicked. There are only 2 sizes so it will always choose the other button. Toggle data-selected and classes.
  let sibling = $(this).siblings()[0];

  // Set selected to true on the button clicked and false on the sibling
  $(this).attr('data-selected', "true");
  $(sibling).attr('data-selected', "false");

  // If small button clicked add selected class to it and remove it from large button
  if ($(this).attr('data-size') == 'Small') {
    $(this).attr('class', "pricebtn selected");
    $(sibling).attr('class', "pricebtn");
  }
  // vice versa
  else {
    $(this).attr('class', "pricebtn selected");
    $(sibling).attr('class', "pricebtn");
  }
}

// toggle selected class when extra clicked. max 5 extras selectable at each time
function selectTopping() {
  let counter = 0;
  // select parent and iterate through each extra
  $(this).parent().children().each(function() {
    // if extra is selected add to counter
    if ($(this).attr('data-selected') == 'true') {
      counter++;
    }
  });
  // if data-seleted is true then user is trying to deslect extra and vice versa
  let selected = $(this).attr('data-selected');
  // if less than 5 toppings are currently selected and the topping clicked is not selected then select it
  if (counter < 5 && selected == 'false') {
    $(this).toggleClass('extra');
    $(this).toggleClass('extra-selected');
    $(this).attr('data-selected', "true");

    counter++;
  }
  // If topping already selected then deselect it
  else if (selected == 'true') {
    $(this).toggleClass('extra');
    $(this).toggleClass('extra-selected');
    $(this).attr('data-selected', "false");

    counter--;
  }

  // Traverse up DOM find the parent menu section id
  let sectionid = $(this).closest('.menu-section').attr('id');

  // update pizza id on addcart button. Special pizza has 4-5 extras so id for both numbers is 5
  var pizzaId = 0;
  if (counter < 5) {
    pizzaId = counter + 1;
  } else {
    pizzaId = counter;
  }

  $('#' + sectionid + 'addcart').attr('data-id', pizzaId);

  // Call function to update the price of the pizza
  pizzaPriceUpdate(sectionid, pizzaId);
}

// GET prices of pizzas and update them
function pizzaPriceUpdate(sectionid, pizzaId) {
  // iterate through list of pizza menu items and extract the corresponding prices
  if (sectionid === 'reg') {
    for (var i of regularPizzas) {
      if (i.id === pizzaId) {
        // Change button text to show updated price
        $('#regsmallbtn').text('Small $ ' + i.smallPrice.toFixed(2));
        $('#reglargebtn').text('Large $ ' + i.largePrice.toFixed(2));
        break;
      }
    }
  }
  // else pizza must be sicilian
  else {
    for (var i of sicilianPizzas) {
      if (i.id == pizzaId) {
        // Change button text to show updated price
        $('#sicsmallbtn').text('Small $ ' + i.smallPrice.toFixed(2));
        $('#siclargebtn').text('Large $ ' + i.largePrice.toFixed(2));
        break;
      }
    }
  }
}

// Toggles select class and data on sub extras & updates price
function selectExtra() {
  // Get sub id
  var subid = $(this).attr('data-id');
  var currPriceSmall = 0;
  var currPriceLarge = 0;
  // Get current prices of subs
  for (var i of subs) {
    if (i.id == subid) {
      currPriceSmall = i.smallPrice;
      currPriceLarge = i.largePrice;
      break;
    }
  }

  // if extra is not selected select it else deselect it
  if ($(this).attr('data-selected') == 'false') {
    $(this).attr('data-selected', "true");
    $(this).toggleClass('extra-selected');

    // Count number of extras selected
    let counter = 0;
    // select parent and iterate through each extra
    let parent = $(this).parent();
    parent.children().each(function() {
      // if extra is selected add to counter
      if ($(this).attr('data-selected') == 'true') {
        counter++;
      }
    });

    // Update price on each size button. 0.5 per extra
    currPriceSmall += 0.50 * counter;
    currPriceLarge += 0.50 * counter;

    $('#' + 'subs' + subid + " button[data-size='Small']").text('Small $ ' + currPriceSmall.toFixed(2));
    $('#' + 'subs' + subid + " button[data-size='Large']").text('Large $ ' + currPriceLarge.toFixed(2));
  } else {
    $(this).attr('data-selected', "false");
    $(this).toggleClass('extra-selected');

    // Count number of extras selected
    let counter = 0;
    // select parent and iterate through each extra
    let parent = $(this).parent();
    parent.children().each(function() {
      // if extra is selected add to counter
      if ($(this).attr('data-selected') == 'true') {
        counter++;
      }
    });

    // Update price on each size button
    currPriceSmall += 0.50 * counter;
    currPriceLarge += 0.50 * counter;

    $('#' + 'subs' + subid + " button[data-size='Small']").text('Small $ ' + currPriceSmall.toFixed(2));
    $('#' + 'subs' + subid + " button[data-size='Large']").text('Large $ ' + currPriceLarge.toFixed(2));
  }

}


// Extracts info from the page and appends it to the cart
function addToCart() {

  // Get section the item is in, id and dishType
  var sectionList = $(this).attr("data-section");
  var id = $(this).attr("data-id");
  var dishType = $(this).attr("data-dish-type");

  var extras = '';
  // For pizzas prepend extras string with toppings
  if (sectionList == 'regularPizzas' || sectionList == 'sicilianPizzas') {
    // Save the extras seleted (if any) in a string
    extras = extras + 'Toppings: ';
    $(this).parent().prev().children().each(function() {
      if ($(this).attr('data-selected') == 'true') {
        extras = extras + $(this).text() + ', ';
      }
    });
    //Trim , off the end
    extras = extras.slice(0, -2);
  }
  // For subs start extras string with extras
  else if (sectionList == 'subs') {
    // Save the extras seleted (if any) in a string
    extras = extras + 'Extras: ';
    $(this).parent().prev().children().each(function() {
      if ($(this).attr('data-selected') == 'true') {
        extras = extras + $(this).text() + ', ';
      }
    });
    //Trim , off the end
    extras = extras.slice(0, -2);
  }
  // Check which size is selected and assign tosize variable, also get the price
  var size = getSize($(this));

  // If size doesnt exist then no size has been selected. alert user. Salad and pasta dont have size options so size is ''
  if (size == '' && (dishType == 'Sub' || dishType == 'Platter' || dishType == 'Regular Pizza' || dishType == 'Sicilian Pizza')) {
    // Size not selected animation
    $(this).parent().children(':first').children().each(function() {
      $(this).addClass("not-selected");
    });
    setTimeout(function() {
      $('.pricebtn').removeClass("not-selected");
    }, 100);
    // End function so item is not added to cart
    return false;
  }

  //Append to cart list
  var cartItem = {
    'sectionList': sectionList,
    'id': id,
    'dishType': dishType,
    'size': size,
    'extras': extras
  };

  // Click animation
  $(this).addClass('addcartbtnclicked');
  $('#shopping-cart').addClass('addcartbtnclicked');
  setTimeout(function() {
    $('.addcartbtn').removeClass("addcartbtnclicked");
    $('#shopping-cart').removeClass('addcartbtnclicked');
  }, 200);

  // Update the cart
  updateCart(cartItem);
}

// Returns size of pizzas subs & platters
function getSize(addCartBtn) {
  var sizeDiv = addCartBtn.parent().children(':first');

  var size = "";

  // if size div has more than 1 child then the menu item has size options else theres only 1 size
  if (sizeDiv.children().length > 1) {
    // Iterate through price buttons find selected button and get price/size
    sizeDiv.children().each(function() {
      if ($(this).attr('data-selected') == 'true') {
        size = $(this).attr('data-size');
      }
    });

    return size;
  } else {
    // there is only one size option
    return size;
  }
}

// Check if dish already in basket and update/add quantity key
function updateCart(cartItem) {
  // iterate through cart list if cartItem properties = properties of item already in cart then update quantity
  for (item of cart) {
    if (item.sectionList == cartItem.sectionList && item.id == cartItem.id && item.size == cartItem.size && item.extras == cartItem.extras) {
      item.quantity = item.quantity + 1;

      // Render cart
      renderCart();

      return true;
    }
  }

  // If item makes it through loop1 then there are no duplicates in the cart and set quantity = 1
  cartItem.quantity = 1;
  // Add to cart list
  cart.push(cartItem);
  // render the cart
  renderCart();
}

function renderCart() {
  // Save/update cart session variable on server
  saveCartSession();
  // total price of cart items
  var totalTotal = 0;
  // Remove all cart contents
  $('.cart-contents ol').children().each(function() {
    $(this).remove();
  });

  // If cart is not empty render + enable check out button
  if (cart.length != 0) {
    // iterate over items in cart
    for (var item of cart) {

      var sectionList = item.sectionList;
      var id = item.id;
      var dishType = item.dishType;
      var dishTitle = decodeAmphersand(getDishTitle(sectionList, id));
      var extras = item.extras;
      var size = item.size;
      var quantity = item.quantity;

      var price = getPrice(sectionList, id, size);
      // Calculate total (quantity*price)
      var total = quantity * price;
      // Add item total to total of cart
      totalTotal = totalTotal + total;
      // rounnd to 2 decimal places
      var itemTotal = '$ ' + total.toFixed(2);

      // Generate content object using handlebars template
      var content = cartItemTemplate({
        "dishType": dishType,
        "dishTitle": dishTitle,
        "extras": extras,
        "size": size,
        "price": price,
        "quantity": quantity,
        "total": itemTotal
      });
      $('.cart-contents ol').append(content);
    }
    // enable checkout button
    $('.checkout').attr('disabled', false);
  }
  // if cart empty disable checkout button
  else {
    $('.checkout').attr('disabled', true);
  }

  //Update cart total
  $('.cart-total').text('Total: $ ' + totalTotal.toFixed(2));

  // Add event listerners to quantity buttons
  $('.plus-minus-btn').on('click', updateQuantity);
}


// Update quantity of cart item
function updateQuantity() {
  // Find position of cart item in cart list
  var counter = 0;
  var li = $(this).closest("li");

  // select li
  li = li.prev('li');
  // if length of previous jquery li object is not 0 then there is another li sibling so increment counter
  while (li.length != 0) {
    counter++;
    li = li.prev('li');
  }

  // update quantity of cart item
  if ($(this).attr('data-btn') == '+') {
    cart[counter].quantity = cart[counter].quantity + 1;
    renderCart();
  } else {
    cart[counter].quantity = cart[counter].quantity - 1;
    // if quantity now 0 then remove item from cart
    if (cart[counter].quantity == 0) {
      if (counter == 0) {
        cart.shift();
      } else {
        cart.splice(counter, 1);
      }

    }
    renderCart();
  }

}

// iterate through menu section list and return dish title
function getDishTitle(sectionList, id) {

  for (var i of window[sectionList]) {
    if (i.id == id) {
      var dishTitle = i.dishTitle;
      return dishTitle;
    }

  }
  return 'Error';
}


// iterate through menu section list and return price
function getPrice(sectionList, id, size) {

  for (var i of window[sectionList]) {
    if (i.id == id) {
      let price = 0;
      if (size == "Small") {
        price = i.smallPrice.toFixed(2);
        return price;
      } else if (size == "Large") {
        price = i.largePrice.toFixed(2);
        return price;
      } else {
        price = i.price.toFixed(2);
        return price;
      }
    }
  }
  return 'Error';
}

function decodeAmphersand(encodedString) {

  var parser = new DOMParser();
  var dom = parser.parseFromString(
    '<!doctype html><body>' + encodedString,
    'text/html');
  return dom.body.textContent;
}


// Listeners for showing/hiding navbar cart
$('#shopping-cart').on('click', showCart);
$('#closebtn').on('click', hideCart);


function showCart() {
  //Get position of bottom of navbar on page
  var offsetHeight = $('nav').outerHeight();
  $('#collapsable-cart-content').css('top', offsetHeight);
  //display cart
  $('#collapsable-cart-content').slideDown();
  // SCroll to bottom of cart
  var scrollHeight = document.querySelector('#collapsable-cart-container').scrollHeight;
  document.querySelector('#collapsable-cart-container').scrollTop = scrollHeight;

  //change event listener to hide cart
  $('#shopping-cart').off('click', showCart);
  $('#shopping-cart').on('click', hideCart);
}

function hideCart() {
  $('#collapsable-cart-content').slideUp();
  //Change event listener again
  $('#shopping-cart').on('click', showCart);
  $('#shopping-cart').off('click', hideCart);
}

//Save cart session on server
function saveCartSession() {
  // Convert cart list to string and send ajax request. Cart saved as global var
  var items = JSON.stringify(cart);

  $.ajax({
    type: "GET",
    url: "/ajax/update_cart/",
    data: {
      'cart': items
    },
    success: function(data) {}
  });
}

// Get cart from server and call rendercart
function getCartSession() {
  $.ajax({
    type: "GET",
    url: "/ajax/get_cart/",
    data: {},
    success: function(data) {
      // If cart != false then cart session object exists
      if (data.cart != false) {
        cart = data.cart;

        // if cart not empty render cart
        if (cart.length != 0) {
          renderCart();
        }
      }
    }
  });
}
