"""
🐱 桌面宠物 - Desktop Pet V1.0
主程序入口
"""
import flet as ft
import threading
import time
import json
import os
from datetime import datetime

from src.ui.pet_window import PetWindow
from src.ui.weather_card import WeatherCard
from src.ui.news_card import NewsCard
from src.ui.organize_panel import OrganizePanel
from src.services.emotion import EmotionEngine, EmotionState
from src.services.weather import WeatherService
from src.services.news import NewsService
from src.services.file_organizer import FileOrganizer
from src.utils.database import Database


class DesktopPet:
    """桌面宠物主程序"""
    
    def __init__(self, page: ft.Page):
        self.page = page
        self.page.title = "桌面宠物"
        self.page.window_width = 400
        self.page.window_height = 600
        self.page.window_resizable = False
        self.page.window_decorated = True
        self.page.padding = 0
        
        # 初始化服务
        self.db = Database()
        self.emotion_engine = EmotionEngine()
        self.weather_service = WeatherService(self.db)
        self.news_service = NewsService(self.db)
        self.file_organizer = FileOrganizer(self.db)
        
        # UI 组件
        self.pet_window = PetWindow(self.emotion_engine, self.on_pet_interact)
        self.weather_card = WeatherCard(self.weather_service, self.on_city_changed)
        self.news_card = NewsCard(self.news_service)
        self.organize_panel = OrganizePanel(self.file_organizer)
        
        # 加载用户配置
        self.load_config()
        
        # 构建UI
        self.build_ui()
        
        # 启动后台任务
        self.start_background_tasks()
    
    def load_config(self):
        """加载配置"""
        config = self.db.get_config()
        if config:
            self.weather_service.set_city(config.get('city', '北京'))
    
    def build_ui(self):
        """构建UI"""
        # 主容器
        self.page.add(
            ft.Column([
                # 宠物区域
                self.pet_window.build(),
                
                # 天气卡片
                self.weather_card.build(),
                
                # 新闻卡片
                self.news_card.build(),
                
                # 文件整理
                self.organize_panel.build(),
            ], spacing=10, scroll=ft.ScrollMode.AUTO)
        )
    
    def on_pet_interact(self, action: str):
        """宠物交互回调"""
        self.emotion_engine.interact(action)
        self.pet_window.update_emotion()
    
    def on_city_changed(self, city: str):
        """城市变更回调"""
        self.db.save_config({'city': city})
        self.weather_service.set_city(city)
    
    def start_background_tasks(self):
        """启动后台任务"""
        # 情绪自然衰减
        def emotion_decay():
            while True:
                time.sleep(600)  # 10分钟
                self.emotion_engine.tick()
                self.pet_window.update_emotion()
        
        # 天气定时更新
        def weather_update():
            while True:
                time.sleep(7200)  # 2小时
                self.weather_service.refresh()
                self.page.update()
        
        # 线程启动
        threading.Thread(target=emotion_decay, daemon=True).start()
        threading.Thread(target=weather_update, daemon=True).start()


def main(page: ft.Page):
    """主函数"""
    app = DesktopPet(page)
    
    # 初始加载天气和新闻
    page.run_thread(app.weather_service.refresh())
    page.run_thread(app.news_service.refresh())


if __name__ == "__main__":
    ft.app(target=main)