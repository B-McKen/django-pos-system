# pylint: disable=no-member
import logging
import json
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
def search_results(request):
    """
    Fetch any matching results when text is entered into the search bar.
    """
    try:
        if request.method == 'GET':
            search_term = request.GET.get('search-term')
            print(f"Received search parameter: {search_term}")

            # Fetch products containing a case insensitive match (QuerySet)
            matching_products = Product.objects.filter(name__icontains=search_term)

            # Return no result to occupy auto-complete bar
            if not matching_products.exists():
                return JsonResponse({'error': 'No matching products found!'}, status=404)

            # Put matching product information into JSON structure
            response_data = [
                {
                    'EAN': product.EAN,
                    'name': product.name,  
                }
                for product in matching_products
            ]

            return JsonResponse(response_data, safe=False)

    except Exception as e:
        print(f"API Error: {e}")
        return JsonResponse({'error': 'Server error'}, status=500)

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
                'dept': product.dept,
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

def PLU_products(request):
    """
    Fetch details of products in a specific department (e.g. fruit, veg, etc.).
    """
    try:
        if request.method == 'GET':
            search_dept = request.GET.get('dept')
            print(f"Received department query: {search_dept}")  # Debugging

            products = Product.objects.filter(dept=search_dept)

            if not products.exists():
                return JsonResponse({'error': 'No products found in this department'}, status=404)

            response_data = [
                {
                    'EAN': product.EAN,
                    'dept': product.dept,
                    'name': product.name,
                    'price': product.price,
                    'discount': product.discount,
                    'discounted_price': product.discounted_price,
                    'image': product.image.url if product.image else None,
                    'available_qty': product.available_qty
                }
                for product in products
            ]

            return JsonResponse(response_data, safe=False)

    except Exception as e:
        print(f"API Error: {e}")
        return JsonResponse({'error': 'Server error'}, status=500)

def item_sales_report(request):
    # Query all products in DB
    products = Product.objects.all()

    # Pass product data to template
    return render(request, "partials/item_sales_table.html", {"products": products})
