# Generated migration for adding latitude and longitude fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('issues', '0004_remove_issue_accuracy_remove_issue_coordinates_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='issue',
            name='latitude',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='issue',
            name='longitude',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
