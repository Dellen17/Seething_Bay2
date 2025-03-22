from rest_framework import serializers # type: ignore
from .models import Entry, Profile

class EntrySerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    author = serializers.ReadOnlyField(source='author.username')
    image = serializers.ImageField(use_url=True, required=False)
    video = serializers.FileField(use_url=True, required=False)
    document = serializers.FileField(use_url=True, required=False)
    voice_note = serializers.FileField(use_url=True, required=False)
    sentiment = serializers.CharField(read_only=True)

    class Meta:
        model = Entry
        fields = ['id', 'content', 'timestamp', 'author', 'image', 'video', 'document', 'mood', 'voice_note', 'sentiment']
        read_only_fields = ['id', 'author', 'timestamp', 'sentiment']

    def validate(self, data):
        if 'mood' not in data:
            raise serializers.ValidationError("Mood is required.")
        return data

    def validate_image(self, value):
        if value == "":
            raise serializers.ValidationError("Image field cannot be empty.")
        return value

    def validate_video(self, value):
        if value == "":
            raise serializers.ValidationError("Video field cannot be empty.")
        return value

    def validate_document(self, value):
        if value == "":
            raise serializers.ValidationError("Document field cannot be empty.")
        return value

    def validate_voice_note(self, value):
        if value == "":
            raise serializers.ValidationError("Voice note field cannot be empty.")
        return value
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['author'] = request.user
        return super().create(validated_data)

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['profile_picture']