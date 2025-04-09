# pylint: disable=no-member
import logging
import os
import json
import subprocess
from django.db.models import Q
from django.shortcuts import render
from django.http import JsonResponse, FileResponse, Http404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from .models import Product
from .models import Transaction

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

            # Fetch products containing a case insensitive name match
            # OR an exact match with EAN / barcode number
            matching_products = Product.objects.filter(
                Q(name__icontains=search_term) | Q(EAN__iexact=search_term)
            )

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


@csrf_exempt
def receipt_pdf(request):
    """
    Fetch transaction details to create a DB entry for it.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Extract details of transaction
            trans_date = data.get('trans_date')
            trans_time = data.get('trans_time')
            cash_value = data.get('cash_value')
            card_value = data.get('card_value')
            trans_value = data.get('trans_value')
            receipt_html = data.get('receipt_html')

            required_fields = [trans_date, trans_time, trans_value, receipt_html]
            if any(field in [None, ""] for field in required_fields):
                return JsonResponse({'error': 'Missing required data!'}, status=400)

            # Create DB entry
            transaction = Transaction.objects.create(
                date=trans_date,
                time=trans_time,
                cash_value=cash_value,
                card_value=card_value,
                trans_value=trans_value
            )

            # Insert primary key (transaction number) into receipt HTML
            trans_no = transaction.trans_no
            logger.info(f"Transaction created with number {trans_no}")
            receipt_html = receipt_html.replace("#TEST", str(trans_no))

            # PDF file path
            pdf_filename = f"transaction-number-{trans_no}.pdf"
            pdf_filepath = os.path.join(settings.MEDIA_ROOT, 'receipts', pdf_filename)

            # HTML => PDF
            error = html_to_pdf(receipt_html, pdf_filepath)
            if error:
                logger.error(f"PDF GENERATION FAILED: {error}")
                return JsonResponse({'error': 'Failed to generate PDF'}, status=500)

            # Save to DB entry
            transaction.receipt = f"receipts/{pdf_filename}"
            transaction.save()

            return JsonResponse({'success': True,
                                 'pdf_url': f"{settings.MEDIA_URL}receipts/{pdf_filename}",
                                 'transaction_no': trans_no})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method!'}, status=405)


def download_receipt(request, trans_no):
    """
    Fetch receipt PDF for transaction and return as file download.
    """
    try:
        # Find transaction
        transaction = Transaction.objects.get(trans_no=trans_no)
        # Find PDF path
        pdf_path = os.path.join(settings.MEDIA_ROOT, str(transaction.receipt))

        # Check if it exists
        if not os.path.exists(pdf_path):
            raise Http404("Receipt not found!")

        # Return file
        return FileResponse(open(pdf_path, 'rb'),
                            as_attachment=True,
                            filename=f"receipt-trans-no-{trans_no}.pdf")

    except Exception as e:
        raise Http404(f"Error retrieving receipt: {str(e)}")


def html_to_pdf(source_html, output_path):
    """
    Use wkhtmltopdf to turn the HTML content of a receipt into a PDF.
    """
    try:
        # Path to wkhtmltopdf (as set in settings.py)
        wkhtmltopdf_path = getattr(settings, "WKHTMLTOPDF_CMD", "wkhtmltopdf")

        # Use subprocess to call wkhtmltopdf
        process = subprocess.run(
            [wkhtmltopdf_path, "--encoding", "utf-8", "--quiet", "-", output_path],
            input=source_html.encode("utf-8"),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False
        )

        # Check for errors
        if process.returncode != 0:
            return f"wkhtmltopdf error: {process.stderr.decode('utf-8')}"

        return None  # No errors

    except Exception as e:
        return str(e)


@csrf_exempt
def update_sales(request, product_EAN):
    """
    Update daily sales total and available quantity based on transaction.
    """
    if request.method == "POST":
        try:
            product = Product.objects.get(EAN=product_EAN)
            # Check if reset is required
            product.reset_daily_sales()

            data = json.loads(request.body)
            quantity = int(data.get("quantity", 0))

            # Update sales today based on quantity sold in transaction
            product.sales_today += quantity
            # Update available quantity
            product.available_qty -= quantity
            product.save()

            return JsonResponse({"message": "Sales updated", "sales_today": product.sales_today})
        except Product.DoesNotExist:
            return JsonResponse({"error": "Product not found"}, status=404)
    return JsonResponse({"error": "Invalid request!"}, status=400)


def item_sales_report(request):
    # Query all products in DB
    products = Product.objects.all()

    # Pass product data to template
    return render(request, "partials/item_sales_table.html", {"products": products})
