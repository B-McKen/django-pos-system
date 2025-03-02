"""
Use Celery to schedule daily tasks (i.e. Resetting the daily sales total).
"""
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_pos_system.settings")

celery_app = Celery("my_pos_system")
celery_app.config_from_object("django.conf:settings", namespace="CELERY")
celery_app.autodiscover_tasks()
