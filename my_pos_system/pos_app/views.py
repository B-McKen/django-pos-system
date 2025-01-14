from django.shortcuts import render, HttpResponse
from .models import Product

# Create your views here.
def home(request):
    return render(request, "home.html")

def checkout_main(request):
    return render(request, "checkout_main.html")
