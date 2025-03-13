from rest_framework import status  # type: ignore
from django.contrib.auth import get_user_model
from rest_framework.response import Response  # type: ignore
import requests # type: ignore
from django.conf import settings
import time
from rest_framework.decorators import api_view, permission_classes  # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken  # type: ignore
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken # type: ignore
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework.permissions import AllowAny, IsAuthenticated  # type: ignore
from django.contrib.auth.models import User
from .models import Profile
from .serializers import ProfileSerializer
from django.utils import timezone
from .utils import analyze_sentiment, analyze_summary
from datetime import timedelta
from django.db.models import Count, Q
import os
import subprocess
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from datetime import datetime
from .models import Entry
from .serializers import EntrySerializer
from rest_framework.pagination import PageNumberPagination  # type: ignore
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
        # Handle list parameters like mediaType[]
        params.setlist('mediaType[]', self.request.GET.getlist('mediaType[]'))
        return f"{url.split('?')[0]}?{urlencode(params, doseq=True)}"  # Add doseq=True

    def get_previous_link(self):
        if not self.page.has_previous():
            return None
        url = self.request.build_absolute_uri()
        page_number = self.page.previous_page_number()
        params = self.request.GET.copy()
        params['page'] = page_number
        # Handle list parameters like mediaType[]
        params.setlist('mediaType[]', self.request.GET.getlist('mediaType[]'))
        return f"{url.split('?')[0]}?{urlencode(params, doseq=True)}"  # Add doseq=True

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

        # Update the reset link to point to your React app’s reset password confirm route
        reset_link = f"http://localhost:3000/reset-password-confirm/{uid}/{token}"

        # Send email with reset link
        send_mail(
            'Password Reset Request',
            f'Please use the following link to reset your password: {reset_link}',
            'your-email@example.com',
            [email],
            fail_silently=False,
        )
        return Response({"message": "Password reset email sent. Please check your inbox."}, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request, uidb64, token):
    try:
        # Decode the user ID
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)

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

        # Set the new password and save the user
        user.set_password(new_password)
        user.save()

        # Redirect to the login page of your React app after successful password reset
        frontend_login_url = 'http://localhost:3000/login'  # Adjust URL if needed
        return Response({
            "message": "Password reset successful. You will be redirected to login.",
            "redirect_url": frontend_login_url
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

    # Start with a base query filtering by the authenticated user
    query = Q(author=request.user)

    # Keyword filtering
    if keyword:
        query &= Q(content__icontains=keyword)

    # Media type filtering
    if media_types:
        # Use OR operator to ensure entries match ANY selected media types
        media_query = Q()  # Initialize an empty Q object
        for media_type in media_types:
            if media_type == 'image':
                media_query |= Q(image__isnull=False) & ~Q(image='')  # Combine with OR
            elif media_type == 'video':
                media_query |= Q(video__isnull=False) & ~Q(video='')  # Combine with OR
            elif media_type == 'document':
                media_query |= Q(document__isnull=False) & ~Q(document='')  # Combine with OR
            elif media_type == 'voice_note':
                media_query |= Q(voice_note__isnull=False) & ~Q(voice_note='')  # Combine with OR
        query &= media_query  # Apply the combined media_query to the main query

    # Date filtering
    if date:
        try:
            parsed_date = datetime.strptime(date, '%Y-%m-%d').date()
            query &= Q(timestamp__date=parsed_date)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    # Retrieve entries for the authenticated user
    entries = Entry.objects.filter(query).order_by('-timestamp')

    # Paginate the results
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

# Entry Management Views
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
    print("Starting create_entry function")
    serializer = EntrySerializer(data=request.data, context={'request': request})
    print("Serializer initialized")

    if serializer.is_valid():
        print("Serializer is valid")
        # Handle voice note
        voice_note = request.FILES.get('voice_note')
        if voice_note:
            print(f"Voice note detected: {voice_note.name}")
            # Save the original file temporarily
            temp_path = os.path.join(settings.MEDIA_ROOT, 'temp', voice_note.name)
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)
            print(f"Temporary path created: {temp_path}")
            with open(temp_path, 'wb+') as f:
                for chunk in voice_note.chunks():
                    f.write(chunk)
            print("Temporary file written")

            # Check if conversion is needed (only for .webm files)
            if voice_note.name.lower().endswith('.webm'):
                print("Converting .webm to .mp3")
                output_path = temp_path.replace('.webm', '.mp3')
                # Remove existing output file to avoid overwrite prompt
                if os.path.exists(output_path):
                    os.remove(output_path)
                    print(f"Removed existing file: {output_path}")
                try:
                    print("Starting FFmpeg conversion")
                    process = subprocess.run([
                        'C:\\Program Files\\ffmpeg-7.1-full_build\\bin\\ffmpeg.exe',
                        '-y',
                        '-i', temp_path,
                        '-acodec', 'mp3',
                        '-vn',
                        '-loglevel', 'error',
                        output_path
                    ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                    print("FFmpeg conversion completed")
                    # Small delay to ensure FFmpeg releases the file
                    time.sleep(1)
                    # Read the converted file
                    with open(output_path, 'rb') as f:
                        converted_file = ContentFile(f.read(), name=voice_note.name.replace('.webm', '.mp3'))
                        serializer.validated_data['voice_note'] = converted_file
                    print("Converted file read and assigned")
                    # Clean up the converted file
                    os.remove(output_path)
                    print("Converted file cleaned up")
                except subprocess.CalledProcessError as e:
                    print(f"FFmpeg error: {e}")
                    return Response({'detail': 'Error converting voice note to MP3.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                except Exception as e:
                    print(f"Unexpected error: {e}")
                    return Response({'detail': 'Unexpected error during conversion.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                print("File is not .webm, skipping conversion")
                # Use the original file directly
                with open(temp_path, 'rb') as f:
                    serializer.validated_data['voice_note'] = ContentFile(f.read(), name=voice_note.name)

            # Clean up the temp file (only once, after all processing)
            if os.path.exists(temp_path):
                os.remove(temp_path)
                print("Temporary file cleaned up")

        # Save the entry
        print("Saving entry")
        serializer.save(author=request.user)
        print("Entry saved")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    print("Serializer invalid")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_entry(request, pk):
    print("Starting update_entry function")
    try:
        entry = Entry.objects.get(pk=pk, author=request.user)
    except Entry.DoesNotExist:
        print("Entry not found")
        return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = EntrySerializer(entry, data=request.data, partial=True)
    print("Serializer initialized")

    if serializer.is_valid():
        print("Serializer is valid")
        # Analyze the sentiment of the updated content
        content = request.data.get('content', entry.content)
        sentiment = analyze_sentiment(content)

        # Save the updated entry with the new sentiment
        updated_entry = serializer.save(sentiment=sentiment)
        print("Entry updated with sentiment")

        # Handle voice note conversion if a new voice note is uploaded
        if 'voice_note' in request.FILES:
            print(f"New voice note detected: {request.FILES['voice_note'].name}")
            # Save the original file temporarily
            temp_path = os.path.join(settings.MEDIA_ROOT, 'temp', request.FILES['voice_note'].name)
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)
            print(f"Temporary path created: {temp_path}")
            with open(temp_path, 'wb+') as f:
                for chunk in request.FILES['voice_note'].chunks():
                    f.write(chunk)
            print("Temporary file written")

            # Check if conversion is needed (only for .webm files)
            if request.FILES['voice_note'].name.lower().endswith('.webm'):
                print("Converting .webm to .mp3")
                output_path = temp_path.replace('.webm', '.mp3')
                # Remove existing output file to avoid overwrite prompt
                if os.path.exists(output_path):
                    os.remove(output_path)
                    print(f"Removed existing file: {output_path}")
                try:
                    print("Starting FFmpeg conversion")
                    process = subprocess.run([
                        'C:\\Program Files\\ffmpeg-7.1-full_build\\bin\\ffmpeg.exe',
                        '-y',
                        '-i', temp_path,
                        '-acodec', 'mp3',
                        '-vn',
                        '-loglevel', 'error',
                        output_path
                    ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                    print("FFmpeg conversion completed")
                    # Small delay to ensure FFmpeg releases the file
                    time.sleep(1)
                    # Read the converted file
                    with open(output_path, 'rb') as f:
                        converted_file = ContentFile(f.read(), name=request.FILES['voice_note'].name.replace('.webm', '.mp3'))
                        updated_entry.voice_note = converted_file
                    print("Converted file read and assigned")
                    # Clean up
                    os.remove(temp_path)
                    os.remove(output_path)
                    print("Temporary files cleaned up")
                except subprocess.CalledProcessError as e:
                    print(f"FFmpeg error: {e}")
                    return Response({'detail': 'Error converting voice note to MP3.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                except Exception as e:
                    print(f"Unexpected error: {e}")
                    return Response({'detail': 'Unexpected error during conversion.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                print("File is not .webm, using original")
                # Use the original file directly
                updated_entry.voice_note = request.FILES['voice_note']

            # Save the updated entry with the new voice note
            updated_entry.save()
            print("Voice note updated")

        return Response(serializer.data)

    print("Serializer invalid")
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
            images=Count('image', filter=Q(image__isnull=False) & ~Q(image="")),  # Exclude null and empty strings
            videos=Count('video', filter=Q(video__isnull=False) & ~Q(video="")),  # Exclude null and empty strings
            documents=Count('document', filter=Q(document__isnull=False) & ~Q(document="")),  # Exclude null and empty strings
            voice_notes=Count('voice_note', filter=Q(voice_note__isnull=False) & ~Q(voice_note="")),  # Exclude null and empty strings
        )

        profile_data = {
            'username': user.username,
            'email': user.email,
            'date_joined': user.date_joined,
            'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
            'total_entries': total_entries,
            **entry_counts,  # Include image, video, document, and voice note counts
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
        # Delete the old profile picture if it exists
        if profile.profile_picture:
            default_storage.delete(profile.profile_picture.path)

        # Save the new profile picture
        profile.profile_picture = request.FILES['profile_picture']
        profile.save()

        # Return the absolute URL of the uploaded profile picture
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

    # Check if the new email is already in use
    if User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
        return Response({"error": "Email already in use."}, status=status.HTTP_400_BAD_REQUEST)

    # Update the user's email
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

    # Update the user's password
    user.set_password(new_password)
    user.save()
    return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mood_tracker(request):
    # Get optional date filters from query parameters
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    # Filter entries by the authenticated user
    entries = Entry.objects.filter(author=request.user)

    # Apply date filters if provided
    if start_date_str:
        # Parse the start_date string into a naive datetime
        start_date_naive = datetime.strptime(start_date_str, '%Y-%m-%d')
        # Make it timezone-aware (using UTC)
        start_date = timezone.make_aware(start_date_naive, timezone=timezone.utc)
        entries = entries.filter(timestamp__gte=start_date)

    if end_date_str:
        # Parse the end_date string into a naive datetime
        end_date_naive = datetime.strptime(end_date_str, '%Y-%m-%d')
        # Make it timezone-aware (using UTC)
        end_date = timezone.make_aware(end_date_naive, timezone=timezone.utc)
        entries = entries.filter(timestamp__lte=end_date)

    # Filter out entries with null sentiment
    entries = entries.exclude(sentiment__isnull=True)

    # Group moods by date and count occurrences
    mood_data = entries.values('timestamp__date', 'mood').annotate(count=Count('mood'))

    # Group sentiments by date and count occurrences
    sentiment_data = entries.values('timestamp__date', 'sentiment').annotate(count=Count('sentiment'))

    # Calculate mood distribution
    mood_distribution = entries.values('mood').annotate(count=Count('mood'))

    # Calculate sentiment distribution
    sentiment_distribution = entries.values('sentiment').annotate(count=Count('sentiment'))

    # Format the response
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
    # Get optional date filters from query parameters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    # Filter entries by the authenticated user and date range
    entries = Entry.objects.filter(author=request.user)
    if start_date:
        entries = entries.filter(timestamp__gte=start_date)
    if end_date:
        entries = entries.filter(timestamp__lte=end_date)

    # Combine entry content into a single string
    entry_texts = [entry.content for entry in entries if entry.content]
    combined_text = " ".join(entry_texts)

    # If no entries, return an empty summary
    if not combined_text:
        return Response({"summary": "No entries to summarize."})

    # Send the combined text to DeepSeek for summarization
    try:
        summary = analyze_summary(combined_text)  # We'll create this function next
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
        # Call DeepSeek API for cleanup
        url = "https://api.deepseek.com/chat/completions"  # Correct endpoint
        headers = {
            "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
        }
        data = {
            "model": "deepseek-chat",  # Use the correct model
            "messages": [
                {
                    "role": "user",
                    "content": f"Convert this spoken text into a polished diary entry: {raw_text}",
                }
            ],
            "max_tokens": 500,  # Adjust as needed
            "temperature": 0.3,  # Adjust for creativity vs. accuracy
        }
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()

        # Extract the cleaned-up text from the response
        cleaned_text = response.json()["choices"][0]["message"]["content"].strip()
        return Response({'cleaned_text': cleaned_text}, status=status.HTTP_200_OK)
    except requests.exceptions.RequestException as e:
        return Response({'error': f"API request failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except (KeyError, IndexError) as e:
        return Response({'error': f"Failed to parse API response: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)