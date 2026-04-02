"""
📁 文件整理服务 - File Organizer Service
按文件类型自动整理桌面文件
"""
import os
import shutil
import hashlib
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional


class FileOrganizer:
    """文件整理器"""
    
    # 文件类型映射
    FILE_CATEGORIES = {
        '文档': ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.odt'],
        '图片': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico', '.tiff'],
        '视频': ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v'],
        '音频': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'],
        '压缩包': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
        '安装包': ['.exe', '.msi', '.dmg', '.deb', '.rpm', '.app', '.pkg'],
        '代码': ['.py', '.js', '.java', '.c', '.cpp', '.h', '.cs', '.go', '.rs', '.ts', '.html', '.css', '.json', '.xml', '.yml', '.md'],
    }
    
    def __init__(self, db):
        self.db = db
        self.source_dir = None
        self.last_organize_time = None
    
    def set_source_dir(self, directory: str):
        """设置源目录"""
        self.source_dir = Path(directory)
    
    def get_default_desktop(self) -> Path:
        """获取默认桌面路径"""
        if os.name == 'nt':  # Windows
            return Path(os.path.join(os.environ['USERPROFILE'], 'Desktop'))
        else:  # macOS / Linux
            return Path(os.path.join(os.path.expanduser('~'), 'Desktop'))
    
    def organize(self, target_dir: Optional[str] = None) -> Dict:
        """执行文件整理"""
        if target_dir:
            source = Path(target_dir)
        elif self.source_dir:
            source = self.source_dir
        else:
            source = self.get_default_desktop()
        
        results = {
            'success': [],
            'skipped': [],
            'errors': [],
            'total': 0,
        }
        
        if not source.exists():
            return {'error': f'目录不存在: {source}'}
        
        # 创建目标目录
        now = datetime.now()
        year = now.strftime('%Y')
        month = now.strftime('%m')
        
        # 遍历文件
        for item in source.iterdir():
            if item.is_file():
                try:
                    # 获取文件类型
                    category = self._get_category(item)
                    if not category:
                        category = '其他'
                    
                    # 目标目录
                    dest_dir = source / category / year / month
                    dest_dir.mkdir(parents=True, exist_ok=True)
                    
                    # 目标路径
                    dest_path = dest_dir / item.name
                    
                    # 如果文件已存在，重命名
                    if dest_path.exists():
                        # 检查哈希
                        if self._files_identical(item, dest_path):
                            results['skipped'].append({
                                'name': item.name,
                                'reason': '文件已存在（完全相同）',
                            })
                            continue
                        else:
                            # 重命名
                            dest_path = self._get_unique_path(dest_path)
                    
                    # 移动文件
                    shutil.move(str(item), str(dest_path))
                    
                    # 记录
                    results['success'].append({
                        'name': item.name,
                        'category': category,
                        'from': str(item),
                        'to': str(dest_path),
                    })
                    
                except Exception as e:
                    results['errors'].append({
                        'name': item.name,
                        'error': str(e),
                    })
        
        results['total'] = len(results['success'])
        self.last_organize_time = datetime.now()
        
        # 保存记录到数据库
        self.db.save_organize_record(results)
        
        return results
    
    def _get_category(self, file_path: Path) -> Optional[str]:
        """获取文件分类"""
        suffix = file_path.suffix.lower()
        for category, extensions in self.FILE_CATEGORIES.items():
            if suffix in extensions:
                return category
        return None
    
    def _get_unique_path(self, path: Path) -> Path:
        """获取唯一路径（避免重名）"""
        if not path.exists():
            return path
        
        stem = path.stem
        suffix = path.suffix
        parent = path.parent
        counter = 1
        
        while True:
            new_path = parent / f"{stem}_{counter}{suffix}"
            if not new_path.exists():
                return new_path
            counter += 1
    
    def _files_identical(self, file1: Path, file2: Path) -> bool:
        """检查两个文件是否相同"""
        try:
            hash1 = self._get_file_hash(file1)
            hash2 = self._get_file_hash(file2)
            return hash1 == hash2
        except:
            return False
    
    def _get_file_hash(self, file_path: Path) -> str:
        """获取文件哈希"""
        hasher = hashlib.md5()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                hasher.update(chunk)
        return hasher.hexdigest()
    
    def undo(self, record_id: int = -1) -> bool:
        """撤销最近的整理操作"""
        records = self.db.get_organize_records(1)
        if not records:
            return False
        
        record = records[0]
        if 'files' not in record:
            return False
        
        success = True
        for file_info in record['files']:
            try:
                if os.path.exists(file_info['to']):
                    shutil.move(file_info['to'], file_info['from'])
            except Exception as e:
                print(f"撤销失败: {e}")
                success = False
        
        return success
    
    def get_stats(self) -> Dict:
        """获取整理统计"""
        records = self.db.get_organize_records(10)
        total = sum(r.get('total', 0) for r in records)
        return {
            'total_organized': total,
            'last_time': self.last_organize_time.strftime('%Y-%m-%d %H:%M') if self.last_organize_time else None,
            'records_count': len(records),
        }


if __name__ == "__main__":
    class MockDB:
        def save_organize_record(self, results): pass
        def get_organize_records(self, limit): return []
    
    organizer = FileOrganizer(MockDB())
    desktop = organizer.get_default_desktop()
    print(f"桌面路径: {desktop}")
    
    # 测试整理
    results = organizer.organize(str(desktop))
    print(f"整理结果: {results}")