# Generated by Django 2.2.4 on 2021-04-24 15:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0009_user_pday'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='metabolism',
            field=models.IntegerField(default=0),
        ),
    ]