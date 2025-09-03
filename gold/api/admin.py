from django.contrib import admin
from django.utils.html import format_html
from .models import Entry

class EntryAdmin(admin.ModelAdmin):
    list_display = (
        'content_preview', 'author', 'timestamp', 'mood', 
        'image_preview', 'video_preview', 'document_link', 'voice_note_link'
    )

    def content_preview(self, obj):
        return obj.content[:50] + "..." if obj.content else "No Content"
    content_preview.short_description = 'Content'

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-width: 100px; max-height: 100px;" />', obj.image)
        return "No Image"
    image_preview.short_description = 'Image Preview'

    def video_preview(self, obj):
        if obj.video:
            return format_html(
                '<video width="200" controls><source src="{}" type="video/mp4">Your browser does not support the video tag.</video>',
                obj.video
            )
        return "No Video"
    video_preview.short_description = 'Video Preview'

    def document_link(self, obj):
        if obj.document:
            return format_html('<a href="{}" download>Download Document</a>', obj.document)
        return "No Document"
    document_link.short_description = 'Document'

    def voice_note_link(self, obj):
        if obj.voice_note:
            return format_html('<a href="{}" download>Download Voice Note</a>', obj.voice_note)
        return "No Voice Note"
    voice_note_link.short_description = 'Voice Note'

admin.site.register(Entry, EntryAdmin)