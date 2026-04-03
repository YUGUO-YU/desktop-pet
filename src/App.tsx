import React from 'react'
import ReactDOM from 'react-dom/client'

// 简单的加菲猫 SVG
const GarfieldImage = () => (
  <svg viewBox="0 0 200 200" style={{width: '140px', height: '140px'}}>
    <defs>
      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FF9A5C"/>
        <stop offset="100%" stopColor="#E67332"/>
      </linearGradient>
    </defs>
    {/* 身体 */}
    <ellipse cx="100" cy="140" rx="55" ry="45" fill="url(#bodyGrad)"/>
    {/* 头 */}
    <circle cx="100" cy="70" r="50" fill="url(#bodyGrad)"/>
    {/* 耳朵 */}
    <circle cx="60" cy="35" r="15" fill="#FF8C42"/>
    <circle cx="140" cy="35" r="15" fill="#FF8C42"/>
    {/* 眼睛 */}
    <circle cx="80" cy="60" r="10" fill="white"/>
    <circle cx="120" cy="60" r="10" fill="white"/>
    <circle cx="80" cy="62" r="6" fill="#333"/>
    <circle cx="120" cy="62" r="6" fill="#333"/>
    {/* 鼻子 */}
    <ellipse cx="100" cy="75" rx="6" ry="4" fill="#FF6B6B"/>
    {/* 嘴巴 */}
    <path d="M90 82 Q100 90 110 82" stroke="#8B4513" strokeWidth="2" fill="none"/>
    {/* 腮红 */}
    <circle cx="55" cy="75" r="8" fill="#FFB6C1" opacity="0.5"/>
    <circle cx="145" cy="75" r="8" fill="#FFB6C1" opacity="0.5"/>
    {/* 手臂 */}
    <ellipse cx="45" cy="110" rx="12" ry="25" fill="#FF8C42" transform="rotate(20 45 110)"/>
    <ellipse cx="155" cy="110" rx="12" ry="25" fill="#FF8C42" transform="rotate(-20 155 110)"/>
    {/* 脚 */}
    <ellipse cx="75" cy="180" rx="12" ry="8" fill="#FF8C42"/>
    <ellipse cx="125" cy="180" rx="12" ry="8" fill="#FF8C42"/>
    {/* 尾巴 */}
    <path d="M150 160 Q180 150 175 130" stroke="#FF8C42" strokeWidth="10" fill="none" strokeLinecap="round"/>
  </svg>
)

function App() {
  const [message, setMessage] = React.useState('你好！我是加菲猫~')
  const [mood, setMood] = React.useState(3)

  const handleTouch = (part: string) => {
    const messages: Record<string, string> = {
      head: '喵~ 摸头好舒服！',
      body: '嘿嘿，痒痒~',
      arm: '这是我的手臂！',
      foot: '别挠我脚脚！哈哈！'
    }
    setMessage(messages[part] || '你好~')
    setMood(Math.min(5, mood + 1))
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.8)',
      borderRadius: '20px',
      padding: '10px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        width: '36px',
        height: '4px',
        background: 'rgba(0,0,0,0.15)',
        borderRadius: '2px',
        marginBottom: '10px',
        cursor: 'grab'
      }}/>
      
      <div onClick={() => handleTouch('body')} style={{cursor: 'pointer'}}>
        <GarfieldImage />
      </div>
      
      <div style={{
        background: 'white',
        padding: '8px 14px',
        borderRadius: '12px',
        marginTop: '10px',
        fontSize: '13px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {message}
      </div>
      
      <div style={{display: 'flex', gap: '4px', marginTop: '8px'}}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: i <= mood ? '#6366f1' : '#e5e7eb'
          }}/>
        ))}
      </div>
      
      <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
        <button onClick={() => handleTouch('head')} style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px'
        }}>🤚</button>
        <button onClick={() => {handleTouch('arm'); setMessage('好吃！谢谢你！')}} style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px'
        }}>🍪</button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App/>)