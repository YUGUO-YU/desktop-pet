"""
🐱 情绪引擎 - Emotion Engine
负责宠物的情绪状态管理和反馈
"""
import random
import time
from enum import Enum
from dataclasses import dataclass


class EmotionState(Enum):
    """情绪状态枚举"""
    HAPPY = "开心"      # 开心
    CALM = "平静"        # 平静
    BORED = "无聊"       # 无聊
    SLEEPY = "困倦"      # 困倦
    ANGRY = "生气"        # 生气
    CURIOUS = "好奇"     # 好奇
    SURPRISED = "惊讶"   # 惊讶


@dataclass
class Feedback:
    """反馈数据类"""
    state: EmotionState
    message: str
    animation: str


class EmotionEngine:
    """情绪引擎"""
    
    # 情绪反馈配置
    FEEDBACKS = {
        EmotionState.HAPPY: [
            ("哎呀，你终于理我啦！开心！", "jump"),
            ("喵~ 你最好啦！", "spin"),
            ("蹭蹭你~ 最喜欢你了！", "purr"),
        ],
        EmotionState.CALM: [
            ("今天也很宁静呢~", "idle"),
            ("就这样静静陪着你吧", "blink"),
            ("岁月静好，有你就好", "sit"),
        ],
        EmotionState.BORED: [
            ("好无聊啊... 你都不陪我玩", "lazy"),
            ("喵生好无趣啊...", "stretch"),
            ("理我一下嘛好不好~", "tail_wag"),
        ],
        EmotionState.SLEEPY: [
            ("有点困了，让我歇歇...", "sleepy"),
            ("Zzz... 让我眯一会儿", "sleep"),
            ("好累啊，让我打个盹", "yawn"),
        ],
        EmotionState.ANGRY: [
            ("哼！", "angry"),
            ("别惹我，我现在很生气！", "hiss"),
            ("喵呜！（愤怒）", "puff"),
        ],
        EmotionState.CURIOUS: [
            ("咦？你在看什么呀？", "look"),
            ("让我看看让我看看", "peek"),
            ("这个是什么呢？", "head_tilt"),
        ],
        EmotionState.SURPRISED: [
            ("哇！发生了什么！", "jump"),
            ("哎呀吓我一跳！", "startle"),
            ("喵喵喵？？？", "wide_eyes"),
        ],
    }
    
    def __init__(self):
        self.state = EmotionState.CALM
        self.value = 50  # 情绪值 0-100
        self.last_interact = time.time()
        self.last_decay = time.time()
    
    def interact(self, action: str):
        """处理用户交互"""
        self.last_interact = time.time()
        
        if action == "pet":  # 抚摸
            self.value = min(100, self.value + 15)
            if self.value >= 70:
                self.state = EmotionState.HAPPY
            elif self.value >= 40:
                self.state = EmotionState.CALM
            else:
                self.state = EmotionState.CURIOUS
                
        elif action == "feed":  # 投喂
            self.value = min(100, self.value + 20)
            self.state = EmotionState.HAPPY
            
        elif action == "tap":  # 点击
            self.value = min(100, self.value + 5)
            if self.state == EmotionState.SLEEPY:
                self.state = EmotionState.SURPRISED
            elif random.random() > 0.5:
                self.state = EmotionState.CURIOUS
            else:
                self.state = EmotionState.HAPPY
    
    def tick(self):
        """时间衰减"""
        now = time.time()
        elapsed = now - self.last_decay
        
        # 每10分钟自然衰减
        if elapsed >= 600:
            self.last_decay = now
            
            # 无操作时间
            idle_time = now - self.last_interact
            
            if idle_time < 300:  # 5分钟内
                self.value = min(100, self.value + 3)
            elif idle_time < 1800:  # 30分钟内
                self.value -= 5
            else:  # 30分钟以上
                self.value -= 10
            
            # 情绪状态更新
            self._update_state_by_value()
    
    def _update_state_by_value(self):
        """根据情绪值更新状态"""
        if self.value >= 80:
            self.state = EmotionState.HAPPY
        elif self.value >= 60:
            self.state = EmotionState.CALM
        elif self.value >= 40:
            self.state = EmotionState.BORED
        elif self.value >= 20:
            self.state = EmotionState.SLEEPY
        else:
            self.state = EmotionState.ANGRY
    
    def get_feedback(self) -> Feedback:
        """获取当前反馈"""
        messages = self.FEEDBACKS[self.state]
        message, animation = random.choice(messages)
        return Feedback(state=self.state, message=message, animation=animation)
    
    def set_state(self, state: EmotionState):
        """直接设置状态（用于特定事件触发）"""
        self.state = state
        if state == EmotionState.HAPPY:
            self.value = 80
        elif state == EmotionState.ANGRY:
            self.value = 20
    
    def get_emoji(self) -> str:
        """获取当前情绪对应的emoji"""
        emojis = {
            EmotionState.HAPPY: "😸",
            EmotionState.CALM: "😺",
            EmotionState.BORED: "😿",
            EmotionState.SLEEPY: "🙀",
            EmotionState.ANGRY: "😾",
            EmotionState.CURIOUS: "😼",
            EmotionState.SURPRISED: "😹",
        }
        return emojis.get(self.state, "😺")
    
    def get_state_name(self) -> str:
        """获取状态名称"""
        return self.state.value


if __name__ == "__main__":
    # 测试
    engine = EmotionEngine()
    print(f"初始状态: {engine.get_state_name()} {engine.get_emoji()}")
    print(f"初始反馈: {engine.get_feedback()}")
    
    engine.interact("pet")
    print(f"抚摸后: {engine.get_state_name()} {engine.get_emoji()}")
    print(f"反馈: {engine.get_feedback()}")