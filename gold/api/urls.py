from django.urls import path
from social_django.views import auth  # type: ignore
from .views import register_user, login_user, logout_user, create_entry, get_entries, get_entry, update_entry, delete_entry
from .views import search_entries, reset_password, reset_password_confirm, user_profile, upload_profile_picture, get_entries_by_month
from .views import update_email, update_password, mood_tracker, generate_summary, cleanup_transcript, social_login_redirect

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('logout/', logout_user, name='logout_user'),
    path('user-profile/', user_profile, name='user-profile'),
    path('upload-profile-picture/', upload_profile_picture, name='upload-profile-picture'),
    path('entries/month/<int:year>/<int:month>/', get_entries_by_month, name='get_entries_by_month'),
    path('search/', search_entries, name='search_entries'),
    path('entries/', get_entries, name='get_entries'),
    path('entries/create/', create_entry, name='create_entry'),
    path('entries/<int:pk>/', get_entry, name='get_entry'),
    path('entries/<int:pk>/update/', update_entry, name='update_entry'),
    path('entries/<int:pk>/delete/', delete_entry, name='delete_entry'),
    path('mood-tracker/', mood_tracker, name='mood_tracker'),
    path('generate-summary/', generate_summary, name='generate_summary'),
    path('cleanup-transcript/', cleanup_transcript, name='cleanup_transcript'),
    path('update-email/', update_email, name='update_email'),
    path('update-password/', update_password, name='update_password'),
    path('password-reset/', reset_password, name='reset_password'),
    path('reset-password-confirm/<uidb64>/<token>/', reset_password_confirm, name='reset_password_confirm'),
    
    # Google OAuth2 Routes
    path('auth/google/', auth, {'backend': 'google-oauth2'}, name='google_login'),
    path('social-login-redirect/', social_login_redirect, name='social_login_redirect'),
]