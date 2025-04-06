from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_alter_entry_document_alter_entry_image_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='Profile',
            name='profile_picture',
            field=models.URLField(max_length=500, blank=True, null=True),
        ),
    ]