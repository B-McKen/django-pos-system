from django.db import models

# Create your models here.
class Product(models.Model):
    """
    Class to store all required information pertaining to a product.
    """
    # STRUCTURE: ('db_attr', 'user-read_attr_name')
    DEPARTMENT_CHOICES = [
        ('grocery', 'Grocery'),
        ('nonfood', 'Non-Food'),
        ('fruit', 'Fruit'),
        ('veg', 'Vegetables and Salad'),
        ('bakery', 'Baked Goods'),
        ('misc', 'Miscellaneous Items'),
    ]

    # Make all entries REQUIRED
    EAN = models.CharField(max_length=13, unique=True, blank=False, null=False)
    dept = models.CharField(
        max_length=20,
        choices=DEPARTMENT_CHOICES,
        default='grocery',
        blank=False,
        null=False
    )
    name = models.CharField(max_length=100, blank=False, null=False)
    price = models.DecimalField(max_digits=5, decimal_places=2, blank=False, null=False)
    discount = models.BooleanField(default=False, blank=False, null=False)
    discounted_price = models.DecimalField(max_digits=5, decimal_places=2, blank=False, null=False)
    image = models.ImageField(upload_to="media")
    available_qty = models.IntegerField()

    def __str__(self):
        if self.discount:
            out = f"{self.name} (EAN: {self.EAN}, Department: {self.dept}, Regular Price: {self.price}, "
            out += f"Discounted Price: {self.discounted_price})"
            return out
        return f"{self.name} (EAN: {self.EAN}, Department: {self.dept}, Price: {self.price})"
