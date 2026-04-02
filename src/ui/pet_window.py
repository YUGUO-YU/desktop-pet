"""
🐱 宠物浮窗 - Pet Window UI
显示宠物和情绪反馈
"""
import flet as ft
from services.emotion import EmotionEngine, EmotionState


class PetWindow:
    """宠物浮窗"""
    
    def __init__(self, emotion_engine: EmotionEngine, on_interact=None):
        self.engine = emotion_engine
        self.on_interact = on_interact
        
        # 创建UI元素
        self.pet_container = ft.Container(
            content=ft.Column([
                # 宠物图标/图片
                self._build_pet_display(),
                
                # 心情文字
                self._build_mood_text(),
                
                # 反馈消息
                self._build_feedback_text(),
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=5),
            alignment=ft.alignment.center,
            padding=20,
        )
        
        # 交互按钮
        self.action_buttons = self._build_action_buttons()
    
    def _build_pet_display(self) -> ft.Container:
        """构建宠物显示"""
        self.pet_emoji = ft.Text(
            value="😺",
            size=80,
            text_align=ft.TextAlign.CENTER,
        )
        
        return ft.Container(
            content=self.pet_emoji,
            alignment=ft.alignment.center,
            width=120,
            height=120,
            border_radius=60,
            bgcolor=ft.colors.WHITE,
            shadow=ft.BoxShadow(
                spread_radius=2,
                blur_radius=10,
                color=ft.colors.with_opacity(0.2, ft.colors.BLACK),
            ),
            on_click=self._on_pet_click,
        )
    
    def _build_mood_text(self) -> ft.Text:
        """构建心情文字"""
        self.mood_text = ft.Text(
            value="😺 心情: 平静",
            size=14,
            color=ft.colors.GREY_700,
        )
        return self.mood_text
    
    def _build_feedback_text(self) -> ft.Text:
        """构建反馈文字"""
        self.feedback_text = ft.Text(
            value="今天也很宁静呢~",
            size=12,
            color=ft.colors.GREY_500,
            text_align=ft.TextAlign.CENTER,
        )
        return self.feedback_text
    
    def _build_action_buttons(self) -> ft.Row:
        """构建操作按钮"""
        return ft.Row(
            [
                ft.IconButton(
                    icon=ft.icons.PETS,
                    tooltip="抚摸",
                    on_click=lambda e: self._on_action("pet"),
                ),
                ft.IconButton(
                    icon=ft.icons.RESTAURANT,
                    tooltip="投喂",
                    on_click=lambda e: self._on_action("feed"),
                ),
                ft.IconButton(
                    icon=ft.icons.REFRESH,
                    tooltip="查看状态",
                    on_click=lambda e: self._on_action("tap"),
                ),
            ],
            alignment=ft.MainAxisAlignment.CENTER,
            spacing=10,
        )
    
    def _on_pet_click(self, e):
        """点击宠物"""
        self._on_action("tap")
    
    def _on_action(self, action: str):
        """处理动作"""
        if self.on_interact:
            self.on_interact(action)
        self.update_emotion()
    
    def update_emotion(self):
        """更新情绪显示"""
        feedback = self.engine.get_feedback()
        
        # 更新emoji
        self.pet_emoji.value = self.engine.get_emoji()
        
        # 更新心情文字
        self.mood_text.value = f"{self.engine.get_emoji()} 心情: {self.engine.get_state_name()}"
        
        # 更新反馈
        self.feedback_text.value = feedback.message
        
        # 简单的动画效果
        self.pet_container.offset = ft.transform.Offset(0, -0.1)
        self.pet_container.update()
        
        # 恢复位置
        def restore(e):
            self.pet_container.offset = ft.transform.Offset(0, 0)
            self.pet_container.update()
        
        e = ft.ControlEvent(
            "",
            None,
            None,
            None,
            None,
            0,
            None,
            None,
            None,
            None,
        )
        e.page = None
        self.pet_container.update()
    
    def build(self) -> ft.Container:
        """构建完整组件"""
        return ft.Container(
            content=ft.Column([
                self.pet_container,
                self.action_buttons,
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            bgcolor=ft.colors.BLUE_50,
            border_radius=ft.border_radius.all(15),
            padding=10,
        )


if __name__ == "__main__":
    # 测试用简易代码
    engine = EmotionEngine()
    pet = PetWindow(engine)
    print(f"初始: {engine.get_emoji()} {engine.get_state_name()}")
    print(f"反馈: {engine.get_feedback()}")
    
    engine.interact("pet")
    print(f"抚摸后: {engine.get_emoji()} {engine.get_state_name()}")