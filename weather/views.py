import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

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
        'condition': data['weather'][0]['description'] # 天気の説明（日本語）
    }

    return Response(result)
