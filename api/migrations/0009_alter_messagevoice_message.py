# Generated by Django 5.0.6 on 2024-06-25 14:50

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_messagevoice'),
    ]

    operations = [
        migrations.AlterField(
            model_name='messagevoice',
            name='message',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='voice', to='api.message'),
        ),
    ]
