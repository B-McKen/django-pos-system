from django.db import models

# Create your models here.

class TodoItem(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)

class Product(models.Model):
    """
    Class to store all required information pertaining to a product.
    """
    EAN = models.CharField(max_length=13)
    name = models.CharField(max_length=100)
    price = models.FloatField()
    discounted_price = models.FloatField()
    image = models.ImageField(upload_to="media")
    available_qty = models.IntegerField()
