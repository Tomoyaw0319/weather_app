from django.urls import path
from weather import views 

urlpatterns = [
    path('api/weather/', views.get_weather),
]
