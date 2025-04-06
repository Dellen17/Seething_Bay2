from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='Profile',
            name='profile_picture',
            field=models.URLField(max_length=500, blank=True, null=True),
        ),
    ]