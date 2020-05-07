from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

import datetime
import json
import time

from orders.models import *

# Create your views here.
def index(request):
    # Get prices and menu items from db. Format prices to 2 decimal places
    regpizza = RegularPizza.objects.all()
    sicpizza = SicilianPizza.objects.all()
    subs = Subs.objects.all()
    platters = Platters.objects.all()
    pasta = Pasta.objects.all()
    salad = Salad.objects.all()

    # create list for the items that have both a small and large size and those that have only one size
    small_large = [regpizza, sicpizza, platters]
    one_size = [pasta, salad]

    # iterate over each item and change format to 2 decimal places
    for section in small_large:
        for item in section:
            item.small_price = "{:.2f}".format(item.small_price)
            item.large_price = "{:.2f}".format(item.large_price)

    for section in one_size:
        for item in section:
            item.price = "{:.2f}".format(item.price)

    # subs may or may not have a small size
    for sub in subs:
        if sub.small_price:
            sub.small_price = "{:.2f}".format(sub.small_price)
        sub.large_price = "{:.2f}".format(sub.large_price)

    context = {"regpizza": regpizza,
        "sicpizza": sicpizza,
        "toppings": Toppings.objects.all(),
        "extras": Extras.objects.all(),
        "subs": subs,
        "pasta": pasta,
        "salad": salad,
        "platters": platters,
        "index": 'index'
        }

    return render(request, "orders/index.html", context)

def register(request):
    # if request method is post then form has been submitted
    if request.method == "POST":
        # Create dict and add inputs
        info = {}
        info['firstname'] = request.POST["firstname"]
        info['lastname'] = request.POST["lastname"]
        info['username'] = request.POST["username"]
        info['email'] = request.POST["email"]
        info['password'] = request.POST["password"]
        info['confirmation'] = request.POST["confirmation"]

        # iterate through each key. If the value is empty then user has not filled in all fields.
        for key in info:
            if not info[key]:
                # Re-render page with error message
                return render(request, "orders/register.html", {"message": 'Please fill all fields'})

        # Check username and email not already in use. Check passwords match
        if User.objects.filter(username=info['username']).exists():
             return render(request, "orders/register.html", {"message": 'There already exists an account with this username'})

        if User.objects.filter(email=info['email']).exists():
             return render(request, "orders/register.html", {"message": 'There already exists an account with this email'})

        if info['password'] != info['confirmation']:
            return render(request, "orders/register.html", {"message": 'Passwords do not match'})

        # Create new user if checks passed
        user = User.objects.create_user(info['username'], info['email'], info['password'])

        # Add first and last name to user object
        user.first_name = info['firstname']
        user.last_name = info['lastname']

        # Commit to database
        user.save()

        # Redirect to login page
        return HttpResponseRedirect(reverse("login"))

    # User arrive via get request
    else:
        return render(request, "orders/register.html")


# User redirected to login page if not logged in
@login_required(login_url='login')
def checkout(request):
    # If get request user arrived here from checkout page, render the cart
    if request.method == 'GET':
        # Get cart object
        try:
            cart = request.session['cart']
            # returns a dict containing a list of cart items and total price
            new_cart = get_prices_cart_total(cart)

            cart = new_cart['cart']
            cartTotal = new_cart['cart_total']

            context = {"cart": cart,
                        "cartTotal": cartTotal
            }

            return render(request, "orders/checkout.html", context)
        # If there is no session object called cart then exception will occur. user must not have visited menu page, cart must be empty
        except:
            context = {"cart": [],
                        "cartTotal": 0,
            }
            return render(request, "orders/checkout.html", context)

    # User arrived here by clicking place order, process the order
    else:
        # save order to orders table
        try:
            user = User.objects.get(pk=request.session['user_id'])
            date_now = datetime.datetime.now()
            cart = json.dumps(request.session['cart'])
            status = 'received'

            # Create new order object and save to orders table
            order = Orders(user_id=user, time_date=date_now,cart=cart, status=status)
            order.save()

            order_id = str(order.id)

            # Clear cart session after order saved in table
            del request.session['cart']

        except:
            message = 'Sorry, we could not process your oder at this time, please try again later'
            context = {
                'message': message
            }
            return render("orders/error.html", context)

        return HttpResponseRedirect('/order_confirmed/' + order_id)

