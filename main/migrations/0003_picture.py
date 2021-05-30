# Generated by Django 2.2.4 on 2021-03-07 10:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_user_picture'),
    ]

    operations = [
        migrations.CreateModel(
            name='Picture',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('weight', models.FloatField(default=0)),
                ('muscle', models.FloatField(default=0)),
                ('fat', models.FloatField(default=0)),
                ('belly', models.FloatField(default=0)),
                ('Thigh', models.FloatField(default=0)),
                ('arm', models.FloatField(default=0)),
                ('shoulder', models.FloatField(default=0)),
                ('chest', models.FloatField(default=0)),
                ('date', models.DateField()),
                ('email', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='+', to='main.User')),
            ],
        ),
    ]
