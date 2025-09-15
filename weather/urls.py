from django.urls import path
from weather import views 

urlpatterns = [
    path('api/weather/', views.get_weather, name="weather_api"),
    path('register/', views.register, name="register"),
    path('api/login/', views.login_views, name="login"),
    path('api/logout/', views.logout_view, name="logout"),

]
