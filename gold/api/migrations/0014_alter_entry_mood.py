# Generated by Django 5.1.1 on 2025-02-23 21:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_profile'),
    ]

    operations = [
        migrations.AlterField(
            model_name='entry',
            name='mood',
            field=models.CharField(blank=True, choices=[('happy', 'Happy'), ('neutral', 'Neutral'), ('sad', 'Sad'), ('excited', 'Excited'), ('tired', 'Tired'), ('angry', 'Angry'), ('stressed', 'Stressed'), ('shocked', 'Shocked'), ('calm', 'Calm'), ('confused', 'Confused'), ('loved', 'Loved')], max_length=10, null=True),
        ),
    ]
