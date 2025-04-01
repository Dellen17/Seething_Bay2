from rest_framework import serializers # type: ignore
from .models import Entry, Profile

class EntrySerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    author = serializers.ReadOnlyField(source='author.username')
    image = serializers.URLField(required=False, allow_blank=True)
    video = serializers.URLField(required=False, allow_blank=True)
    document = serializers.URLField(required=False, allow_blank=True)
    voice_note = serializers.URLField(required=False, allow_blank=True)
    sentiment = serializers.CharField(read_only=True)

    class Meta:
        model = Entry
        fields = ['id', 'content', 'timestamp', 'author', 'image', 'video', 'document', 'mood', 'voice_note', 'sentiment']
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

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['profile_picture']