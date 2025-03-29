import binascii
from django.db import transaction
from django.shortcuts import redirect
from rest_framework import status # type: ignore
from django.contrib.auth import get_user_model
from rest_framework.response import Response # type: ignore
import requests # type: ignore
from django.conf import settings
import time
from rest_framework.decorators import api_view, permission_classes, authentication_classes # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken # type: ignore
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken # type: ignore
from rest_framework.authentication import SessionAuthentication # type: ignore
from django.contrib.auth import authenticate
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework.permissions import AllowAny, IsAuthenticated # type: ignore
from django.contrib.auth.models import User
from .models import Profile
from .serializers import ProfileSerializer
from django.utils import timezone
from .utils import analyze_sentiment, analyze_summary
from django.db.models import Count, Q
import os
import subprocess
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from datetime import datetime, timedelta, timezone as dt_timezone
from .models import Entry
from .serializers import EntrySerializer
from rest_framework.pagination import PageNumberPagination # type: ignore
from urllib.parse import urlencode

User = get_user_model()

# Custom pagination class
class EntryPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_next_link(self):
        if not self.page.has_next():
            return None
        url = self.request.build_absolute_uri()
        page_number = self.page.next_page_number()
        params = self.request.GET.copy()
        params['page'] = page_number
        params.setlist('mediaType[]', self.request.GET.getlist('mediaType[]'))
        return f"{url.split('?')[0]}?{urlencode(params, doseq=True)}"

    def get_previous_link(self):
        if not self.page.has_previous():
            return None
        url = self.request.build_absolute_uri()
        page_number = self.page.previous_page_number()
        params = self.request.GET.copy()
        params['page'] = page_number
        params.setlist('mediaType[]', self.request.GET.getlist('mediaType[]'))
        return f"{url.split('?')[0]}?{urlencode(params, doseq=True)}"

