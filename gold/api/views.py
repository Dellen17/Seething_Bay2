from rest_framework import status  # type: ignore
from django.contrib.auth import get_user_model
from rest_framework.response import Response  # type: ignore
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
from django.core.files.storage import default_storage
from .models import Profile
from .serializers import ProfileSerializer
from django.db.models import Q
from django.db.models import Count
from datetime import datetime
from .models import Entry
from .serializers import EntrySerializer
from rest_framework.pagination import PageNumberPagination  # type: ignore

User = get_user_model()

# Custom pagination class
class EntryPagination(PageNumberPagination):
    page_size = 5  # Number of entries per page
    page_size_query_param = 'page_size'
    max_page_size = 100

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

        # Log the updated password hash (for debugging purposes, make sure to remove in production)
        print(f"Updated password hash: {user.password}")

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
def search_entries(request):
    """
    Search and filter entries based on keyword, media type, and date.
    """
    keyword = request.GET.get('keyword', '')
    media_types = request.GET.getlist('mediaType[]', [])  # Handle array input
    date = request.GET.get('date', '')

    # Debugging: Log received parameters
    print("Keyword:", keyword)
    print("Media types:", media_types)
    print("Date:", date)

    # Base query
    query = Q()

    # Keyword filtering
    if keyword:
        query &= Q(content__icontains=keyword)

    # Media type filtering
    if media_types:
        media_query = Q()
        if 'image' in media_types:
            media_query |= Q(image__isnull=False) & ~Q(image='')  # Ensure image is not null or empty
        if 'video' in media_types:
            media_query |= Q(video__isnull=False) & ~Q(video='')  # Ensure video is not null or empty
        if 'document' in media_types:
            media_query |= Q(document__isnull=False) & ~Q(document='')  # Ensure document is not null or empty
        if 'voice_note' in media_types:
            media_query |= Q(voice_note__isnull=False) & ~Q(voice_note='')  # Ensure voice_note is not null or empty    
        query &= media_query

    # Date filtering
    if date:
        try:
            parsed_date = datetime.strptime(date, '%Y-%m-%d').date()
            query &= Q(timestamp__date=parsed_date)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    # Retrieve entries
    entries = Entry.objects.filter(query).order_by('-timestamp')

    # Debugging: Log query and entries
    print("Final query:", query)
    print("Filtered entries:", entries)

    serializer = EntrySerializer(entries, many=True)
    return Response(serializer.data)

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
    print("Received Data:", request.data)  # Log received data for debugging
    print("Received Files:", request.FILES)  # Log received files for debugging

    serializer = EntrySerializer(data=request.data)

    if serializer.is_valid():
        entry = serializer.save(author=request.user)
        
        if 'voice_note' in request.FILES:
            entry.voice_note = request.FILES['voice_note']
            entry.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    print("Validation Error:", serializer.errors)
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
        updated_entry = serializer.save()
        
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
            images=Count('image', distinct=True),
            videos=Count('video', distinct=True),
            documents=Count('document', distinct=True),
            voice_notes=Count('voice_note', distinct=True),
        )

        profile_data = {
            'username': user.username,
            'email': user.email,
            'date_joined': user.date_joined,
            'profile_picture': profile.profile_picture.url if profile.profile_picture else None,  # Use profile instance
            'total_entries': total_entries,
            **entry_counts,  # Include image, video, document, and voice note counts
        }

        return Response(profile_data)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

from django.conf import settings

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
