from django.shortcuts import render, HttpResponse
from .models import Product

# Create your views here.
def home(request):
    return render(request, "index.html")

def checkout_main(request):
    return render(request, "checkout_main.html")

def inventory_mgmt(request):
    return render(request, "inventory_mgmt.html")

def CBO_main(request):
    return render(request, "CBO_main.html")

def login_page(request):
    return render(request, "login.html")

def registration_page(request):
    return render(request, "registration.html")


def item_sales_report(request):
    # Query all products in DB
    products = Product.objects.all()

    # Pass product data to template
    return render(request, "partials/item_sales_table.html", {"products": products})