# User Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if username and password and email:
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, password=password, email=email)
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'email': user.email
        })
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    refresh_token = request.data.get('refresh_token')
    if not refresh_token:
        return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        return Response({
            'access': access_token
        })
    except (TokenError, InvalidToken):
        return Response({"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email field is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        reset_link = f"http://localhost:3000/reset-password-confirm/{uid}/{token}"

        subject = 'Password Reset Request'
        message = render_to_string('reset_password.html', {'url': reset_link})
        email_msg = EmailMessage(subject, message, settings.EMAIL_HOST_USER, [email])
        email_msg.content_subtype = "html"
        email_msg.send()

        return Response({"message": "Password reset email sent. Please check your inbox."}, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request, uidb64, token):
    try:
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
        except (ValueError, TypeError, binascii.Error) as e:
            return Response({"error": "Invalid user ID format"}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the user
        try:
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate the token
        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        # Get new password and confirm password from the form
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not new_password or not confirm_password:
            return Response({"error": "Both password fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        # Set the new password and save the user within a transaction
        with transaction.atomic():
            user.set_password(new_password)
            user.save()

        # Return success with a flag for frontend redirect
        return Response({
            "message": "Password reset successful. You will be redirected to login.",
            "success": True,
            "redirect_url": "http://localhost:3000/login"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "An unexpected error occurred. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    refresh_token = request.data.get('refresh_token')
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"error": "No refresh token provided"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_entries(request):
    """
    Search and filter entries based on keyword, media type, and date for the authenticated user.
    """
    keyword = request.GET.get('keyword', '')
    media_types = request.GET.getlist('mediaType[]', [])
    date = request.GET.get('date', '')

    query = Q(author=request.user)

    if keyword:
        query &= Q(content__icontains=keyword)

    if media_types:
        media_query = Q()
        for media_type in media_types:
            if media_type == 'image':
                media_query |= Q(image__isnull=False) & ~Q(image='')
            elif media_type == 'video':
                media_query |= Q(video__isnull=False) & ~Q(video='')
            elif media_type == 'document':
                media_query |= Q(document__isnull=False) & ~Q(document='')
            elif media_type == 'voice_note':
                media_query |= Q(voice_note__isnull=False) & ~Q(voice_note='')
        query &= media_query

    if date:
        try:
            parsed_date = datetime.strptime(date, '%Y-%m-%d').date()
            query &= Q(timestamp__date=parsed_date)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    entries = Entry.objects.filter(query).order_by('-timestamp')

    paginator = EntryPagination()
    paginated_entries = paginator.paginate_queryset(entries, request)
    total_pages = paginator.page.paginator.num_pages if paginator.page else 0
    serializer = EntrySerializer(paginated_entries, many=True)

    return paginator.get_paginated_response({
        'entries': serializer.data,
        'currentPage': paginator.page.number,
        'totalPages': total_pages,
        'totalEntries': paginator.page.paginator.count,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_entries(request):
    entries = Entry.objects.filter(author=request.user).order_by('-timestamp')
    paginator = EntryPagination()
    paginated_entries = paginator.paginate_queryset(entries, request)
    total_pages = paginator.page.paginator.num_pages if paginator.page else 0
    serializer = EntrySerializer(paginated_entries, many=True)

    return paginator.get_paginated_response({
        'entries': serializer.data,
        'currentPage': paginator.page.number,
        'totalPages': total_pages,
        'totalEntries': paginator.page.paginator.count,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_entry(request, pk):
    try:
        entry = Entry.objects.get(pk=pk, author=request.user)
        serializer = EntrySerializer(entry)
        return Response(serializer.data)
    except Entry.DoesNotExist:
        return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_entry(request):
    serializer = EntrySerializer(data=request.data, context={'request': request})

    if serializer.is_valid():
        voice_note = request.FILES.get('voice_note')
        if voice_note:
            serializer.validated_data['voice_note'] = voice_note

        # Save the entry
        serializer.save(author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_entry(request, pk):
    try:
        entry = Entry.objects.get(pk=pk, author=request.user)
    except Entry.DoesNotExist:
        return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = EntrySerializer(entry, data=request.data, partial=True)

    if serializer.is_valid():
        # Analyze the sentiment of the updated content
        content = request.data.get('content', entry.content)
        sentiment = analyze_sentiment(content)

        # Save the updated entry with the new sentiment
        updated_entry = serializer.save(sentiment=sentiment)

        # Handle voice note if a new one is uploaded
        if 'voice_note' in request.FILES:
            updated_entry.voice_note = request.FILES['voice_note']
            updated_entry.save()

        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_entry(request, pk):
    try:
        entry = Entry.objects.get(pk=pk, author=request.user)
        entry.delete()
        return Response({"message": "Entry deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except Entry.DoesNotExist:
        return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Fetch user profile with counts of entries, images, videos, documents, and voice notes.
    """
    user = request.user
    try:
        # Get or create the user's profile
        profile, created = Profile.objects.get_or_create(user=user)

        # Count total entries
        total_entries = Entry.objects.filter(author=user).count()

        # Count entries with images, videos, documents, and voice notes
        entry_counts = Entry.objects.filter(author=user).aggregate(
            images=Count('image', filter=Q(image__isnull=False) & ~Q(image="")),
            videos=Count('video', filter=Q(video__isnull=False) & ~Q(video="")),
            documents=Count('document', filter=Q(document__isnull=False) & ~Q(document="")),
            voice_notes=Count('voice_note', filter=Q(voice_note__isnull=False) & ~Q(voice_note="")),
        )

        profile_data = {
            'username': user.username,
            'email': user.email,
            'date_joined': user.date_joined,
            'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
            'total_entries': total_entries,
            **entry_counts,
        }

        return Response(profile_data)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_picture(request):
    """
    Upload or update the user's profile picture.
    """
    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)

    if 'profile_picture' in request.FILES:
        if profile.profile_picture:
            default_storage.delete(profile.profile_picture.path)

        profile.profile_picture = request.FILES['profile_picture']
        profile.save()

        profile_picture_url = request.build_absolute_uri(profile.profile_picture.url)
        return Response({
            'message': 'Profile picture updated successfully.',
            'profile_picture': profile_picture_url,
        })
    else:
        return Response({'error': 'No file provided.'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_entries_by_month(request, year, month):
    """
    Fetch entries for a specific month.
    """
    try:
        entries = Entry.objects.filter(
            author=request.user,
            timestamp__year=year,
            timestamp__month=month
        ).order_by('-timestamp')
        serializer = EntrySerializer(entries, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_email(request):
    user = request.user
    new_email = request.data.get('email')

    if not new_email:
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
        return Response({"error": "Email already in use."}, status=status.HTTP_400_BAD_REQUEST)

    user.email = new_email
    user.save()
    return Response({"message": "Email updated successfully."}, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_password(request):
    user = request.user
    new_password = request.data.get('password')

    if not new_password:
        return Response({"error": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mood_tracker(request):
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    entries = Entry.objects.filter(author=request.user)

    if start_date_str:
        start_date_naive = datetime.strptime(start_date_str, '%Y-%m-%d')
        start_date = timezone.make_aware(start_date_naive, timezone=dt_timezone.utc)
        entries = entries.filter(timestamp__gte=start_date)

    if end_date_str:
        end_date_naive = datetime.strptime(end_date_str, '%Y-%m-%d')
        end_date = timezone.make_aware(end_date_naive, timezone=dt_timezone.utc)
        entries = entries.filter(timestamp__lte=end_date)

    entries = entries.exclude(sentiment__isnull=True)

    mood_data = entries.values('timestamp__date', 'mood').annotate(count=Count('mood'))

    sentiment_data = entries.values('timestamp__date', 'sentiment').annotate(count=Count('sentiment'))

    mood_distribution = entries.values('mood').annotate(count=Count('mood'))

    sentiment_distribution = entries.values('sentiment').annotate(count=Count('sentiment'))

    response_data = {
        'mood_trends': [
            {
                'date': entry['timestamp__date'].strftime('%Y-%m-%d'),
                'mood': entry['mood'],
                'count': entry['count'],
            }
            for entry in mood_data
        ],
        'sentiment_trends': [
            {
                'date': entry['timestamp__date'].strftime('%Y-%m-%d'),
                'sentiment': entry['sentiment'],
                'count': entry['count'],
            }
            for entry in sentiment_data
        ],
        'mood_distribution': [
            {
                'mood': entry['mood'],
                'count': entry['count'],
            }
            for entry in mood_distribution
        ],
        'sentiment_distribution': [
            {
                'sentiment': entry['sentiment'],
                'count': entry['count'],
            }
            for entry in sentiment_distribution
        ],
    }

    return Response(response_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_summary(request):
    """
    Generate a summary of entries for a specific time range.
    """
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    entries = Entry.objects.filter(author=request.user)
    if start_date:
        entries = entries.filter(timestamp__gte=start_date)
    if end_date:
        entries = entries.filter(timestamp__lte=end_date)

    entry_texts = [entry.content for entry in entries if entry.content]
    combined_text = " ".join(entry_texts)

    if not combined_text:
        return Response({"summary": "No entries to summarize."})

    try:
        summary = analyze_summary(combined_text)
        return Response({"summary": summary})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cleanup_transcript(request):
    raw_text = request.data.get('raw_text', '').strip()
    if not raw_text:
        return Response({'error': 'No text provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        url = "https://api.deepseek.com/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
        }
        data = {
            "model": "deepseek-chat",
            "messages": [
                {
                    "role": "user",
                    "content": f"Convert this spoken text into a polished diary entry: {raw_text}",
                }
            ],
            "max_tokens": 500,
            "temperature": 0.3
        }
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()

        cleaned_text = response.json()["choices"][0]["message"]["content"].strip()
        return Response({'cleaned_text': cleaned_text}, status=status.HTTP_200_OK)
    except requests.exceptions.RequestException as e:
        return Response({'error': f"API request failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except (KeyError, IndexError) as e:
        return Response({'error': f"Failed to parse API response: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([SessionAuthentication])
def social_login_redirect(request):
    user = request.user
    refresh = RefreshToken.for_user(user)
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://127.0.0.1:3000')  # Fallback to localhost for dev
    redirect_url = f"{frontend_url}/login?access={str(refresh.access_token)}&refresh={str(refresh)}"
    return redirect(redirect_url)