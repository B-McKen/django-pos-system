from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # Page views
    path("", views.home, name="home"),
    path("checkout-main/", views.checkout_main, name="customer_checkout"),
    path("supervisor-login/", views.login_page, name="login"),
    path("supervisor-registration/", views.registration_page, name="supervisor_registration"),
    path("inventory/", views.inventory_mgmt, name="inventory_management"),
    path("backoffice/", views.CBO_main, name="backoffice"),
    path("backoffice/sales-by-item/", views.item_sales_report, name="item_sales"),

    # API endpoints for JS interaction
    path("api/product/", views.scanned_product, name="scanned_product"),
    path("api/product/department/", views.PLU_products, name="plu_products"),
    path("api/search-product/", views.search_results, name="search_results"),
    path("update-sales/<str:product_EAN>/", views.update_sales, name="update_sales_quantity"),

    # Receipt handling
    path("receipt-pdf/", views.receipt_pdf, name="receipt_pdf"),
    path("download-receipt/<int:trans_no>/", views.download_receipt, name="download_receipt"),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
