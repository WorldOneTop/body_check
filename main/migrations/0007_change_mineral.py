# Generated by Django 2.2.4 on 2021-02-12 11:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0006_auto_20210211_2351'),
    ]

    operations = [
        migrations.AddField(
            model_name='change',
            name='Mineral',
            field=models.FloatField(null=True),
        ),
    ]