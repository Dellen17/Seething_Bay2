from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

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

class Entry(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    
    image = models.ImageField(upload_to='entry_images/', blank=True, null=True, validators=[validate_file_size])
    video = models.FileField(upload_to='entry_videos/', blank=True, null=True, validators=[validate_file_size, validate_video_type])
    document = models.FileField(upload_to='entry_documents/', blank=True, null=True, validators=[validate_file_size, validate_document_type])

    class Meta:
        verbose_name_plural = 'entries'

    def __str__(self):
        return f"{self.title[:50]}..."