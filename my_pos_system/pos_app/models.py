from django.db import models

# Create your models here.
class Product(models.Model):
    """
    Class to store all required information pertaining to a product.
    """
    EAN = models.CharField(max_length=13)
    name = models.CharField(max_length=100)
    price = models.FloatField()
    discount = models.BooleanField(default=False)
    discounted_price = models.FloatField()
    image = models.ImageField(upload_to="media")
    available_qty = models.IntegerField()

    def __str__(self):
        if self.discount:
            out = f"{self.name} (EAN: {self.EAN}, Regular Price: {self.price}, "
            out += f"Discounted Price: {self.discounted_price})"
            return out
        return f"{self.name} (EAN: {self.EAN}, Price: {self.price})"
