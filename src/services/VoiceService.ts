/**
 * 语音服务 - Voice Service
 * 使用浏览器 Speech Synthesis API 进行语音合成
 * 支持中文语音、语速调节、音量控制
 */

import { create } from 'zustand'

// ============ 类型定义 ============

export type VoiceState = {
  enabled: boolean
  rate: number      // 0.5 - 2.0
  volume: number    // 0 - 1
  voice: SpeechSynthesisVoice | null
  isSpeaking: boolean
}

// ============ 语音合成 ============

class TTSEngine {
  private synth: SpeechSynthesis
  private voices: SpeechSynthesisVoice[] = []
  private currentVoice: SpeechSynthesisVoice | null = null
  
  constructor() {
    this.synth = window.speechSynthesis
    
    // 加载语音列表
    this.loadVoices()
    
    // 某些浏览器需要事件监听
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices()
    }
  }
  
  private loadVoices(): void {
    this.voices = this.synth.getVoices()
    
    // 优先选择中文语音
    const chineseVoice = this.voices.find(v => 
      v.lang.includes('zh-CN') || v.lang.includes('zh_CN')
    )
    
    if (chineseVoice) {
      this.currentVoice = chineseVoice
    } else if (this.voices.length > 0) {
      // 备用第一个语音
      this.currentVoice = this.voices[0]
    }
  }
  
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }
  
  setVoice(voice: SpeechSynthesisVoice): void {
    this.currentVoice = voice
  }
  
  speak(text: string, onEnd?: () => void): void {
    // 先取消当前说话
    this.synth.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    
    if (this.currentVoice) {
      utterance.voice = this.currentVoice
    }
    
    utterance.rate = 1.0
    utterance.volume = 1.0
    utterance.pitch = 1.0
    
    utterance.onend = () => {
      onEnd?.()
    }
    
    utterance.onerror = (e) => {
      console.error('语音合成错误:', e)
    }
    
    this.synth.speak(utterance)
  }
  
  cancel(): void {
    this.synth.cancel()
  }
  
  isSpeaking(): boolean {
    return this.synth.speaking
  }
}

// 创建引擎实例
const ttsEngine = new TTSEngine()

// ============ 消息响应系统 ============

const RESPONSES: Record<string, string[]> = {
  // 问候
  greeting: [
    '你好呀！很高兴见到你！',
    '喵~ 你回来啦！',
    '今天怎么样？开心吗？',
  ],
  
  // 关于自己
  about: [
    '我是你的桌面小精灵呀！陪你聊天，解闷~',
    '我是可爱的小猫咪变的！',
    '我是你最好的朋友呀！',
  ],
  
  // 情绪
  mood: [
    '我现在很开心呀！因为有你在~',
    '挺好的呀，静静陪着你~',
    '如果你不在，我会无聊的...',
  ],
  
  // 帮助
  help: [
    '我可以陪你聊天呀！也可以帮你查天气~',
    '点击我可以抚摸我哦！',
    '你可以对我说话，我会回复你的！',
  ],
  
  // 天气
  weather: [
    '天气功能正在开发中~以后就能告诉你天气啦！',
    ' Soon 就可以查天气了！',
  ],
  
  // 默认
  default: [
    '嗯嗯，我在听呢~',
    '然后呢？',
    '喵？',
    '我不太明白但是我好喜欢你！',
  ],
}

// 关键词匹配
const KEYWORDS: Record<string, string[]> = {
  greeting: ['你好', '嗨', '哈喽', 'hello', 'hi', '早上好', '晚安'],
  about: ['你是谁', '叫什么', '什么精灵', '介绍'],
  mood: ['心情', '怎么样', '好吗', '开心'],
  help: ['帮助', '能做什么', '功能', '可以'],
  weather: ['天气', '温度', '下雨', '晴天'],
}

// 匹配意图
function matchIntent(text: string): string {
  const lower = text.toLowerCase()
  
  for (const [intent, keywords] of Object.entries(KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return intent
      }
    }
  }
  
  return 'default'
}

// 获取随机回复
function getResponse(intent: string): string {
  const responses = RESPONSES[intent] || RESPONSES.default
  return responses[Math.floor(Math.random() * responses.length)]
}

// ============ Zustand Store ============

interface VoiceStore extends VoiceState {
  // 方法
  speak: (text: string) => void
  cancel: () => void
  setEnabled: (enabled: boolean) => void
  setRate: (rate: number) => void
  setVolume: (volume: number) => void
  setVoice: (voice: SpeechSynthesisVoice) => void
  getVoices: () => SpeechSynthesisVoice[]
  chat: (message: string) => void
  isReady: () => boolean
}

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  enabled: true,
  rate: 1.0,
  volume: 1.0,
  voice: null,
  isSpeaking: false,
  
  speak: (text) => {
    const { enabled } = get()
    if (!enabled) return
    
    set({ isSpeaking: true })
    
    ttsEngine.speak(text, () => {
      set({ isSpeaking: false })
    })
  },
  
  cancel: () => {
    ttsEngine.cancel()
    set({ isSpeaking: false })
  },
  
  setEnabled: (enabled) => set({ enabled }),
  setRate: (rate) => set({ rate }),
  setVolume: (volume) => set({ volume }),
  setVoice: (voice) => {
    ttsEngine.setVoice(voice)
    set({ voice })
  },
  
  getVoices: () => ttsEngine.getVoices(),
  
  chat: (message) => {
    const intent = matchIntent(message)
    const response = getResponse(intent)
    get().speak(response)
  },
  
  isReady: () => {
    return get().enabled && !get().isSpeaking
  },
}))

export { ttsEngine, matchIntent, getResponse }