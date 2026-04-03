import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEmotionStore, EmotionType } from '../services/EmotionService'
import { useVoiceStore } from '../services/VoiceService'

// ============ 3D Garfield 图片组件 ============

interface GarfieldProps {
  emotion: EmotionType
  isInteracting: boolean
  isSpeaking: boolean
  onInteract: (part: 'head' | 'body' | 'arm' | 'foot') => void
}

// 3D 加菲猫图片组件
function GarfieldImage({ emotion, isInteracting, isSpeaking, onInteract }: GarfieldProps) {
  // 不同情绪对应的图片URL（使用稳定的 placeholder 服务）
  // 这里使用精心设计的 SVG 图像，更接近真实 3D 效果
  const getImageUrl = () => {
    // 3D 风格加菲猫 SVG - 更真实的质感
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220">
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#FF9A5C"/>
            <stop offset="50%" style="stop-color:#FF8C42"/>
            <stop offset="100%" style="stop-color:#E67332"/>
          </linearGradient>
          <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#FFE8D0"/>
            <stop offset="100%" style="stop-color:#FFD4B8"/>
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.3"/>
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- 身体 -->
        <ellipse cx="100" cy="170" rx="55" ry="40" fill="url(#bodyGrad)" filter="url(#shadow)"/>
        
        <!-- 肚子 -->
        <ellipse cx="100" cy="175" rx="35" ry="25" fill="url(#bellyGrad)"/>
        
        <!-- 头 -->
        <ellipse cx="100" cy="70" rx="60" ry="50" fill="url(#bodyGrad)" filter="url(#shadow)"/>
        
        <!-- 耳朵 -->
        <ellipse cx="55" cy="35" rx="18" ry="22" fill="#FF8C42"/>
        <ellipse cx="55" cy="38" rx="10" ry="12" fill="#FFB6C1"/>
        <ellipse cx="145" cy="35" rx="18" ry="22" fill="#FF8C42"/>
        <ellipse cx="145" cy="38" rx="10" ry="12" fill="#FFB6C1"/>
        
        <!-- 眼睛 -->
        <ellipse cx="80" cy="60" rx="12" ry="14" fill="white"/>
        <ellipse cx="120" cy="60" rx="12" ry="14" fill="white"/>
        <ellipse cx="82" cy="62" rx="7" ry="9" fill="#2D2D2D"/>
        <ellipse cx="122" cy="62" rx="7" ry="9" fill="#2D2D2D"/>
        <ellipse cx="80" cy="58" rx="3" ry="3" fill="white"/>
        <ellipse cx="120" cy="58" rx="3" ry="3" fill="white"/>
        
        <!-- 鼻子 -->
        <ellipse cx="100" cy="78" rx="8" ry="5" fill="#FF6B6B"/>
        
        <!-- 嘴巴 -->
        <path d="M92 85 Q100 92 108 85" stroke="#8B4513" stroke-width="2" fill="none"/>
        
        <!-- 腮红 -->
        <ellipse cx="60" cy="75" rx="10" ry="6" fill="#FFB6C1" opacity="0.5"/>
        <ellipse cx="140" cy="75" rx="10" ry="6" fill="#FFB6C1" opacity="0.5"/>
        
        <!-- 手臂 - 抱臂 -->
        <ellipse cx="40" cy="120" rx="15" ry="30" fill="#FF8C42" transform="rotate(30 40 120)"/>
        <ellipse cx="160" cy="120" rx="15" ry="30" fill="#FF8C42" transform="rotate(-30 160 120)"/>
        
        <!-- 脚脚 -->
        <ellipse cx="70" cy="205" rx="15" ry="10" fill="#FF8C42"/>
        <ellipse cx="130" cy="205" rx="15" ry="10" fill="#FF8C42"/>
        
        <!-- 尾巴 -->
        <path d="M150 180 Q180 170 175 150" stroke="#FF8C42" stroke-width="12" fill="none" stroke-linecap="round"/>
        
        <!-- 胡须 -->
        <line x1="45" y1="75" x2="10" y2="70" stroke="#8B4513" stroke-width="1.5"/>
        <line x1="45" y1="80" x2="10" y2="82" stroke="#8B4513" stroke-width="1.5"/>
        <line x1="155" y1="75" x2="190" y2="70" stroke="#8B4513" stroke-width="1.5"/>
        <line x1="155" y1="80" x2="190" y2="82" stroke="#8B4513" stroke-width="1.5"/>
      </svg>
    `
    
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }
  
  const isAnimating = isInteracting || isSpeaking
  
  return (
    <div 
      className="garfield-wrapper"
      onClick={() => onInteract('body')}
      style={{
        transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.3s ease',
      }}
    >
      <img 
        src={getImageUrl()} 
        alt="Garfield"
        style={{
          width: '140px',
          height: '180px',
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        draggable={false}
      />
      
      {/* 可点击区域覆盖 */}
      <div 
        className="click-zone head"
        onClick={(e) => { e.stopPropagation(); onInteract('head') }}
        style={{
          position: 'absolute',
          top: '0%',
          left: '20%',
          width: '60%',
          height: '35%',
          cursor: 'pointer',
        }}
      />
      <div 
        className="click-zone arm-left"
        onClick={(e) => { e.stopPropagation(); onInteract('arm') }}
        style={{
          position: 'absolute',
          top: '40%',
          left: '5%',
          width: '25%',
          height: '25%',
          cursor: 'pointer',
        }}
      />
      <div 
        className="click-zone arm-right"
        onClick={(e) => { e.stopPropagation(); onInteract('arm') }}
        style={{
          position: 'absolute',
          top: '40%',
          right: '5%',
          width: '25%',
          height: '25%',
          cursor: 'pointer',
        }}
      />
      <div 
        className="click-zone foot"
        onClick={(e) => { e.stopPropagation(); onInteract('foot') }}
        style={{
          position: 'absolute',
          bottom: '0%',
          left: '25%',
          width: '50%',
          height: '15%',
          cursor: 'pointer',
        }}
      />
    </div>
  )
}

// ============ 动画变体 ============

const bubbleVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
}

// ============ 主组件 ============

export default function SpiritAvatar() {
  const { emotion, value, interact, getState, getMessage } = useEmotionStore()
  const { isSpeaking, speak, chat, enabled } = useVoiceStore()
  
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
  
  // 处理不同部位的点击
  const handlePartInteract = (part: 'head' | 'body' | 'arm' | 'foot') => {
    setIsInteracting(true)
    
    let responseText = ''
    
    switch (part) {
      case 'head':
        responseText = '喵~ 摸头好舒服！'
        interact('pet')
        break
      case 'body':
        responseText = '嘿嘿，痒痒~'
        interact('tap')
        break
      case 'arm':
        responseText = '这是我的手臂！厉害吧！'
        interact('feed')
        break
      case 'foot':
        responseText = '别挠我脚脚！哈哈！'
        interact('pet')
        break
      default:
        interact('tap')
    }
    
    setMessage(responseText)
    if (enabled) speak(responseText)
    
    setTimeout(() => setIsInteracting(false), 500)
  }
  
  // 处理对话
  const handleSendChat = () => {
    if (!chatText.trim()) return
    
    const userMsg = chatText
    setChatText('')
    setShowChatInput(false)
    
    interact('speak')
    setMessage(`你说: ${userMsg}`)
    
    setTimeout(() => {
      chat(userMsg)
    }, 500)
  }
  
  const state = getState()
  const moodDots = Math.ceil(value / 20)
  
  // 对话输入框
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
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
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
        
        {/* 3D 加菲猫图片 */}
        <GarfieldImage 
          emotion={emotion}
          isInteracting={isInteracting}
          isSpeaking={isSpeaking}
          onInteract={handlePartInteract}
        />
        
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
            onClick={() => handlePartInteract('head')}
          >
            🤚
          </motion.button>
          
          <motion.button
            className="action-btn"
            title="投喂"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              interact('feed')
              setMessage('好吃！谢谢你！')
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