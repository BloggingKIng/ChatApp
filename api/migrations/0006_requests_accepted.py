# Generated by Django 4.2.7 on 2023-11-27 16:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_requests'),
    ]

    operations = [
        migrations.AddField(
            model_name='requests',
            name='accepted',
            field=models.BooleanField(default=False),
        ),
    ]
