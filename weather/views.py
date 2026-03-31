from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
import json

PREFECTURE_EN = {
    "北海道": "Hokkaido",
    "青森": "Aomori", "岩手": "Iwate", "宮城": "Miyagi", "秋田": "Akita", "山形": "Yamagata", "福島": "Fukushima",
    "茨城": "Ibaraki", "栃木": "Tochigi", "群馬": "Gunma", "埼玉": "Saitama", "千葉": "Chiba", "東京": "Tokyo", "神奈川": "Kanagawa",
    "新潟": "Niigata", "富山": "Toyama", "石川": "Ishikawa", "福井": "Fukui", "山梨": "Yamanashi", "長野": "Nagano", "岐阜": "Gifu", "静岡": "Shizuoka", "愛知": "Aichi",
    "三重": "Mie", "滋賀": "Shiga", "京都": "Kyoto", "大阪": "Osaka", "兵庫": "Hyogo", "奈良": "Nara", "和歌山": "Wakayama",
    "鳥取": "Tottori", "島根": "Shimane", "岡山": "Okayama", "広島": "Hiroshima", "山口": "Yamaguchi",
    "徳島": "Tokushima", "香川": "Kagawa", "愛媛": "Ehime", "高知": "Kochi",
    "福岡": "Fukuoka", "佐賀": "Saga", "長崎": "Nagasaki", "熊本": "Kumamoto", "大分": "Oita", "宮崎": "Miyazaki", "鹿児島": "Kagoshima", "沖縄": "Okinawa"
}

PREF_CAPITAL = {
    "北海道": "札幌市",
    "青森": "青森市", "岩手": "盛岡市", "宮城": "仙台市", "秋田": "秋田市", "山形": "山形市", "福島": "福島市",
    "茨城": "水戸市", "栃木": "宇都宮市", "群馬": "前橋市", "埼玉": "さいたま市", "千葉": "千葉市", "東京": "東京", "神奈川": "横浜市",
    "新潟": "新潟市", "富山": "富山市", "石川": "金沢市", "福井": "福井市", "山梨": "甲府市", "長野": "長野市", "岐阜": "岐阜市", "静岡": "静岡市", "愛知": "名古屋市",
    "三重": "津市", "滋賀": "大津市", "京都": "京都市", "大阪": "大阪市", "兵庫": "神戸市", "奈良": "奈良市", "和歌山": "和歌山市",
    "鳥取": "鳥取市", "島根": "松江市", "岡山": "岡山市", "広島": "広島市", "山口": "山口市",
    "徳島": "徳島市", "香川": "高松市", "愛媛": "松山市", "高知": "高知市",
    "福岡": "福岡市", "佐賀": "佐賀市", "長崎": "長崎市", "熊本": "熊本市", "大分": "大分市", "宮崎": "宮崎市", "鹿児島": "鹿児島市", "沖縄": "那覇市"
}

@api_view(['GET'])
def get_weather(request):
    city = request.GET.get('city', 'Tokyo')
    api_key = '5645e7b257bdb1ff50ee6a8c8d6a37f9'

    if not city:
        return Response({"error": "都市名を指定してください"}, status=400)

    def normalize_city_query(name: str) -> str:
        if not name:
            return name
        name = name.strip()
        if name.endswith(("都", "道", "府", "県")):
            name = name[:-1]
        return name

    base = normalize_city_query(city)
    queries = []
    for q in (city, base):
        if q and q not in queries:
            queries.append(q)
        if q and "," not in q:
            queries.append(f"{q},JP")

    capital = PREF_CAPITAL.get(base)
    if capital:
        if capital not in queries:
            queries.append(capital)
        if f"{capital},JP" not in queries:
            queries.append(f"{capital},JP")

    en = PREFECTURE_EN.get(base)
    if en:
        if en not in queries:
            queries.append(en)
        if f"{en},JP" not in queries:
            queries.append(f"{en},JP")

    geo_data = []
    for q in queries:
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={q}&limit=5&appid={api_key}&lang=ja"
        geo_res = requests.get(geo_url)
        data = geo_res.json()
        if isinstance(data, list) and len(data) > 0:
            geo_data = data
            break

    if len(geo_data) == 0:
        return Response({"error": "都市が見つかりません"}, status=404)

    # Prefer Japan results when multiple candidates exist
    jp_candidate = next((g for g in geo_data if g.get('country') == 'JP'), None)
    selected = jp_candidate or geo_data[0]

    lat = selected['lat']
    lon = selected['lon']

    weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric&lang=ja"
    weather_res = requests.get(weather_url)
    weather_data = weather_res.json()

    if weather_res.status_code != 200:
        return Response({'error': '天気情報の取得に失敗しました'}, status=400)

    local_names = selected.get('local_names', {})
    city_name = local_names.get('ja') or selected['name']

    result = {
        'city': city_name,
        'country': selected['country'],
        'lat': lat,
        'lon': lon,
        'temperature': weather_data['main']['temp'],
        'condition': weather_data['weather'][0]['description'],
        'wind': weather_data['wind']['speed'],
        'id': weather_data['weather'][0]['id']
    }

    return Response(result)

@api_view(['GET'])
def city_suggestions(request):
    q = (request.GET.get('q') or '').strip()
    if not q:
        return Response([])

    api_key = '5645e7b257bdb1ff50ee6a8c8d6a37f9'
    geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={q}&limit=5&appid={api_key}&lang=ja"
    geo_res = requests.get(geo_url)
    geo_data = geo_res.json()

    if not isinstance(geo_data, list):
        return Response([])

    # If query looks Japanese, prefer JP results only
    if any('ぁ' <= ch <= 'ん' or 'ァ' <= ch <= 'ヶ' or '\u4e00' <= ch <= '\u9fff' for ch in q):
        geo_data = [g for g in geo_data if g.get('country') == 'JP'] or geo_data

    results = []
    for item in geo_data:
        local_names = item.get('local_names', {})
        name = local_names.get('ja') or item.get('name')
        state = item.get('state')
        country = item.get('country')
        label = name
        country_label = '日本' if country == 'JP' else (country or '')
        if country == 'JP' and state:
            suffixes = ('市', '区', '町', '村', '郡')
            display_city = name if name.endswith(suffixes) else f"{name}市"
            label = f"{country_label}、{state}、{display_city}"
        else:
            label = f"{country_label}、{name}" if country_label else name
        results.append({"name": name, "label": label})

    return Response(results)

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
    identifier = data.get("username")
    password = data.get("password")

    if not identifier or not password:
        return JsonResponse({"error": "ユーザー名またはメールアドレスとパスワードは必須です"}, status=400)

    user = User.objects.filter(username=identifier).first() or User.objects.filter(email=identifier).first()
    if user is None:
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