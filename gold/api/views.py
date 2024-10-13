from rest_framework import status # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework.decorators import api_view, permission_classes # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken # type: ignore
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated # type: ignore
from django.contrib.auth.models import User
from .models import Entry
from .serializers import EntrySerializer
from rest_framework.pagination import PageNumberPagination # type: ignore


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
        user = User.objects.create_user(username=username, password=password, email=email)
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)


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


# Entry Management Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_entries(request):
    entries = Entry.objects.filter(author=request.user).order_by('-timestamp')
    paginator = EntryPagination()
    paginated_entries = paginator.paginate_queryset(entries, request)

    total_pages = paginator.page.paginator.num_pages if paginator.page else 1
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
    data = request.data.copy()
    data['author'] = request.user.id  # Assign the logged-in user's ID to the author field

    serializer = EntrySerializer(data=data)
    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response({"message": "Entry created successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_entry(request, pk):
    try:
        entry = Entry.objects.get(pk=pk, author=request.user)
    except Entry.DoesNotExist:
        return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    data['author'] = request.user.id  # Ensure the author remains the same

    serializer = EntrySerializer(entry, data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_entry(request, pk):
    try:
        entry = Entry.objects.get(pk=pk, author=request.user)
    except Entry.DoesNotExist:
        return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)

    entry.delete()
    return Response({"message": "Entry deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
