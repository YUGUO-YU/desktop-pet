"""
🌤️ 天气卡片 - Weather Card UI
显示天气信息和穿衣建议
"""
import flet as ft
from src.services.weather import WeatherService


class WeatherCard:
    """天气卡片"""
    
    def __init__(self, weather_service: WeatherService, on_city_changed=None):
        self.service = weather_service
        self.on_city_changed = on_city_changed
        
        # 输入框和按钮
        self.city_input = ft.TextField(
            label="城市",
            hint_text="输入城市名",
            width=150,
            on_submit=self._on_city_submit,
        )
        
        self.refresh_btn = ft.IconButton(
            icon=ft.icons.REFRESH,
            tooltip="刷新天气",
            on_click=lambda e: self._refresh(),
        )
        
        # 天气显示
        self.temp_text = ft.Text("加载中...", size=24, weight=ft.FontWeight.BOLD)
        self.weather_text = ft.Text("", size=16, color=ft.colors.GREY_700)
        self.suggestion_text = ft.Text("", size=12, color=ft.colors.GREY_600)
        self.update_text = ft.Text("", size=10, color=ft.colors.GREY_500)
        
    def _on_city_submit(self, e):
        """城市提交"""
        city = self.city_input.value.strip()
        if city and self.on_city_changed:
            self.on_city_changed(city)
    
    def _refresh(self):
        """刷新天气"""
        self.service.refresh()
        self.update_display()
    
    def update_display(self):
        """更新显示"""
        data = self.service.get_weather_data()
        
        if data:
            self.temp_text.value = f"{data['icon']} {data['temp']}°C"
            self.weather_text.value = f"{data['city']} - {data['weather']}"
            self.suggestion_text.value = data['clothing']
            self.update_text.value = f"更新于 {data['update_time']}"
        else:
            self.temp_text.value = "天气获取失败"
            self.weather_text.value = "请检查网络"
    
    def build(self) -> ft.Container:
        """构建卡片"""
        # 初始刷新
        self.service.refresh()
        self.update_display()
        
        return ft.Container(
            content=ft.Column([
                # 标题栏
                ft.Row([
                    ft.Text("🌤️ 天气播报", size=16, weight=ft.FontWeight.BOLD),
                    ft.Row([self.city_input, self.refresh_btn], spacing=5),
                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                
                ft.Divider(),
                
                # 温度
                ft.Row([
                    self.temp_text,
                    ft.Column([
                        self.weather_text,
                        self.suggestion_text,
                    ], spacing=2),
                ], spacing=20),
                
                # 更新时间
                self.update_text,
            ], spacing=10),
            bgcolor=ft.colors.WHITE,
            border_radius=ft.border_radius.all(15),
            padding=15,
            shadow=ft.BoxShadow(
                spread_radius=1,
                blur_radius=5,
                color=ft.colors.with_opacity(0.1, ft.colors.BLACK),
            ),
        )


if __name__ == "__main__":
    class MockDB:
        def cache_weather(self, data): pass
        def get_cached_weather(self): return None
    
    from src.services.weather import WeatherService
    service = WeatherService(MockDB())
    service.set_city("北京")
    service.refresh()
    print(service.weather_data)