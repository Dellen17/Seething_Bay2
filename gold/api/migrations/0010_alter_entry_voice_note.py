# Generated by Django 5.1.1 on 2024-10-30 08:06

import api.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_alter_entry_content'),
    ]

    operations = [
        migrations.AlterField(
            model_name='entry',
            name='voice_note',
            field=models.FileField(blank=True, null=True, upload_to='voice_notes/', validators=[api.models.validate_file_size, api.models.validate_audio_type]),
        ),
    ]
