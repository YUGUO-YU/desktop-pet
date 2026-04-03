"""
🐱 桌面宠物 - Desktop Pet V1.0
极简单文件版本
"""
import flet as ft
import requests
import threading
import time

# ============ 天气服务 ============
class WeatherService:
    def __init__(self):
        self.city = "北京"
        self.data = None
    
    def set_city(self, city):
        self.city = city
    
    def refresh(self):
        try:
            url = f"https://wttr.in/{self.city}?format=j1"
            r = requests.get(url, timeout=10)
            if r.status_code == 200:
                d = r.json().get('current_condition', [{}])[0]
                self.data = {
                    "city": self.city,
                    "temp": d.get('temp_C', '?'),
                    "weather": d.get('weatherDesc', [{}])[0].get('value', '未知'),
                    "humidity": d.get('humidity', '?'),
                }
        except Exception as e:
            print(f"天气获取失败: {e}")
            self.data = {"city": self.city, "temp": "?", "weather": "获取失败", "humidity": "?"}
        return self.data
    
    def get_display(self):
        if not self.data:
            self.refresh()
        if self.data:
            return f"{self.data['city']} {self.data['temp']}°C {self.data['weather']}"
        return "天气加载中..."

# ============ 新闻服务 ============
class NewsService:
    def __init__(self):
        self.data = {"国内": [], "国外": []}
    
    def refresh(self):
        # 备用新闻数据
        self.data = {
            "国内": [
                {"title": "今日要闻", "summary": "暂无摘要", "source": "新闻源"},
            ],
            "国外": [
                {"title": "International News", "summary": "No summary", "source": "News"},
            ]
        }
    
    def get_news(self, cat):
        if not self.data[cat]:
            self.refresh()
        return self.data.get(cat, [])[:3]

# ============ 宠物组件 ============
class PetWidget:
    def __init__(self):
        self.moods = ["😺 开心", "😸 平静", "😼 好奇", "😿 难过", "😴 困倦"]
        self.current = 0
        self.text = "😺 你好！我是你的桌面宠物"
        self.container = None
    
    def build(self):
        self.container = ft.Container(
            content=ft.Column([
                ft.Text("🐱", size=60),
                ft.Text(self.text, size=14),
                ft.Row([
                    ft.ElevatedButton("抚摸", on_click=self.pet),
                    ft.ElevatedButton("喂食", on_click=self.feed),
                ], alignment=ft.MainAxisAlignment.CENTER),
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            padding=20,
            bgcolor="white",
            border_radius=15,
        )
        return self.container
    
    def pet(self, e):
        self.text = "😺 喵~ 谢谢你！"
        self.current = 0
        if self.container:
            self.container.content = ft.Column([
                ft.Text("🐱", size=60),
                ft.Text(self.text, size=14),
                ft.Row([
                    ft.ElevatedButton("抚摸", on_click=self.pet),
                    ft.ElevatedButton("喂食", on_click=self.feed),
                ], alignment=ft.MainAxisAlignment.CENTER),
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER)
    
    def feed(self, e):
        self.text = "😸 好吃！"
        if self.container:
            self.container.content = ft.Column([
                ft.Text("🐱", size=60),
                ft.Text(self.text, size=14),
                ft.Row([
                    ft.ElevatedButton("抚摸", on_click=self.pet),
                    ft.ElevatedButton("喂食", on_click=self.feed),
                ], alignment=ft.MainAxisAlignment.CENTER),
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER)

# ============ 主程序 ============
class DesktopPet:
    def __init__(self, page):
        self.page = page
        self.page.title = "桌面宠物"
        self.page.window_width = 400
        self.page.window_height = 550
        
        self.weather = WeatherService()
        self.news = NewsService()
        self.pet = PetWidget()
        
        self.build_ui()
        self.load_data()
    
    def build_ui(self):
        self.page.add(
            ft.Column([
                self.pet.build(),
                ft.Container(
                    content=ft.Text("🌤️ 天气", size=16, weight=ft.FontWeight.BOLD),
                    padding=10,
                ),
                ft.Container(
                    content=ft.Text(self.weather.get_display()),
                    padding=10,
                ),
                ft.Container(
                    content=ft.Text("📰 新闻", size=16, weight=ft.FontWeight.BOLD),
                    padding=10,
                ),
                ft.Container(
                    content=ft.Column([
                        ft.Text(n['title'], size=13) for n in self.news.get_news('国内')
                    ]),
                    padding=10,
                ),
            ], spacing=5)
        )
    
    def load_data(self):
        def load():
            self.weather.refresh()
            self.news.refresh()
        threading.Thread(target=load, daemon=True).start()

def main(page):
    DesktopPet(page)

if __name__ == "__main__":
    ft.app(target=main)