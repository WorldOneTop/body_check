# Generated by Django 2.2.4 on 2021-05-23 22:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0011_board'),
    ]

    operations = [
        migrations.AddField(
            model_name='board',
            name='isSecret',
            field=models.BooleanField(default=False),
        ),
    ]
