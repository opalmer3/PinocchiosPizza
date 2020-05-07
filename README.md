# Pizza delivery website - Django
A fully responsively and interactively designed pizza takeaway website .

"/" - index page - contains the menu and shopping cart. On page load all menu items are passed to the client and save in a javascript array of dicts containing the information for each menu item. For each menu item size can be selected by clicking the size buttons.  For pizzas toppings can be selected by clicking on buttons with the topping names and extras can be added to subs. Item size must be selected before the item can be added to the cart. Upon adding an item to the cart, item information is retrieved from the array of dicts and rendered on the page. The user can edit the quantity of items in the cart by clicking +/- buttons and the item will be automatically removed if the quantity is 0. Checkout button is disabled if cart is empty and if user is not logged in and clicks checkout they will be redirected to the log in page then redirected to the checkout after logging in. If the user navigates away from the page and comes back later their cart contents are saved in a session variable.

"/login" "register" - Pages where user can create an account an log in using Django's authentication system.

"/checkout" - checkout page - Cart is sent to the server and prices of items are retrieved from the database and presented in a table. User can confirm the order or go back to index page to edit their order.

"/order_confirmed" - Order confirmation page - When the user confirms their order, their order is added to the orders database and a page is rendered displaying their confirmation number and a message. The cart session variable is cleared.

"/my_orders" - my orders page - Displays all orders by the user and separated into an active orders table and completed orders table. When viewed on smaller screens the table collapses and each row is expandable showing order information on click of the table row.

"/admin/view_orders" - A Page only accessible by users with a staff account. Shows all user orders and a dropdown menu for changing the status of each order. When status is changed to delivered it is automatically moved to a completed orders table. Page automatically refreshes every minute to display new orders.
