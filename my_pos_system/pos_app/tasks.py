# pylint: disable=no-member
"""
File to schedule tasks.
"""
import logging
from celery import shared_task
from django.utils.timezone import now
from .models import Product

logger = logging.getLogger(__name__)

@shared_task
def reset_sales_task():
    """
    Reset sales_today for all Product DB entries.
    """
    try:
        logger.info("Resetting sales for all products...") # Debug
        Product.objects.update(sales_today=0, last_sales_reset=now().date())
    except Exception as e:
        logger.error(f'ERROR RESETTING SALES {e}')
    return "Sales reset successfully!"
