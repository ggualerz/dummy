# Generated by Django 4.2.13 on 2024-06-16 15:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0010_member_last_activity_member_member_last_activity_idx'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='elo_pong',
            field=models.IntegerField(db_comment='ELO rating for the pong game', default=1200, verbose_name='Pong ELO rating'),
        ),
    ]
