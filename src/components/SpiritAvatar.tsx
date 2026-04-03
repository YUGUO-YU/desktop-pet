import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEmotionStore, EmotionType } from '../services/EmotionService'
import { useVoiceStore } from '../services/VoiceService'

// ============ 3D Garfield 模型组件 ============

interface GarfieldProps {
  emotion: EmotionType
  isInteracting: boolean
  isSpeaking: boolean
  onInteract: (part: 'head' | 'body' | 'arm' | 'foot') => void
}

// 3D 加菲猫组件
function Garfield({ emotion, isInteracting, isSpeaking, onInteract }: GarfieldProps) {
  // 情绪对应的表情
  const getExpression = () => {
    switch (emotion) {
      case 'happy':
      case 'excited':
        return { eyes: 'happy', mouth: 'smile', brow: 'normal' }
      case 'calm':
        return { eyes: 'calm', mouth: 'neutral', brow: 'normal' }
      case 'thoughtful':
        return { eyes: 'thoughtful', mouth: 'pensive', brow: 'raised' }
      case 'bored':
        return { eyes: 'bored', mouth: 'bored', brow: 'flat' }
      case 'sleepy':
        return { eyes: 'sleepy', mouth: 'sleepy', brow: 'sleepy' }
      case 'sad':
        return { eyes: 'sad', mouth: 'sad', brow: 'sad' }
      case 'angry':
        return { eyes: 'angry', mouth: 'angry', brow: 'angry' }
      default:
        return { eyes: 'calm', mouth: 'neutral', brow: 'normal' }
    }
  }

  const expr = getExpression()
  const isAnimating = isInteracting || isSpeaking

  return (
    <div className="garfield-container" onClick={() => onInteract('body')}>
      {/* 身体 */}
      <div className={`garfield-body ${isAnimating ? 'bounce' : ''}`}>
        {/* 橙色身体主体 */}
        <div className="body-main">
          {/* 肚子 */}
          <div className="belly" />
        </div>
        
        {/* 头 */}
        <div className="garfield-head" onClick={(e) => { e.stopPropagation(); onInteract('head') }}>
          {/* 耳朵 */}
          <div className="ear left-ear" />
          <div className="ear right-ear" />
          
          {/* 脸部 */}
          <div className="face">
            {/* 眼睛 */}
            <div className={`eyes ${expr.eyes}`}>
              <div className="eye left-eye">
                <div className="pupil" />
              </div>
              <div className="eye right-eye">
                <div className="pupil" />
              </div>
            </div>
            
            {/* 鼻子 */}
            <div className="nose" />
            
            {/* 嘴巴 */}
            <div className={`mouth ${expr.mouth}`}>
              <div className="mouth-left" />
              <div className="mouth-right" />
              <div className="mouth-center" />
            </div>
            
            {/* 眉毛 */}
            <div className={`brows ${expr.brow}`}>
              <div className="brow left-brow" />
              <div className="brow right-brow" />
            </div>
            
            {/* 腮红 */}
            <div className="blush left-blush" />
            <div className="blush right-blush" />
          </div>
          
          {/* 胡须 */}
          <div className="whiskers">
            <div className="whisker left" />
            <div className="whisker right" />
          </div>
        </div>
        
        {/* 手臂 - 抱臂姿势 */}
        <div className="arms" onClick={(e) => { e.stopPropagation(); onInteract('arm') }}>
          <div className="arm left-arm" />
          <div className="arm right-arm" />
        </div>
        
        {/* 脚脚 */}
        <div className="feet" onClick={(e) => { e.stopPropagation(); onInteract('foot') }}>
          <div className="foot left-foot" />
          <div className="foot right-foot" />
        </div>
        
        {/* 尾巴 */}
        <div className="tail" />
      </div>
      
      <style>{`
        .garfield-container {
          width: 140px;
          height: 160px;
          position: relative;
          cursor: pointer;
          transform-style: preserve-3d;
          perspective: 500px;
        }
        
        .garfield-body {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }
        
        .bounce {
          animation: garfieldBounce 0.5s ease;
        }
        
        @keyframes garfieldBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(-3deg); }
          50% { transform: translateY(-5px) rotate(3deg); }
          75% { transform: translateY(-10px) rotate(-1deg); }
        }
        
        /* 身体 */
        .body-main {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 80px;
          background: linear-gradient(180deg, #FF8C42 0%, #E67332 100%);
          border-radius: 50px 50px 40px 40px;
          box-shadow: 
            inset -5px -5px 15px rgba(0,0,0,0.2),
            0 10px 30px rgba(230, 115, 50, 0.4);
        }
        
        .belly {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 45px;
          background: linear-gradient(180deg, #FFE4C4 0%, #FFDAB3 100%);
          border-radius: 50%;
        }
        
        /* 头 */
        .garfield-head {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 110px;
          height: 90px;
          cursor: pointer;
        }
        
        .ear {
          position: absolute;
          top: -10px;
          width: 30px;
          height: 35px;
          background: linear-gradient(180deg, #FF8C42 0%, #E67332 100%);
          border-radius: 50% 50% 20% 20%;
        }
        
        .left-ear { left: 5px; transform: rotate(-20deg); }
        .right-ear { right: 5px; transform: rotate(20deg); }
        
        .ear::after {
          content: '';
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 18px;
          height: 20px;
          background: #FFB6C1;
          border-radius: 50%;
        }
        
        /* 脸 */
        .face {
          position: relative;
          width: 100%;
          height: 75px;
          background: linear-gradient(180deg, #FFA550 0%, #FF8C42 100%);
          border-radius: 55px 55px 45px 45px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }
        
        /* 眼睛 */
        .eyes {
          position: absolute;
          top: 20px;
          display: flex;
          justify-content: center;
          gap: 25px;
        }
        
        .eye {
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          position: relative;
          overflow: hidden;
        }
        
        .pupil {
          position: absolute;
          width: 12px;
          height: 14px;
          background: #2D2D2D;
          border-radius: 50%;
          top: 4px;
          left: 5px;
        }
        
        .pupil::after {
          content: '';
          position: absolute;
          width: 5px;
          height: 5px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
        }
        
        /* 眼睛状态 */
        .eyes.happy .eye {
          height: 8px;
          border-radius: 8px 8px 50% 50%;
        }
        
        .eyes.sleepy .eye {
          height: 4px;
          border-radius: 4px;
        }
        
        .eyes.bored .eye {
          height: 10px;
          transform: rotate(-10deg);
        }
        
        .eyes.angry .eye {
          transform: rotate(15deg);
        }
        
        /* 鼻子 */
        .nose {
          position: absolute;
          top: 45px;
          left: 50%;
          transform: translateX(-50%);
          width: 14px;
          height: 10px;
          background: #FF6B6B;
          border-radius: 50%;
        }
        
        /* 嘴巴 */
        .mouth {
          position: absolute;
          top: 52px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 15px;
        }
        
        .mouth-left, .mouth-right {
          position: absolute;
          width: 12px;
          height: 8px;
          border: 2px solid #8B4513;
          border-top: none;
          border-radius: 0 0 12px 12px;
          top: 5px;
        }
        
        .mouth-left { left: 0; }
        .mouth-right { right: 0; }
        
        .mouth-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 8px;
          background: #8B4513;
          border-radius: 2px;
        }
        
        .mouth.smile .mouth-left,
        .mouth.smile .mouth-right {
          height: 12px;
        }
        
        .mouth.angry .mouth-left,
        .mouth.angry .mouth-right {
          border-color: #8B4513;
          border-radius: 12px 12px 0 0;
          border-bottom: none;
          top: 0;
        }
        
        /* 眉毛 */
        .brows {
          position: absolute;
          top: 12px;
          width: 100%;
        }
        
        .brow {
          position: absolute;
          width: 18px;
          height: 3px;
          background: #8B4513;
          border-radius: 2px;
        }
        
        .left-brow { left: 20px; }
        .right-brow { right: 20px; }
        
        .brows.angry .left-brow { transform: rotate(20deg); top: 15px; }
        .brows.angry .right-brow { transform: rotate(-20deg); top: 15px; }
        .brows.raised .left-brow { transform: translateY(-3px); }
        .brows.raised .right-brow { transform: translateY(-3px); }
        
        /* 腮红 */
        .blush {
          position: absolute;
          top: 50px;
          width: 18px;
          height: 10px;
          background: rgba(255, 182, 193, 0.6);
          border-radius: 50%;
        }
        
        .left-blush { left: 8px; }
        .right-blush { right: 8px; }
        
        /* 胡须 */
        .whiskers {
          position: absolute;
          top: 55px;
          width: 100%;
        }
        
        .whisker {
          position: absolute;
          height: 2px;
          background: #8B4513;
          border-radius: 2px;
        }
        
        .whisker.left {
          left: -15px;
          width: 35px;
          top: 0;
        }
        
        .whisker.right {
          right: -15px;
          width: 35px;
          top: 0;
        }
        
        /* 手臂 - 抱臂姿势 */
        .arms {
          position: absolute;
          top: 60px;
          width: 100%;
          z-index: 10;
        }
        
        .arm {
          position: absolute;
          width: 25px;
          height: 40px;
          background: linear-gradient(180deg, #FF8C42 0%, #E67332 100%);
          border-radius: 20px;
        }
        
        .left-arm {
          left: -5px;
          transform: rotate(25deg);
          top: 10px;
        }
        
        .right-arm {
          right: -5px;
          transform: rotate(-25deg);
          top: 10px;
        }
        
        /* 脚 */
        .feet {
          position: absolute;
          bottom: 5px;
          width: 100%;
          display: flex;
          justify-content: space-around;
          padding: 0 15px;
        }
        
        .foot {
          width: 28px;
          height: 20px;
          background: linear-gradient(180deg, #FF8C42 0%, #E67332 100%);
          border-radius: 15px 15px 8px 8px;
        }
        
        /* 尾巴 */
        .tail {
          position: absolute;
          bottom: 40px;
          right: -10px;
          width: 40px;
          height: 15px;
          background: linear-gradient(90deg, #FF8C42 0%, #E67332 100%);
          border-radius: 10px;
          transform: rotate(-20deg);
          z-index: -1;
        }
      `}</style>
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
  const [clickedPart, setClickedPart] = useState<string | null>(null)
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
    setClickedPart(part)
    setIsInteracting(true)
    
    // 不同部位不同反馈
    let action: 'pet' | 'feed' | 'tap' = 'tap'
    let responseText = ''
    
    switch (part) {
      case 'head':
        responseText = '喵~ 摸头好舒服！'
        action = 'pet'
        break
      case 'body':
        responseText = '嘿嘿，痒痒~'
        action = 'tap'
        break
      case 'arm':
        responseText = '这是我的手臂！厉害吧！'
        action = 'feed'
        break
      case 'foot':
        responseText = '别挠我脚脚！哈哈！'
        action = 'pet'
        break
    }
    
    interact(action)
    setMessage(responseText)
    
    if (enabled) speak(responseText)
    
    setTimeout(() => {
      setIsInteracting(false)
      setClickedPart(null)
    }, 500)
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
        
        {/* 3D 加菲猫 */}
        <Garfield 
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
            onClick={() => {
              handlePartInteract('head')
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