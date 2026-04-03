"""
News Card UI
"""
import flet as ft
import webbrowser
from src.services.news import NewsService


class NewsCard:
    def __init__(self, news_service: NewsService):
        self.service = news_service
        self.current_category = '国内'
        
        self.tab_buttons = ft.Row([
            ft.Container(
                content=ft.Text("国内"),
                padding=10,
                on_click=lambda e: self._switch_category('国内'),
                bgcolor=ft.colors.BLUE_100,
                border_radius=8,
            ),
            ft.Container(
                content=ft.Text("国外"),
                padding=10,
                on_click=lambda e: self._switch_category('国外'),
                bgcolor=ft.colors.WHITE,
                border_radius=8,
            ),
        ], spacing=10)
        
        self.news_list = ft.Column([], spacing=10)
        
        self.refresh_btn = ft.IconButton(
            icon=ft.icons.REFRESH,
            on_click=lambda e: self._refresh(),
        )
    
    def _switch_category(self, category: str):
        self.current_category = category
        self._update_news_list()
    
    def _refresh(self):
        self.service.refresh()
        self._update_news_list()
    
    def _update_news_list(self):
        news_list = self.service.get_display_news(self.current_category)
        
        items = []
        for news in news_list[:3]:
            summary = news.get('summary', '暂无摘要')
            if len(summary) > 60:
                summary = summary[:60] + '...'
            
            items.append(ft.Container(
                content=ft.Column([
                    ft.Text(news['title'], size=13, weight=500, max_lines=2),
                    ft.Text(summary, size=11, color=ft.colors.GREY_600, max_lines=2),
                    ft.Text(f"📰 {news.get('source', '未知来源')}", size=10, color=ft.colors.GREY_500),
                ], spacing=3),
                padding=10,
                bgcolor=ft.colors.GREY_50,
                border_radius=8,
                on_click=lambda e, url=news.get('url'): webbrowser.open(url) if url else None,
            ))
        
        self.news_list.controls = items
        self.news_list.update()
    
    def build(self) -> ft.Container:
        self.service.refresh()
        self._update_news_list()
        
        return ft.Container(
            content=ft.Column([
                ft.Row([
                    ft.Text("📰 今日资讯", size=16, weight=ft.FontWeight.BOLD),
                    self.refresh_btn,
                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                self.tab_buttons,
                self.news_list,
            ], spacing=10),
            bgcolor=ft.colors.WHITE,
            border_radius=15,
            padding=15,
            shadow=ft.BoxShadow(spread_radius=1, blur_radius=5, color=ft.colors.with_opacity(0.1, ft.colors.BLACK)),
        )


if __name__ == "__main__":
    class MockDB:
        def cache_news(self, data): pass
    
    from src.services.news import NewsService
    service = NewsService(MockDB())
    service.refresh()
    print(service.news_data)