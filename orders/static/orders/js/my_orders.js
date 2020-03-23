var width = window.innerWidth;

if (width < 992){
  resizeSmaller();
}

window.addEventListener('resize', resizeSmaller);

function resizeSmaller(){
  // Get screen width
  var width = window.innerWidth;

  if (width < 992){
    // Select 3rd col of each table body row
    $('tbody tr td:nth-child(3)').each(function(){
      // create new tr that spans full width of table
      var rowId = $(this).parent().attr('id')
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      td.setAttribute('colspan', '4');
      tr.style.display =  'none';
      tr.setAttribute('class', 'expanded')

      td.innerHTML = '<h3>Items</h3>' + $(this).html();

      tr.appendChild(td);

      // Insert after current row
      $(this).closest('tr').after(tr);
      //Remove 3rd column from table
      $('#' + rowId + ' .items-col').remove();
    });

    //Add + icon to 2nd column
    $('tbody tr td:nth-child(2)').each(function(){
      $(this).append('<br>+');
    });

    //Remove 3rd table heading
    $('th:nth-child(3)').each(function(){
      $(this).remove();
    });

    // Add event listener on row click`
    $('.expandable').on('click', showRow);

    //Switch event listeners
    window.removeEventListener('resize', resizeSmaller);
    window.addEventListener('resize', resizeLarger);
  }
}

function resizeLarger(){
  // Get screen width
  var width = window.innerWidth;

  if (width > 992){
  // Remove all event listeners on tr
  $('.expandable').off('click', showRow);
  $('.expandable').off('click', hideRow);

  // Add 3rd table heading
  $('th:nth-child(2)').each(function(){
    var th = document.createElement('th');
    th.textContent = 'Items';
    th.setAttribute('class', "items-col");
    $(this).after(th);
  });

  //Remove +- icon from 2nd column td
  $('tbody tr td:nth-child(2)').each(function(){
    $(this).html($(this).html().slice(0,-5));
  });
  // Add back 3rd column td
  $('td:nth-child(2)').each(function(){
    var td = document.createElement('td');
    td.innerHTML = $(this).parent().next().html().slice(25);
    td.setAttribute('class', "items-col");
    $(this).after(td);
  });

  // Remove expanded tr
  $('.expanded').remove();

  // Switch event listeners
  window.removeEventListener('resize', resizeLarger);
  window.addEventListener('resize', resizeSmaller);
}

}


function showRow(){
  //Change + to - from  2nd column
  id = $(this).attr('id');
  secondCol = $('#' + id).children('td')[1];
  secondCol.innerHTML = secondCol.innerHTML.slice(0,-1) + '-';

  //Show row
  $(this).next().show();

  //Remove event listener and add new one to hide
  $('.expandable').off('click', showRow);
  $('.expandable').on('click', hideRow);
}

function hideRow(){
  //Add + icon to 2nd column
  id = $(this).attr('id');
  secondCol = $('#' + id).children('td')[1];
  secondCol.innerHTML = secondCol.innerHTML.slice(0,-1) + '+';
  //Hide row
  $(this).next().hide();

  //Remove event listener and add new one to slide up
  $('.expandable').off('click', hideRow);
  $('.expandable').on('click', showRow);
}
