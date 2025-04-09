from django.db import models
from django.utils.timezone import now

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

    # Make all entries REQUIRED (blank / null false)
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
    image = models.ImageField(upload_to="product_images")
    available_qty = models.IntegerField()
    sales_today = models.PositiveIntegerField(default=0)
    last_sales_reset = models.DateField(default=now)

    def reset_daily_sales(self):
        """
        Reset sales_today if it is the next day (manual check when purchasing).
        """
        if self.last_sales_reset < now().date():
            self.sales_today = 0
            self.last_sales_reset = now().date()
            self.save()

    def __str__(self):
        if self.discount:
            out = f"{self.name} (EAN: {self.EAN}, Department: {self.dept}, Regular Price: {self.price}, "
            out += f"Discounted Price: {self.discounted_price})"
            return out
        return f"{self.name} (EAN: {self.EAN}, Department: {self.dept}, Price: {self.price})"


class Transaction(models.Model):
    """
    Class to store transaction number, date, time, value, and receipt image for transactions.
    """
    trans_no = models.BigAutoField(primary_key=True) # Non-resettable, auto-increments
    date = models.DateField(auto_now_add=True, blank=False)
    time = models.TimeField(auto_now_add=True, blank=False)
    cash_value = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    card_value = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    trans_value = models.DecimalField(max_digits=8, decimal_places=2)
    receipt = models.ImageField(upload_to="receipts/")

    def __str__(self):
        return f"Transaction Number {self.trans_no}, Date: {self.date}, Time: {self.time}, Value: £{self.trans_value}"