@login_required(login_url='login')
def order_confirmed(request, order_id):
    order = Orders.objects.get(pk=order_id)

    # if user id doesnt match the order id or there is no matching order send order invalid message
    if order is None or order.user_id.id != request.session['user_id']:
        message = 'Order id invalid'
        context = {
            'message': message
        }
        return render(request, "orders/error.html", context)

    context = {
    'order_id': order_id,
    }

    return render(request, "orders/order_confirmed.html", context)

@login_required(login_url='login')
def my_orders(request):
    # Get all orders made by the user in descending time date order
    my_orders = Orders.objects.filter(user_id=request.user).all().order_by('-time_date')

    #decode cart from string to dict
    for order in my_orders:
        order.cart = json.loads(order.cart)
        new_cart = get_prices_cart_total(order.cart)
        order.cart = new_cart['cart']
        order.cart_total = new_cart['cart_total']

    context = {
        'my_orders': my_orders,
    }

    return render(request, "orders/my_orders.html", context)


def login_user(request):

    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        user = authenticate(request, username=username, password=password)

        # if user authenticated then log them in
        if user is not None:
            login(request, user)
            request.session['user_id'] = user.id

            # if user needs to be redirected then send them to that view
            if request.GET.get('next'):
                next = request.GET.get('next')
                return HttpResponseRedirect(next)
            else:
                return HttpResponseRedirect(reverse('index'))
        # Else invalid credentials entered
        else:
            return render(request, "orders/login.html", {"message": 'Incorrect username or password'})

    else:
        return render(request, "orders/login.html")

def logout_user(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))

# Updates the cart session variable
def update_cart(request):
    #Convert cart from json string format to python list
    cart = json.loads(request.GET.get('cart'))

    # Save in session variable
    request.session['cart'] = cart

    return JsonResponse({"success": True})

# Looks up the cart session variable
def get_cart(request):
    # Get cart variable from session if it exists and respond to ajax request
    try:
        cart = request.session['cart']
        return JsonResponse({"cart": cart})
    # If there is an exception session object cart has not been set
    except:
        return JsonResponse({"cart": False})

# Updates the status of customer orders
def update_status(request):
    status = request.GET.get('status')

    # Change status property
    order = Orders.objects.get(pk=request.GET.get('orderId'))
    order.status = status
    order.save()

    return JsonResponse({'status': status, 'orderId': str(request.GET.get('orderId'))})

# Show all orders, only allow access to staff members
@login_required(login_url='login')
def view_orders(request):
    if request.user.is_staff:
        orders = Orders.objects.all().order_by('-id')

        #decode cart property
        for order in orders:
            order.cart = json.loads(order.cart)
            new_cart = get_prices_cart_total(order.cart)
            order.cart = new_cart['cart']
            order.cart_total = new_cart['cart_total']

        context = {'orders': orders}

        return render(request, 'orders/view_orders.html', context)
    else:
        return render(request, "orders/error.html", {"message": 'You are not permitted to view this page'})


# Looks up prices of items in db and adds them to cart. calculates cart total
def get_prices_cart_total(cart):
    cartTotal = 0
    # iterate through cart
    for item in cart:
        # select the correct table
        section_list = get_db_objects(item['sectionList'])

        # iterate through objects in section list
        for i in section_list:
            # find the item in the section list and save dish name and price in the item
            id = str(i.id)
            if (id == item['id']):
                item['dishTitle'] = i.name
                # Pasta and salad have only one size/price
                if item['dishType'] == 'Pasta' or item['dishType'] == 'Salad':
                    item['price'] = i.price
                else:
                    if item['size'] == 'Small':
                        item['price'] = i.small_price
                    else:
                        item['price'] = i.large_price
                item['total'] = item['price'] * item['quantity']
                cartTotal = cartTotal + item['total']

                #Format to 2 deciaml places
                item['price'] = "{:.2f}".format(item['price'])
                item['total'] = "{:.2f}".format(item['total'])

                # When item found break out of the loop
                break

    cartTotal = "{:.2f}".format(cartTotal)

    return {'cart': cart, 'cart_total': cartTotal}

# returns all objects from the correct table based on dish type
def get_db_objects(dishType):
    objects = {'regularPizzas': RegularPizza.objects.all(),
                'sicilianPizzas': SicilianPizza.objects.all(),
                'subs': Subs.objects.all(),
                'pasta': Pasta.objects.all(),
                'salad': Salad.objects.all(),
                'platters': Platters.objects.all()}

    return objects[dishType]
