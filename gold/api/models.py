from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

# Validators
def validate_file_size(file):
    max_size_mb = 10  # Set max size to 10MB
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"File size exceeds {max_size_mb}MB limit.")

def validate_video_type(file):
    allowed_video_types = ['video/mp4', 'video/avi', 'video/mpeg', 'video/quicktime']
    if file.content_type not in allowed_video_types:
        raise ValidationError("Only video files (.mp4, .avi, .mpeg, .mov) are allowed.")

def validate_document_type(file):
    allowed_document_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if file.content_type not in allowed_document_types:
        raise ValidationError("Only documents (.pdf, .doc, .docx, .txt) are allowed.")

def validate_audio_type(file):
    allowed_audio_types = ['audio/webm', 'audio/mpeg', 'audio/wav']
    if file.content_type not in allowed_audio_types:
        raise ValidationError("Only audio files (.webm, .mp3, .wav) are allowed.")

# Entry Model
class Entry(models.Model):
    MOOD_CHOICES = [
        ('happy', 'Happy'),
        ('neutral', 'Neutral'),
        ('sad', 'Sad'),
        ('excited', 'Excited'),
        ('tired', 'Tired'),
        ('angry', 'Angry'),          # New mood
        ('stressed', 'Stressed'),    # New mood
        ('shocked', 'Shocked'),      # New mood
        ('calm', 'Calm'),            # New mood
        ('confused', 'Confused'),    # New mood
        ('loved', 'Loved'),          # New mood
    ]

    content = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Mood field is optional (blank=True)
    mood = models.CharField(max_length=10, choices=MOOD_CHOICES, blank=True, null=True)  # Allow blank mood

    # File fields
    image = models.ImageField(upload_to='entry_images/', blank=True, null=True, validators=[validate_file_size])
    video = models.FileField(upload_to='entry_videos/', blank=True, null=True, validators=[validate_file_size, validate_video_type])
    document = models.FileField(upload_to='entry_documents/', blank=True, null=True, validators=[validate_file_size, validate_document_type])
    voice_note = models.FileField(upload_to='voice_notes/', blank=True, null=True, validators=[validate_file_size, validate_audio_type])

    class Meta:
        verbose_name_plural = 'entries'

    def __str__(self):
        return f"{self.content[:50]}..." if self.content else "No Content"
    
# Add Profile Model
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"