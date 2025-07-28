from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def get_weather(request):
    city = request.GET.get('city', 'Tokyo')  # クエリパラメータから都市名を取得
    data = {
        'city': city,
        'temperature': '25℃',
        'condition': 'Sunny'
    }
    return Response(data)
