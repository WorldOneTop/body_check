from django.urls import path
from django.conf.urls.static import static
from django.conf import settings


from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('generic/', views.generic, name='generic'),
    path('elements/', views.elements, name='elements'),
    path('test/', views.test, name='test'),
    path('login/', views.login, name='login'),
    path('signup/', views.signup, name='signup'),
    path('error/', views.error, name='error'),
    path('logout/', views.logout, name='logout'),
    path('upload_img/', views.upload_img, name='upload_img'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

