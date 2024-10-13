from rest_framework import serializers # type: ignore
from .models import Entry

class EntrySerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    author = serializers.ReadOnlyField(source='author.username')
    image = serializers.ImageField(use_url=True, required=False)  # Keeping use_url=True
    video = serializers.FileField(required=False)
    document = serializers.FileField(required=False)

    class Meta:
        model = Entry
        fields = ['id', 'title', 'content', 'timestamp', 'author', 'image', 'video', 'document']
        read_only_fields = ['id', 'author', 'timestamp']

    def validate_image(self, value):
        # Check for empty file to ensure image is valid
        if value.size == 0:
            raise serializers.ValidationError("Uploaded image is empty.")
        return value

    def validate_video(self, value):
        # Check for empty file to ensure video is valid
        if value.size == 0:
            raise serializers.ValidationError("Uploaded video is empty.")
        return value

    def validate_document(self, value):
        # Check for empty file to ensure document is valid
        if value.size == 0:
            raise serializers.ValidationError("Uploaded document is empty.")
        return value