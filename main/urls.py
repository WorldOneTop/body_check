from django.urls import path
from django.conf.urls.static import static
from django.conf import settings


from . import views

urlpatterns = [
    path('', views.intro, name='intro'),
    path('index/', views.index, name='index'),
    path('generic/', views.generic, name='generic'),
    path('elements/', views.elements, name='elements'),
    path('test/', views.test, name='test'),
    path('login/', views.login, name='login'),
    path('signup/', views.signup, name='signup'),
    path('error/', views.error, name='error'),
    path('logout/<str:to>/', views.logout, name='logout'),
    path('upload_img/', views.upload_img, name='upload_img'),
    path('mypage/', views.mypage, name='mypage'),
    path('mypage/delete/', views.delete_change, name='delete_change'),
    path('mypage/update/', views.update_change, name='update_change'),
    path('mypage/del_img/', views.del_img, name='del_img'),
    path('mypage/upload_change/', views.upload_change, name='upload_change'),
    path('mypage/add_picture/', views.add_picture, name='add_picture'),
    path('mypage/delete_picture/', views.delete_picture, name='delete_picture'),
    path('delete_user/', views.delete_user, name='delete_user'),
    path('update_user/', views.update_user, name='update_user'),
    path('update_user_other/', views.update_user_other, name='update_user_other'),
    path('information/', views.information, name='information'),
    path('community/<int:isBug>/<int:num>/', views.community, name='community'),
    path('community/write/<int:isBug>/<int:num>/', views.comm_write),
    path('community/visited/<int:num>/', views.comm_visited),
    path('community/visited/<int:num>/remove', views.comm_remove),
    path('community/write/<int:isBug>/<int:num>/save', views.comm_save),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

