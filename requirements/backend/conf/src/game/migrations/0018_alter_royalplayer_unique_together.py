# Generated by Django 4.2.13 on 2024-06-19 15:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0017_alter_royalplayer_position'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='royalplayer',
            unique_together={('match', 'position', 'member')},
        ),
    ]