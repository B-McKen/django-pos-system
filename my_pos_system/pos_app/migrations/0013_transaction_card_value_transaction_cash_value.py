# Generated by Django 5.1.4 on 2025-04-09 22:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pos_app', '0012_product_last_sales_reset_product_sales_today'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='card_value',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=8),
        ),
        migrations.AddField(
            model_name='transaction',
            name='cash_value',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=8),
        ),
    ]
