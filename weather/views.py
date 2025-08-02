import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

@api_view(['GET'])
def get_weather(request):
    city = request.GET.get('city', 'Tokyo')  # クエリパラメータから都市名を取得
    api_key = '5645e7b257bdb1ff50ee6a8c8d6a37f9'

    # OpenWeatherMap APIのURL
    url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric&lang=ja'

    # APIへリクエストを送る
    res = requests.get(url)
    data = res.json()

    if res.status_code != 200:
        return Response({'error': '天気情報の取得に失敗しました'}, status=400)

    # 必要な情報だけ取り出す
    result = {
        'city': city,
        'temperature': data['main']['temp'],           # 気温(℃)
        'condition': data['weather'][0]['description'], # 天気の説明（日本語）
        'wind' : data['wind']['speed']
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

            if not username or not password:
                return JsonResponse({'message': 'ユーザー名とパスワードは必須です'}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'message': 'ユーザー名は既に使われています'}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()

            return JsonResponse({'message': '登録成功'}, status=201)

        except Exception as e:
            return JsonResponse({'message': f'エラーが発生しました: {str(e)}'}, status=500)
    else:
        return JsonResponse({'message': 'POSTリクエストをしてください'}, status=405)
