# Generated by Django 3.0.3 on 2020-03-07 11:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0005_auto_20200304_0827'),
    ]

    operations = [
        migrations.CreateModel(
            name='Extras',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('extra_name', models.CharField(max_length=100)),
            ],
        ),
    ]
