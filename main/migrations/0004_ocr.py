# Generated by Django 2.2.4 on 2021-01-19 22:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_auto_20210116_1654'),
    ]

    operations = [
        migrations.CreateModel(
            name='OCR',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('photo', models.ImageField(upload_to='ocr/')),
            ],
        ),
    ]
