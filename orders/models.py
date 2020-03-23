from django.conf import settings
from django.db import models

# Create your models here.
class RegularPizza(models.Model):
    name = models.CharField(max_length=100)
    small_price = models.FloatField()
    large_price = models.FloatField()

    def __str__(self):
        return f"{self.name}"

class SicilianPizza(models.Model):
    name = models.CharField(max_length=100)
    small_price = models.FloatField()
    large_price = models.FloatField()

    def __str__(self):
        return f"{self.name}"

class Toppings(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name}"

class Extras(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name}"

class Subs(models.Model):
    name = models.CharField(max_length=100)
    small_price = models.FloatField(blank=True, null=True)
    large_price = models.FloatField()

    def __str__(self):
        return f"{self.name}"

class Pasta(models.Model):
    name = models.CharField(max_length=100)
    price = models.FloatField()

    def __str__(self):
        return f"{self.name}"

class Salad(models.Model):
    name = models.CharField(max_length=100)
    price = models.FloatField()

    def __str__(self):
        return f"{self.name}"

class Platters(models.Model):
    name = models.CharField(max_length=100)
    small_price = models.FloatField()
    large_price = models.FloatField()

    def __str__(self):
        return f"{self.name}"

class Orders(models.Model):
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    time_date = models.DateTimeField()
    cart = models.TextField()
    status = models.CharField(max_length=25, blank=True)

    def __str__(self):
        return f"{self.id}"
