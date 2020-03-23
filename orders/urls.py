from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("register", views.register, name="register"),
    path("login", views.login_user, name="login"),
    path("logout", views.logout_user, name="logout"),
    path("my_orders", views.my_orders, name="my_orders"),
    path("checkout", views.checkout, name="checkout"),
    path("order_confirmed/<int:order_id>", views.order_confirmed, name="order_confirmed"),
    path("ajax/update_cart/", views.update_cart, name="update_cart"),
    path("ajax/get_cart/", views.get_cart, name="get_cart"),
    path("ajax/update_status/", views.update_status, name="update_status"),
    path("admin/view_orders", views.view_orders, name="view_orders"),
]
