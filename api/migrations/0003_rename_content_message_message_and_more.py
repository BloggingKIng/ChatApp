# Generated by Django 4.2.7 on 2023-11-26 11:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='message',
            old_name='content',
            new_name='message',
        ),
        migrations.RenameField(
            model_name='message',
            old_name='sent_date',
            new_name='sentdate',
        ),
    ]
