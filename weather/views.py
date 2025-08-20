import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

@api_view(['GET'])
def get_weather(request):
    city = request.GET.get('city', 'Tokyo')
    lat = request.GET.get('lat')
    lon = request.GET.get('lon')
    api_key = '5645e7b257bdb1ff50ee6a8c8d6a37f9'

    if lat and lon:
        url = f'http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric&lang=ja'
    else:
        url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric&lang=ja'
    
    res = requests.get(url)
    data = res.json()

    if res.status_code != 200:
        return Response({'error': '天気情報の取得に失敗しました'}, status=400)

    
    result = {
        'id': data['weather'][0]['id'],
        'city': city,
        'temperature': data['main']['temp'],           
        'condition': data['weather'][0]['description'], 
        'wind' : data['wind']['speed']
    }

    return Response(result)

@api_view(['GET'])
def get_coords(request):
    city = request.GET.get("city", "Tokyo")
    api_key = '5645e7b257bdb1ff50ee6a8c8d6a37f9'

    if not city:
        return Response({"error" : "都市名を指定してください"}, status=400)
    
    url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={api_key}"

    try:
        res = requests.get(url)
        data = res.json()

        if len(data)==0:
            return Response({"error" : "都市が見つかりません"}, status=400)

        result = {
            'name': data[0]['name'],
            'lat': data[0]['lat'],
            'lon': data[0]['lon'],
            'country': data[0]['country']
        }
        return Response(result)

    except Exception as e:
        return Response({'error': f'APIリクエスト中にエラーが発生しました: {str(e)}'}, status=500)
    

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
