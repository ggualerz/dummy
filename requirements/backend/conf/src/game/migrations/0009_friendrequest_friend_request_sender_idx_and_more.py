# Generated by Django 4.2.13 on 2024-05-27 14:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0008_alter_friendrequest_options_and_more'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='friendrequest',
            index=models.Index(fields=['sender'], name='friend_request_sender_idx'),
        ),
        migrations.AddIndex(
            model_name='friendrequest',
            index=models.Index(fields=['recipient'], name='friend_request_recipient_idx'),
        ),
    ]