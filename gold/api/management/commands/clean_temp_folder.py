import os
import time
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Cleans up old files in the temp folder'

    def handle(self, *args, **options):
        self.stdout.write("Starting temp folder cleanup...")

        # Define the temp folder path
        temp_folder = os.path.join(settings.MEDIA_ROOT, 'temp')
        if not os.path.exists(temp_folder):
            self.stdout.write(self.style.WARNING("Temp folder does not exist. Nothing to clean."))
            return

        # Get the current time
        current_time = time.time()
        # Define the age threshold (1 hour = 3600 seconds)
        age_threshold = 3600

        # Counter for deleted files
        deleted_files = 0

        # Iterate over files in the temp folder
        for filename in os.listdir(temp_folder):
            file_path = os.path.join(temp_folder, filename)
            # Check if it's a file (not a directory)
            if os.path.isfile(file_path):
                # Get the file's modification time
                file_mtime = os.path.getmtime(file_path)
                # Calculate the file's age
                file_age = current_time - file_mtime
                # If the file is older than the threshold, delete it
                if file_age > age_threshold:
                    try:
                        os.remove(file_path)
                        self.stdout.write(self.style.SUCCESS(f"Deleted: {filename}"))
                        deleted_files += 1
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Failed to delete {filename}: {str(e)}"))

        if deleted_files == 0:
            self.stdout.write("No files were old enough to delete.")
        else:
            self.stdout.write(self.style.SUCCESS(f"Deleted {deleted_files} file(s)."))

        self.stdout.write("Temp folder cleanup completed.")