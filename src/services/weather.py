"""
🌤️ 天气服务 - Weather Service
提供天气数据获取和穿衣建议
"""
import requests
import json
from typing import Optional, Dict
from datetime import datetime


class WeatherService:
    """天气服务"""
    
    # 免费天气API (使用 wttr.in)
    BASE_URL = "https://wttr.in"
    
    # 穿衣建议配置
    CLOTHING_SUGGESTIONS = {
        "hot": "今天很热呀！建议穿短袖短裤，注意防晒哦~ ☀️",
        "warm": "天气温暖舒适，适合穿长袖或薄外套 🧥",
        "mild": "温度适宜，可以穿普通衣物~ 👕",
        "cool": "有点凉快了，建议加件外套 🧶",
        "cold": "好冷啊！记得穿羽绒服保暖 🧣",
        "freezing": "冻哭预警！一定要穿厚羽绒服戴手套！ 🥶",
    }
    
    # 天气状态映射
    WEATHER_ICONS = {
        "sunny": "☀️",
        "cloudy": "☁️",
        "partly_cloudy": "⛅",
        "overcast": "🌥️",
        "rain": "🌧️",
        "thunderstorm": "⛈️",
        "snow": "🌨️",
        "fog": "🌫️",
        "drizzle": "🌦️",
    }
    
    def __init__(self, db):
        self.db = db
        self.city = "北京"
        self.weather_data = None
        self.last_update = None
    
    def set_city(self, city: str):
        """设置城市"""
        self.city = city
        self.refresh()
    
    def get_weather_data(self) -> Optional[Dict]:
        """获取天气数据"""
        return self.weather_data
    
    def refresh(self):
        """刷新天气数据"""
        try:
            # 使用 wttr.in API (免费无需Key)
            url = f"{self.city}?format=j1"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                current = data.get('current_condition', [{}])[0]
                
                # 解析数据
                temp = int(current.get('temp_C', 0))
                weather_desc = current.get('weatherDesc', [{}])[0].get('value', '未知')
                humidity = current.get('humidity', '0')
                wind = current.get('windspeedKmph', '0')
                
                # 天气图标
                weather_key = self._get_weather_key(weather_desc)
                icon = self.WEATHER_ICONS.get(weather_key, '🌤️')
                
                # 穿衣建议
                clothing = self._get_clothing_suggestion(temp)
                
                self.weather_data = {
                    "city": self.city,
                    "temp": temp,
                    "weather": weather_desc,
                    "icon": icon,
                    "humidity": humidity,
                    "wind": wind,
                    "clothing": clothing,
                    "update_time": datetime.now().strftime("%H:%M"),
                }
                self.last_update = datetime.now()
                
                # 缓存到数据库
                self.db.cache_weather(self.weather_data)
        except Exception as e:
            print(f"获取天气失败: {e}")
            # 尝试读取缓存
            self.weather_data = self.db.get_cached_weather()
    
    def _get_weather_key(self, desc: str) -> str:
        """获取天气key"""
        desc_lower = desc.lower()
        if 'sun' in desc_lower or 'clear' in desc_lower:
            return "sunny"
        elif 'cloud' in desc_lower:
            return "cloudy"
        elif 'rain' in desc_lower:
            return "rain"
        elif 'snow' in desc_lower:
            return "snow"
        elif 'fog' in desc_lower or 'mist' in desc_lower:
            return "fog"
        elif 'thunder' in desc_lower:
            return "thunderstorm"
        elif 'drizzle' in desc_lower:
            return "drizzle"
        return "cloudy"
    
    def _get_clothing_suggestion(self, temp: int) -> str:
        """获取穿衣建议"""
        if temp >= 35:
            return self.CLOTHING_SUGGESTIONS["hot"]
        elif temp >= 25:
            return self.CLOTHING_SUGGESTIONS["warm"]
        elif temp >= 15:
            return self.CLOTHING_SUGGESTIONS["mild"]
        elif temp >= 5:
            return self.CLOTHING_SUGGESTIONS["cool"]
        elif temp >= -10:
            return self.CLOTHING_SUGGESTIONS["cold"]
        else:
            return self.CLOTHING_SUGGESTIONS["freezing"]
    
    def get_display_text(self) -> str:
        """获取显示文本"""
        if not self.weather_data:
            self.refresh()
        
        if not self.weather_data:
            return "天气加载中..."
        
        data = self.weather_data
        return f"{data['icon']} {data['city']} {data['temp']}°C - {data['weather']}"


if __name__ == "__main__":
    # 测试
    class MockDB:
        def cache_weather(self, data): pass
        def get_cached_weather(self): return None
    
    service = WeatherService(MockDB())
    service.set_city("上海")
    service.refresh()
    print(service.weather_data)