// On update send status to server and change status column and active/completed table
$('.update-btn').on('click', function(){
  var status = $(this).parent().children(':first').val();
  var orderId = $(this).closest('tr').attr('id');

  // send new status to server
  $.ajax({
    type: "GET",
    url: "/ajax/update_status/",
    data: {
        'orderId': orderId,
        'status': status,
    },
    success: function(data){

      // Change order status column
      $('#' + data.orderId + ' .order-status').text(data.status);

      // If order now delivered move to completed table
      if (data.status == 'delivered' && $('#' + data.orderId).parent().attr('id') == 'active'){
        // Copy row content
        var rowContent = $('#' + data.orderId).html();
        var row = "<tr id=" + data.orderId + "> " + rowContent + "</tr>";

        // Remove row from active table
        $('#' + data.orderId).remove();

        // Prepend row to completed table
        $('#completed').prepend(row);
      }
      // if row in completed tabled changed to be undelivered move it back to active table
      else if (data.status != 'delivered' && $('#' + data.orderId).parent().attr('id') == 'completed') {
        // Copy row content
        var rowContent = $('#' + data.orderId).html();
        var row = "<tr id=" + data.orderId + "> " + rowContent + "</tr>";

        // Remove row from completed table
        $('#' + data.orderId).remove();

        // Prepend row to active table
        $('#active').prepend(row);
      }
    }

  }
);
});

// Refresh table every 30 seconds to check for new orders
setTimeout(function(){
   window.location.reload(1);
}, 60000);
