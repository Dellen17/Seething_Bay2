from rest_framework import serializers # type: ignore
from .models import Entry

class EntrySerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    author = serializers.ReadOnlyField(source='author.username')
    image = serializers.ImageField(use_url=True, required=False)
    video = serializers.FileField(required=False)
    document = serializers.FileField(required=False)
    voice_note = serializers.FileField(required=False)  # Add voice_note field

    class Meta:
        model = Entry
        fields = ['id', 'content', 'timestamp', 'author', 'image', 'video', 'document', 'mood', 'voice_note']
        read_only_fields = ['id', 'author', 'timestamp']

    def validate(self, data):
        return data