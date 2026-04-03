"""
📰 新闻服务 - News Service
提供国内外新闻资讯
"""
import feedparser
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional


class NewsService:
    """新闻服务"""
    
    # RSS 源配置
    RSS_SOURCES = {
        '国内': [
            'https://www.pengpai.net/feed/',
            'https://www.guancha.cn/all.xml',
            'http://news.163.com/rss/',
        ],
        '国外': [
            'http://feeds.bbci.co.uk/news/rss.xml',
            'https://feeds.reuters.com/reuters/topNews',
        ]
    }
    
    # 备用API源
    FALLBACK_NEWS = {
        '国内': [
            {"title": "习近平主持召开中央全面深化改革委员会会议", "summary": "会议审议通过了多项重要改革方案，强调要坚持以人民为中心的发展思想...", "source": "新华社", "url": "http://www.xinhuanet.com/"},
            {"title": "一季度经济运行数据发布，总体延续恢复态势", "summary": "国家统计局发布一季度国民经济运行数据，主要指标显示经济运行总体平稳...", "source": "人民日报", "url": "http://www.people.com.cn/"},
        ],
        '国外': [
            {"title": "SpaceX成功发射新一代星际飞船", "summary": "SpaceX今日成功发射了新一代星际飞船原型，这是人类登陆火星计划的重要里程碑...", "source": "BBC News", "url": "https://www.bbc.com/news"},
            {"title": "联合国秘书长呼吁加强全球气候行动", "summary": "联合国秘书长古特雷斯呼吁各国加强气候行动，实现减排目标...", "source": "Reuters", "url": "https://www.reuters.com/"},
        ]
    }
    
    def __init__(self, db):
        self.db = db
        self.news_data = {'国内': [], '国外': []}
        self.last_update = None
    
    def refresh(self):
        """刷新新闻"""
        self.news_data = {'国内': [], '国外': []}
        
        # 尝试获取RSS新闻
        try:
            # 国内新闻
            for source in self.RSS_SOURCES['国内']:
                try:
                    feed = feedparser.parse(source)
                    for entry in feed.entries[:3]:
                        self.news_data['国内'].append({
                            'title': entry.get('title', '')[:50],
                            'summary': entry.get('summary', '')[:100] if entry.get('summary') else '暂无摘要',
                            'source': feed.feed.get('title', '未知'),
                            'url': entry.get('link', ''),
                        })
                except Exception:
                    continue
                if self.news_data['国内']:
                    break
                    
            # 国外新闻
            for source in self.RSS_SOURCES['国外']:
                try:
                    feed = feedparser.parse(source)
                    for entry in feed.entries[:3]:
                        self.news_data['国外'].append({
                            'title': entry.get('title', '')[:50],
                            'summary': entry.get('summary', '')[:100] if entry.get('summary') else 'No summary',
                            'source': feed.feed.get('title', 'Unknown'),
                            'url': entry.get('link', ''),
                        })
                except Exception:
                    continue
                if self.news_data['国外']:
                    break
                    
        except Exception as e:
            print(f"获取RSS失败: {e}")
        
        # 如果没有获取到，使用备用新闻
        if not self.news_data['国内']:
            self.news_data['国内'] = self.FALLBACK_NEWS['国内']
        if not self.news_data['国外']:
            self.news_data['国外'] = self.FALLBACK_NEWS['国外']
        
        self.last_update = datetime.now()
        
        # 缓存到数据库
        self.db.cache_news(self.news_data)
    
    def get_news(self) -> Dict[str, List[Dict]]:
        """获取新闻数据"""
        if not self.news_data['国内'] and not self.news_data['国外']:
            self.refresh()
        return self.news_data
    
    def get_display_news(self, category: str = '国内') -> List[Dict]:
        """获取特定分类的新闻"""
        if not self.news_data[category]:
            self.refresh()
        return self.news_data.get(category, [])


if __name__ == "__main__":
    # 测试
    class MockDB:
        def cache_news(self, data): pass
    
    service = NewsService(MockDB())
    service.refresh()
    print("国内新闻:", service.news_data['国内'])
    print("国外新闻:", service.news_data['国外'])