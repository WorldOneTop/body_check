# Generated by Django 2.2.4 on 2021-04-17 11:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0008_auto_20210417_0915'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='pDay',
            field=models.SmallIntegerField(default=0),
        ),
    ]
