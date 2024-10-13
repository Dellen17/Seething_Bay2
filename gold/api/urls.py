from django.urls import path
from .views import register_user, login_user, logout_user, create_entry, get_entries, get_entry, update_entry, delete_entry


urlpatterns = [
    
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('logout/', logout_user, name='logout_user'),
    path('entries/', get_entries, name='get_entries'),  # List entries
    path('entries/create/', create_entry, name='create_entry'),  # Create entry
    path('entries/<int:pk>/', get_entry, name='get_entry'),  # Get a single entry
    path('entries/<int:pk>/update/', update_entry, name='update_entry'),  # Update entry
    path('entries/<int:pk>/delete/', delete_entry, name='delete_entry'),  # Delete entry
]
