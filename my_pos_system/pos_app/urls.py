from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("checkout-main/", views.checkout_main, name="Customer Checkout"),
    path("supervisor-login/", views.login_page, name="Login"),
    path("supervisor-registration/", views.registration_page, name="Supervisor Registration"),
    path("inventory/", views.inventory_mgmt, name="Inventory Management"),
    path("backoffice/", views.CBO_main, name="Backoffice"),
    path("backoffice/sales-by-item/", views.item_sales_report, name="Item Sales"),
    # Below are for views / JS interaction
    path("api/product/", views.scanned_product, name="Scanned Product"),
    path("api/product/department/", views.PLU_products, name="Products in Department"),
    path("api/search-product/", views.search_results, name="Search Results"),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
