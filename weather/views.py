from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
import json

@api_view(['GET'])
def get_weather(request):
    city = request.GET.get('city', 'Tokyo')
    api_key = '5645e7b257bdb1ff50ee6a8c8d6a37f9'

    if not city:
        return Response({"error": "都市名を指定してください"}, status=400)

    geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={api_key}"
    geo_res = requests.get(geo_url)
    geo_data = geo_res.json()

    if len(geo_data) == 0:
        return Response({"error": "都市が見つかりません"}, status=404)

    lat = geo_data[0]['lat']
    lon = geo_data[0]['lon']

    weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric&lang=ja"
    weather_res = requests.get(weather_url)
    weather_data = weather_res.json()

    if weather_res.status_code != 200:
        return Response({'error': '天気情報の取得に失敗しました'}, status=400)

    result = {
        'city': geo_data[0]['name'],
        'country': geo_data[0]['country'],
        'lat': lat,
        'lon': lon,
        'temperature': weather_data['main']['temp'],
        'condition': weather_data['weather'][0]['description'],
        'wind': weather_data['wind']['speed'],
        'id': weather_data['weather'][0]['id']
    }

    return Response(result)

@csrf_exempt 
def register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            password2 = data.get('password2')

            errors = {}

            if not username:
                errors["username"] = "ユーザー名が空欄です"
            if not email:
                errors["email"] = "E-mailが空欄です"
            if not password:
                errors["password"] = "パスワードが空欄です"
            if password != password2:
                errors["password2"] = "パスワードが一致しません"
                
            if errors:
                return JsonResponse({"errors": errors}, status = 400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'message': 'ユーザー名は既に使われています'}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()

            return JsonResponse({'message': '登録成功'}, status=201)

        except Exception as e:
            return JsonResponse({'message': f'エラーが発生しました: {str(e)}'}, status=500)
    else:
        return JsonResponse({'message': 'POSTリクエストをしてください'}, status=405)
    


@csrf_exempt
def login_views(request):
    if request.method != "POST":
        return JsonResponse({"error": "POSTメソッドを使用してください"}, status=405)

    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return JsonResponse({"error": "メールアドレスとパスワードは必須です"}, status=400)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "ユーザーが存在しません"}, status=400)

    user_auth = authenticate(request, username=user.username, password=password)

    if user_auth is not None:
        auth_login(request, user_auth)
        return JsonResponse({"message": "ログイン成功"})
    else:
        return JsonResponse({"error": "パスワードが間違っています"}, status=400)

@csrf_exempt
def logout_view(request):
    if request.method == "POST":
        auth_logout(request)
        return JsonResponse({"message": "ログアウト成功"})
    else:
        return JsonResponse({"error": "POSTメソッドを使用してください"}, status=405)