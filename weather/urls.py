from django.urls import path
from weather import views 

urlpatterns = [
    path('api/weather/', views.get_weather, name="weather_api"),
    path('api/get-coords/', views.get_coords, name='get_coords'),
    path('register/', views.register, name="register"),
    path('api/login/', views.login_views, name="login"),

]
