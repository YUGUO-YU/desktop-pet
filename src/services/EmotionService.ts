/**
 * 情感系统 - Emotion System
 * 负责管理虚拟形象的情感状态和反馈
 * 使用有限状态机 + 情绪值双维度驱动
 */

import { create } from 'zustand'

// ============ 类型定义 ============

export type EmotionType = 'happy' | 'excited' | 'calm' | 'thoughtful' | 'bored' | 'sleepy' | 'sad' | 'angry'

export interface EmotionState {
  type: EmotionType
  emoji: string
  message: string
  color: string
}

// ============ 情绪配置 ============

const EMOTION_MAP: Record<EmotionType, EmotionState> = {
  happy: {
    type: 'happy',
    emoji: '😸',
    message: '你好呀！见到你真开心！',
    color: '#fbbf24',
  },
  excited: {
    type: 'excited',
    emoji: '😻',
    message: '哇！好高兴呀！',
    color: '#f472b6',
  },
  calm: {
    type: 'calm',
    emoji: '😺',
    message: '今天也很宁静呢~',
    color: '#60a5fa',
  },
  thoughtful: {
    type: 'thoughtful',
    emoji: '😼',
    message: '让我想想...',
    color: '#34d399',
  },
  bored: {
    type: 'bored',
    emoji: '😿',
    message: '好无聊啊...',
    color: '#9ca3af',
  },
  sleepy: {
    type: 'sleepy',
    emoji: '🙀',
    message: '让我歇一会儿...',
    color: '#a78bfa',
  },
  sad: {
    type: 'sad',
    emoji: '😿',
    message: '有点难过呢...',
    color: '#64748b',
  },
  angry: {
    type: 'angry',
    emoji: '😾',
    message: '哼！',
    color: '#f87171',
  },
}

// ============ 消息库 ============

const MESSAGES: Record<EmotionType, string[]> = {
  happy: ['喵~ 最高兴啦！', '蹭蹭你~', '最喜欢你了！', '今天超开心的！'],
  excited: ['呀呼！太棒了！', '兴奋兴奋！', '喵喵喵！', '太好啦！'],
  calm: ['就这样陪着你~', '岁月静好', '静静发呆~', '很平静呢'],
  thoughtful: ['是什么呢...', '让我想想~', '研究研究~', '嗯...'],
  bored: ['好无聊呀...', '喵生无趣...', '理我一下嘛~', '好闲啊...'],
  sleepy: ['Zzz...', '让我眯一会', '好困啊...', '想睡觉啦...'],
  sad: ['呜呜...', '有点伤心...', '呜呜呜~', '难过...'],
  angry: ['哼！', '别惹我！', '喵呜！', '生气气！'],
}

// ============ 状态机定义 ============

type StateNode = EmotionType
type StateEdge = { target: EmotionType; condition: (value: number) => boolean }

const STATE_MACHINE: Record<StateNode, StateEdge[]> = {
  happy: [
    { target: 'excited', condition: (v) => v >= 90 },
    { target: 'calm', condition: (v) => v < 70 },
  ],
  excited: [
    { target: 'happy', condition: (v) => v < 95 },
  ],
  calm: [
    { target: 'happy', condition: (v) => v >= 70 },
    { target: 'thoughtful', condition: (v) => v < 50 && v >= 30 },
    { target: 'bored', condition: (v) => v < 30 },
  ],
  thoughtful: [
    { target: 'calm', condition: (v) => v >= 50 },
    { target: 'bored', condition: (v) => v < 30 },
  ],
  bored: [
    { target: 'calm', condition: (v) => v >= 50 },
    { target: 'sleepy', condition: (v) => v < 20 },
  ],
  sleepy: [
    { target: 'bored', condition: (v) => v >= 30 },
    { target: 'sad', condition: (v) => v < 10 },
  ],
  sad: [
    { target: 'sleepy', condition: (v) => v >= 20 },
    { target: 'angry', condition: (v) => v < 10 },
  ],
  angry: [
    { target: 'sad', condition: (v) => v >= 20 },
    { target: 'calm', condition: (v) => v >= 50 },
  ],
}

// ============ Zustand Store ============

interface EmotionStore {
  // 状态
  emotion: EmotionType
  value: number // 0-100 情绪值
  lastInteraction: number
  
  // 方法
  interact: (action: 'pet' | 'feed' | 'tap' | 'speak') => void
  tick: () => void
  getState: () => EmotionState
  getMessage: () => string
  setEmotion: (emotion: EmotionType) => void
}

export const useEmotionStore = create<EmotionStore>((set, get) => ({
  emotion: 'calm',
  value: 50,
  lastInteraction: Date.now(),

  interact: (action) => {
    const { value, emotion } = get()
    const now = Date.now()
    
    let newValue = value
    let newEmotion = emotion
    
    switch (action) {
      case 'pet': // 抚摸 - 中等正向
        newValue = Math.min(100, value + 12)
        newEmotion = value >= 80 ? 'happy' : value >= 50 ? 'calm' : 'thoughtful'
        break
        
      case 'feed': // 投喂 - 强正向
        newValue = Math.min(100, value + 20)
        newEmotion = 'excited'
        break
        
      case 'tap': // 点击 - 轻微正向 + 随机
        newValue = Math.min(100, value + 5)
        const rand = Math.random()
        if (rand < 0.35) newEmotion = 'happy'
        else if (rand < 0.6) newEmotion = 'excited'
        else if (rand < 0.8) newEmotion = 'calm'
        else newEmotion = 'thoughtful'
        break
        
      case 'speak': // 对话 - 随机正向
        newValue = Math.min(100, value + 8)
        if (value >= 70) newEmotion = 'excited'
        else if (value >= 40) newEmotion = 'calm'
        else newEmotion = 'thoughtful'
        break
    }
    
    set({ 
      value: newValue, 
      emotion: newEmotion,
      lastInteraction: now,
    })
  },

  tick: () => {
    const { value, emotion, lastInteraction } = get()
    const now = Date.now()
    const idleMinutes = (now - lastInteraction) / 60000
    
    let newValue = value
    
    // 空闲衰减
    if (idleMinutes < 5) {
      newValue = Math.min(100, value + 2) // 活跃状态，微增
    } else if (idleMinutes < 30) {
      newValue = value - 3 // 轻度空闲
    } else {
      newValue = value - 8 // 长时间空闲
    }
    
    newValue = Math.max(0, Math.min(100, newValue))
    
    // 状态机转换
    let newEmotion = emotion
    const edges = STATE_MACHINE[emotion]
    for (const edge of edges) {
      if (edge.condition(newValue)) {
        newEmotion = edge.target
        break
      }
    }
    
    set({ value: newValue, emotion: newEmotion })
  },

  getState: () => EMOTION_MAP[get().emotion],
  
  getMessage: () => {
    const { emotion } = get()
    const msgs = MESSAGES[emotion]
    return msgs[Math.floor(Math.random() * msgs.length)]
  },
  
  setEmotion: (emotion) => set({ emotion }),
}))

// 导出配置供其他地方使用
export { EMOTION_MAP, MESSAGES }