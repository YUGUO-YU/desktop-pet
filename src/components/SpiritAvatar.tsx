import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEmotionStore } from '../services/EmotionService'
import { useVoiceStore } from '../services/VoiceService'

// ============ 动画变体 ============

const spiritVariants = {
  idle: { scale: 1, y: 0 },
  hover: { scale: 1.1, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } },
  tap: { scale: [1, 1.3, 0.9, 1], transition: { duration: 0.3 } },
  speaking: { 
    scale: [1, 1.05, 1.05, 1], 
    rotate: [0, 2, -2, 0],
    transition: { duration: 0.5, repeat: 2 } 
  },
}

const bubbleVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
}

// ============ 主组件 ============

export default function SpiritAvatar() {
  const { emotion, value, interact, getState, getMessage } = useEmotionStore()
  const { isSpeaking, speak, chat, cancel, enabled } = useVoiceStore()
  
  const [message, setMessage] = useState(getMessage())
  const [isInteracting, setIsInteracting] = useState(false)
  const [showPulse, setShowPulse] = useState(false)
  const [showChatInput, setShowChatInput] = useState(false)
  const [chatText, setChatText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  // 定时更新情感
  useEffect(() => {
    const timer = setInterval(() => {
      useEmotionStore.getState().tick()
    }, 60000)
    return () => clearInterval(timer)
  }, [])
  
  // 心情变化时脉冲
  useEffect(() => {
    if (value >= 80) {
      setShowPulse(true)
      setTimeout(() => setShowPulse(false), 2000)
    }
  }, [emotion])
  
  // 处理交互
  const handleInteract = (action: 'pet' | 'feed' | 'tap') => {
    setIsInteracting(true)
    interact(action)
    setMessage(getMessage())
    setTimeout(() => setIsInteracting(false), 300)
  }
  
  // 发送对话
  const handleSendChat = () => {
    if (!chatText.trim()) return
    
    const userMsg = chatText
    setChatText('')
    setShowChatInput(false)
    
    // 用户说话
    interact('speak')
    setMessage(`你说: ${userMsg}`)
    
    // 延迟回复
    setTimeout(() => {
      chat(userMsg)
      setMessage(useVoiceStore.getState().isSpeaking ? '让我想想...' : getMessage())
    }, 500)
  }
  
  // 处理回车
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendChat()
    }
  }
  
  const state = getState()
  const moodDots = Math.ceil(value / 20)
  
  // 显示对话输入框
  if (showChatInput) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-3">
        <div className="glass rounded-[20px] p-4 w-full">
          <div className="drag-handle" />
          
          <div className="flex flex-col gap-3 mt-2">
            <input
              ref={inputRef}
              type="text"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="对我说点什么..."
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 focus:outline-none text-sm"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            />
            
            <div className="flex gap-2">
              <button
                onClick={handleSendChat}
                className="flex-1 bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                发送
              </button>
              <button
                onClick={() => setShowChatInput(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3">
      <div className={`glass rounded-[20px] p-4 flex flex-col items-center relative ${showPulse ? 'pulse-glow' : ''}`}>
        <div className="drag-handle" />
        
        {/* 精灵形象 */}
        <motion.div
          className="spirit-face"
          variants={spiritVariants}
          initial="idle"
          animate={isInteracting ? 'tap' : isSpeaking ? 'speaking' : 'idle'}
          whileHover="hover"
          onClick={() => handleInteract('tap')}
          whileTap={{ scale: 0.95 }}
        >
          {state.emoji}
        </motion.div>
        
        {/* 情绪气泡 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            className="mood-bubble"
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {message}
          </motion.div>
        </AnimatePresence>
        
        {/* 心情进度条 */}
        <div className="mood-bar">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`mood-dot ${i <= moodDots ? 'filled' : ''}`} />
          ))}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-2 mt-3">
          <motion.button
            className="action-btn"
            title="抚摸"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              handleInteract('pet')
              if (enabled) speak('喵~ 谢谢你！')
            }}
          >
            🤚
          </motion.button>
          
          <motion.button
            className="action-btn"
            title="投喂"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              handleInteract('feed')
              if (enabled) speak('好吃！谢谢你！')
            }}
          >
            🍪
          </motion.button>
          
          <motion.button
            className="action-btn"
            title="对话"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChatInput(true)}
          >
            💬
          </motion.button>
        </div>
        
      </div>
    </div>
  )
}