from rest_framework import serializers  # type: ignore
from .models import Entry, Profile

class EntrySerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    author = serializers.ReadOnlyField(source='author.username')
    # Use FileField for validation during create/update, since the frontend sends files
    image = serializers.FileField(required=False, allow_null=True, write_only=True)
    image_url = serializers.URLField(source='image', read_only=True)
    video = serializers.FileField(required=False, allow_null=True, write_only=True)
    video_url = serializers.URLField(source='video', read_only=True)
    document = serializers.FileField(required=False, allow_null=True, write_only=True)
    document_url = serializers.URLField(source='document', read_only=True)
    voice_note = serializers.FileField(required=False, allow_null=True, write_only=True)
    voice_note_url = serializers.URLField(source='voice_note', read_only=True)
    sentiment = serializers.CharField(read_only=True)

    class Meta:
        model = Entry
        fields = [
            'id', 'content', 'timestamp', 'author', 'image', 'image_url',
            'video', 'video_url', 'document', 'document_url', 'mood',
            'voice_note', 'voice_note_url', 'sentiment'
        ]
        read_only_fields = ['id', 'author', 'timestamp', 'sentiment']

    def validate(self, data):
        if 'mood' not in data:
            raise serializers.ValidationError("Mood is required.")
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['author'] = request.user
        return super().create(validated_data)

    def to_representation(self, instance):
        # When returning the data, ensure the fields are represented as URLs
        representation = super().to_representation(instance)
        # The fields are already URLs in the database, so no conversion needed
        return representation

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['profile_picture']