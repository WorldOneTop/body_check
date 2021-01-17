from django.urls import path


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
]

