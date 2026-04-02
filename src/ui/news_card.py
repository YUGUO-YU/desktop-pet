"""
📰 新闻卡片 - News Card UI
显示国内外新闻资讯
"""
import flet as ft
from src.services.news import NewsService


class NewsCard:
    """新闻卡片"""
    
    def __init__(self, news_service: NewsService):
        self.service = news_service
        self.current_category = '国内'
        
        # 切换按钮
        self.tab_buttons = ft.Row(
            [
                ft.Container(
                    content=ft.Text("国内"),
                    padding=10,
                    on_click=lambda e: self._switch_category('国内'),
                    bgcolor=ft.colors.BLUE_100,
                    border_radius=ft.border_radius.all(8),
                ),
                ft.Container(
                    content=ft.Text("国外"),
                    padding=10,
                    on_click=lambda e: self._switch_category('国外'),
                    bgcolor=ft.colors.WHITE,
                    border_radius=ft.border_radius.all(8),
                ),
            ],
            spacing=10,
        )
        
        # 新闻列表容器
        self.news_list = ft.Column([], spacing=10)
        
        # 刷新按钮
        self.refresh_btn = ft.IconButton(
            icon=ft.icons.REFRESH,
            tooltip="刷新新闻",
            on_click=lambda e: self._refresh(),
        )
    
    def _switch_category(self, category: str):
        """切换分类"""
        self.current_category = category
        self._update_news_list()
    
    def _refresh(self):
        """刷新新闻"""
        self.service.refresh()
        self._update_news_list()
    
    def _update_news_list(self):
        """更新新闻列表"""
        news_list = self.service.get_display_news(self.current_category)
        
        items = []
        for news in news_list[:3]:  # 只显示前3条
            items.append(
                ft.Container(
                    content=ft.Column([
                        ft.Text(
                            news['title'],
                            size=13,
                            weight=ft.FontWeight.W_500,
                            max_lines=2,
                            overflow=ft.TextOverflow.ELLIPSIS,
                        ),
                        ft.Text(
                            news.get('summary', '')[:60] + '...' if len(news.get('summary', '')) > 60 else news.get('summary', '暂无摘要'),
                            size=11,
                            color=ft.colors.GREY_600,
                            max_lines=2,
                        ),
                        ft.Text(
                            f"📰 {news.get('source', '未知来源')}",
                            size=10,
                            color=ft.colors.GREY_500,
                        ),
                    ], spacing=3)),
                    padding=10,
                    bgcolor=ft.colors.GREY_50,
                    border_radius=ft.border_radius.all(8),
                    on_click=lambda e, url=news.get('url'): self._open_url(url),
                )
            )
        
        self.news_list.controls = items
        self.news_list.update()
    
    def _open_url(self, url: str):
        """打开链接"""
        if url:
            import webbrowser
            webbrowser.open(url)
    
    def build(self) -> ft.Container:
        """构建卡片"""
        # 初始加载
        self.service.refresh()
        self._update_news_list()
        
        return ft.Container(
            content=ft.Column([
                # 标题栏
                ft.Row([
                    ft.Text("📰 今日资讯", size=16, weight=ft.FontWeight.BOLD),
                    self.refresh_btn,
                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                
                # 分类切换
                self.tab_buttons,
                
                # 新闻列表
                self.news_list,
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
        def cache_news(self, data): pass
    
    from src.services.news import NewsService
    service = NewsService(MockDB())
    service.refresh()
    print(service.news_data)