# Generated by Django 5.0.6 on 2024-06-28 06:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_notification'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='link',
            field=models.URLField(default='', max_length=300),
        ),
    ]
