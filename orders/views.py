from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

import datetime
import json

from orders.models import *

# Create your views here.
def index(request):
    # Get prices and menu items from db. Format prices to 2 decimal places
    regpizza = RegularPizza.objects.all()
    for pizza in regpizza:
        pizza.small_price = "{:.2f}".format(pizza.small_price)
        pizza.large_price = "{:.2f}".format(pizza.large_price)

    sicpizza = SicilianPizza.objects.all()
    for pizza in sicpizza:
        pizza.small_price = "{:.2f}".format(pizza.small_price)
        pizza.large_price = "{:.2f}".format(pizza.large_price)

    subs = Subs.objects.all()
    for sub in subs:
        if sub.small_price:
            sub.small_price = "{:.2f}".format(sub.small_price)
        sub.large_price = "{:.2f}".format(sub.large_price)

    platters = Platters.objects.all()
    for platter in platters:
        platter.small_price = "{:.2f}".format(platter.small_price)
        platter.large_price = "{:.2f}".format(platter.large_price)

    pasta = Pasta.objects.all()
    for p in pasta:
        p.price = "{:.2f}".format(p.price)

    salad = Salad.objects.all()
    for s in salad:
        s.price = "{:.2f}".format(s.price)

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
    if request.method == "POST":
        info = {}
        info['firstname'] = request.POST["firstname"]
        info['lastname'] = request.POST["lastname"]
        info['username'] = request.POST["username"]
        info['email'] = request.POST["email"]
        info['password'] = request.POST["password"]
        info['confirmation'] = request.POST["confirmation"]

        for key in info:
            if not info[key]:
                return render(request, "orders/register.html", {"message": 'Please fill all fields'})

        if User.objects.filter(username=info['username']).exists():
             return render(request, "orders/register.html", {"message": 'There already exists an account with this username'})

        if User.objects.filter(email=info['email']).exists():
             return render(request, "orders/register.html", {"message": 'There already exists an account with this email'})

        if info['password'] != info['confirmation']:
            return render(request, "orders/register.html", {"message": 'Passwords do not match'})

        user = User.objects.create_user(info['username'], info['email'], info['password'])

        user.first_name = info['firstname']
        user.last_name = info['lastname']

        user.save()

        return HttpResponseRedirect(reverse("login"))
    else:
        return render(request, "orders/register.html")



@login_required(login_url='login')
def checkout(request):
    # If get request user arrived here from checkout page, render the cart
    if request.method == 'GET':
        cart = request.session['cart']

        new_cart = get_prices_cart_total(cart)

        cart = new_cart['cart']
        cartTotal = new_cart['cart_total']

        context = {"cart": cart,
                    "cartTotal": cartTotal
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

    if order is None or order.user_id.id != request.session['user_id']:
        message = 'Order id invalid'
        context = {
            'message': message
        }
        return render(request, "orders/error.html", context)

    user = User.objects.get(pk=request.session['user_id'])
    context = {
    'order_id': order_id,
    'user': user
    }

    return render(request, "orders/order_confirmed.html", context)

@login_required(login_url='login')
def my_orders(request):
    my_orders = Orders.objects.filter(user_id=request.user).all().order_by('-time_date')

    #decode order column
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

        if user is not None:
            login(request, user)
            request.session['user_id'] = user.id

            # if user needs to be redirect to another url then save it
            if request.GET.get('next') != '':
                next = request.GET.get('next')
                return HttpResponseRedirect(next)
            else:
                return HttpResponseRedirect(reverse('index'))
        else:
            return render(request, "orders/login.html", {"message": 'Incorrect username or password'})

    else:
        return render(request, "orders/login.html")

def logout_user(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def update_cart(request):
    #Convert cart from json string format to python list
    cart = json.loads(request.GET.get('cart'))

    # Save in session variable
    request.session['cart'] = cart

    return JsonResponse({"success": True})

def get_cart(request):
    # Get cart variable from session if it exists and respond to ajax request
    try:
        cart = request.session['cart']
        return JsonResponse({"cart": cart})
    # If there is an exception session object cart has not been set
    except:
        return JsonResponse({"cart": False})

def update_status(request):
    status = request.GET.get('status')

    order = Orders.objects.get(pk=request.GET.get('orderId'))
    order.status = status
    order.save()

    return JsonResponse({'status': status, 'orderId': str(request.GET.get('orderId'))})

# Show all orders, only allow access to superusers
@login_required(login_url='login')
def view_orders(request):
    if request.user.is_staff:
        orders = Orders.objects.all().order_by('-id')

        #decode order column
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
        # select the correct section list
        section_list = get_db_objects(item['sectionList'])

        # iterate through objects in section list
        for i in section_list:
            # find the item in the section list and save dish name and price in the item
            id = str(i.id)
            if (id == item['id']):
                item['dishTitle'] = i.name
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

                break

    cartTotal = "{:.2f}".format(cartTotal)

    return {'cart': cart, 'cart_total': cartTotal}

# returns all objects from the db based on dish type
def get_db_objects(dishType):
    objects = {'regularPizzas': RegularPizza.objects.all(),
                'sicilianPizzas': SicilianPizza.objects.all(),
                'subs': Subs.objects.all(),
                'pasta': Pasta.objects.all(),
                'salad': Salad.objects.all(),
                'platters': Platters.objects.all()}

    return objects[dishType]
