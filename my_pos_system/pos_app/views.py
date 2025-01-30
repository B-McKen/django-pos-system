# pylint: disable=no-member
import logging
from django.shortcuts import render
from django.http import JsonResponse
from .models import Product

logger = logging.getLogger(__name__)

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

# DB interaction
def scanned_product(request):
    """
    Fetch details of a product based on the EAN provided in the GET request.
    """
    if request.method == 'GET':
        searched_EAN = request.GET.get('EAN')
        try:
            # Fetch product
            product = Product.objects.get(EAN=searched_EAN)

            # Response data
            response_data = {
                'EAN': product.EAN,
                'name': product.name,
                'price': float(product.price),
                'discount': product.discount,
                'discounted_price': float(product.discounted_price) if product.discount else None,
                'image_url': product.image.url if product.image else None, # Image URL
                'available_qty': product.available_qty,
            }
            return JsonResponse(response_data)
        except Product.DoesNotExist:
            return JsonResponse({'error': 'Product Not Found'}, status=404)

def item_sales_report(request):
    # Query all products in DB
    products = Product.objects.all()

    # Pass product data to template
    return render(request, "partials/item_sales_table.html", {"products": products})
