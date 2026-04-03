"""
💾 数据库工具 - Database Utility
SQLite本地存储
"""
import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path


class Database:
    """数据库工具"""
    
    def __init__(self, db_path: str = None):
        if db_path:
            self.db_path = db_path
        else:
            # 默认放在用户数据目录
            app_dir = Path(__file__).parent.parent
            self.db_path = app_dir / "data" / "desktop_pet.db"
        
        # 确保目录存在
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 初始化
        self._init_tables()
    
    def _init_tables(self):
        """初始化表"""
        conn = self._get_conn()
        cursor = conn.cursor()
        
        # 配置表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS config (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TEXT
            )
        ''')
        
        # 天气缓存表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS weather_cache (
                id INTEGER PRIMARY KEY,
                data TEXT,
                updated_at TEXT
            )
        ''')
        
        # 新闻缓存表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS news_cache (
                id INTEGER PRIMARY KEY,
                category TEXT,
                data TEXT,
                updated_at TEXT
            )
        ''')
        
        # 整理记录表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS organize_records (
                id INTEGER PRIMARY KEY,
                files TEXT,
                total INTEGER,
                created_at TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def _get_conn(self) -> sqlite3.Connection:
        """获取连接"""
        return sqlite3.connect(str(self.db_path))
    
    # ===== 配置 =====
    def get_config(self) -> dict:
        """获取配置"""
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT key, value FROM config")
        rows = cursor.fetchall()
        conn.close()
        
        return {k: v for k, v in rows}
    
    def save_config(self, config: dict):
        """保存配置"""
        conn = self._get_conn()
        cursor = conn.cursor()
        
        for key, value in config.items():
            cursor.execute(
                "INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, ?)",
                (key, str(value), datetime.now().isoformat())
            )
        
        conn.commit()
        conn.close()
    
    # ===== 天气 =====
    def cache_weather(self, data: dict):
        """缓存天气"""
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT OR REPLACE INTO weather_cache (id, data, updated_at) VALUES (1, ?, ?)",
            (json.dumps(data), datetime.now().isoformat())
        )
        
        conn.commit()
        conn.close()
    
    def get_cached_weather(self) -> dict:
        """获取缓存天气"""
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT data FROM weather_cache WHERE id = 1")
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return json.loads(row[0])
        return None
    
    # ===== 新闻 =====
    def cache_news(self, data: dict):
        """缓存新闻"""
        conn = self._get_conn()
        cursor = conn.cursor()
        
        # 先删除旧的
        cursor.execute("DELETE FROM news_cache")
        
        # 插入新的
        for category, news_list in data.items():
            cursor.execute(
                "INSERT INTO news_cache (category, data, updated_at) VALUES (?, ?, ?)",
                (category, json.dumps(news_list), datetime.now().isoformat())
            )
        
        conn.commit()
        conn.close()
    
    def get_cached_news(self) -> dict:
        """获取缓存新闻"""
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT category, data FROM news_cache")
        rows = cursor.fetchall()
        conn.close()
        
        result = {}
        for category, data in rows:
            result[category] = json.loads(data)
        
        return result
    
    # ===== 整理记录 =====
    def save_organize_record(self, results: dict):
        """保存整理记录"""
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO organize_records (files, total, created_at) VALUES (?, ?, ?)",
            (json.dumps(results), results.get('total', 0), datetime.now().isoformat())
        )
        
        conn.commit()
        conn.close()
    
    def get_organize_records(self, limit: int = 10) -> list:
        """获取整理记录"""
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT files, total, created_at FROM organize_records ORDER BY id DESC LIMIT ?",
            (limit,)
        )
        rows = cursor.fetchall()
        conn.close()
        
        results = []
        for files, total, created_at in rows:
            record = json.loads(files)
            record['total'] = total
            record['created_at'] = created_at
            results.append(record)
        
        return results


if __name__ == "__main__":
    db = Database()
    print(f"数据库路径: {db.db_path}")
    
    # 测试
    db.save_config({'city': '北京', 'theme': 'light'})
    config = db.get_config()
    print(f"配置: {config}")