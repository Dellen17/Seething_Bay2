from django.urls import path
from .views import register_user, login_user, logout_user, create_entry, get_entries, get_entry, update_entry, delete_entry
from .views import search_entries, reset_password, reset_password_confirm, user_profile, upload_profile_picture, get_entries_by_month
from .views import update_email, update_password

urlpatterns = [
    
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('logout/', logout_user, name='logout_user'),
    path('user-profile/', user_profile, name='user-profile'),
    path('upload-profile-picture/', upload_profile_picture, name='upload-profile-picture'),
    path('entries/month/<int:year>/<int:month>/', get_entries_by_month, name='get_entries_by_month'),
    path('search/', search_entries, name='search_entries'),
    path('entries/', get_entries, name='get_entries'),  # List entries
    path('entries/create/', create_entry, name='create_entry'),  # Create entry
    path('entries/<int:pk>/', get_entry, name='get_entry'),  # Get a single entry
    path('entries/<int:pk>/update/', update_entry, name='update_entry'),  # Update entry
    path('entries/<int:pk>/delete/', delete_entry, name='delete_entry'),  # Delete entry
    path('update-email/', update_email, name='update_email'),
    path('update-password/', update_password, name='update_password'),
    path('password-reset/', reset_password, name='reset_password' ),  # Reset password
    path('reset-password-confirm/<uidb64>/<token>/', reset_password_confirm, name='reset_password_confirm'),
]