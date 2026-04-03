"""
📁 文件整理面板 - Organize Panel UI
文件整理功能界面
"""
import flet as ft
from src.services.file_organizer import FileOrganizer


class OrganizePanel:
    """文件整理面板"""
    
    def __init__(self, file_organizer: FileOrganizer):
        self.organizer = file_organizer
        
        # 路径输入
        self.path_input = ft.TextField(
            label="整理目录",
            hint_text="留空则使用默认桌面",
            width=250,
        )
        
        # 整理按钮
        self.organize_btn = ft.ElevatedButton(
            content=ft.Row([
                ft.icons.FOLDER_OPEN,
                ft.Text("整理桌面"),
            ], spacing=5),
            on_click=self._on_organize,
        )
        
        # 撤销按钮
        self.undo_btn = ft.OutlinedButton(
            content=ft.Row([
                ft.icons.UNDO,
                ft.Text("撤销"),
            ], spacing=5),
            on_click=self._on_undo,
        )
        
        # 结果显示
        self.result_text = ft.Text("", size=12, color=ft.colors.GREY_600)
        self.stats_text = ft.Text("", size=11, color=ft.colors.GREY_500)
    
    def _on_organize(self, e):
        """执行整理"""
        target_dir = self.path_input.value.strip() if self.path_input.value.strip() else None
        
        results = self.organizer.organize(target_dir)
        
        if 'error' in results:
            self.result_text.value = f"❌ {results['error']}"
        else:
            success_count = len(results.get('success', []))
            skip_count = len(results.get('skipped', []))
            error_count = len(results.get('errors', []))
            
            self.result_text.value = f"✅ 整理完成！移动了 {success_count} 个文件"
            if skip_count:
                self.result_text.value += f"，跳过 {skip_count} 个"
            if error_count:
                self.result_text.value += f"，失败 {error_count} 个"
        
        self._update_stats()
        self.result_text.update()
    
    def _on_undo(self, e):
        """撤销"""
        success = self.organizer.undo()
        
        if success:
            self.result_text.value = "✅ 撤销成功！文件已恢复原位"
        else:
            self.result_text.value = "❌ 撤销失败，无法找到最近的操作记录"
        
        self.result_text.update()
    
    def _update_stats(self):
        """更新统计"""
        stats = self.organizer.get_stats()
        if stats['last_time']:
            self.stats_text.value = f"历史已整理 {stats['total_organized']} 个文件"
        else:
            self.stats_text.value = "还没有整理记录"
        self.stats_text.update()
    
    def build(self) -> ft.Container:
        """构建面板"""
        self._update_stats()
        
        return ft.Container(
            content=ft.Column([
                # 标题
                ft.Row([
                    ft.Text("📁 桌面整理", size=16, weight=ft.FontWeight.BOLD),
                ]),
                
                ft.Divider(),
                
                # 输入和按钮
                ft.Row([
                    self.path_input,
                    self.organize_btn,
                    self.undo_btn,
                ], spacing=10),
                
                # 结果
                self.result_text,
                self.stats_text,
                
                # 说明
                ft.Container(
                    content=ft.Text(
                        "💡 将桌面文件按类型整理到对应文件夹（文档/图片/视频/音频/压缩包/安装包/代码）",
                        size=10,
                        color=ft.colors.GREY_500,
                    ),
                    bgcolor=ft.colors.BLUE_50,
                    padding=10,
                    border_radius=8,
                ),
            ], spacing=8),
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
        def save_organize_record(self, results): pass
        def get_organize_records(self, limit): return []
    
    organizer = FileOrganizer(MockDB())
    panel = OrganizePanel(organizer)
    print("文件整理面板已创建")