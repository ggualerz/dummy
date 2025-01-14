# Generated by Django 4.2.13 on 2024-06-16 15:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0011_member_elo_pong'),
    ]

    operations = [
        migrations.AlterField(
            model_name='member',
            name='elo_pong',
            field=models.IntegerField(db_comment='ELO rating for the pong game', default=1000, verbose_name='Pong ELO rating'),
        ),
    ]
