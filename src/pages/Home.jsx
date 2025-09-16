import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { Settings } from 'lucide-react'

const Home = () => {
  const { nickname, setNickname } = useGame()
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [tempNickname, setTempNickname] = useState('')
  const [sushiImages, setSushiImages] = useState([])
  const [sushiList, setSushiList] = useState([])

  // 寿司画像リストを準備
  useEffect(() => {
    const images = []
    for (let i = 1; i <= 41; i++) {
      images.push(`/images/sushi/Re-kun${i}.png`)
    }
    images.push('/images/sushi/JU_Re-kun_3.png')
    images.push('/images/sushi/Re-kun1-2.png')
    images.push('/images/sushi/Re-kun21-3.jpg')
    images.push('/images/sushi/かのゆかリーくん.png')
    images.push('/images/sushi/きたむらリーくん.png')
    images.push('/images/sushi/こばゆうリーくん.png')
    images.push('/images/sushi/ジョニーリーくん.png')
    images.push('/images/sushi/ベビーリーくん.png')
    images.push('/images/sushi/小原リーくん.png')
    images.push('/images/sushi/恒川リーくん.png')
    images.push('/images/sushi/植松リー太郎.png')

    console.log('寿司画像リスト:', images.length, '個の画像を読み込み')
    setSushiImages(images)
  }, [])

  // 一定間隔で寿司を追加（画像1つ分の間隔）
  useEffect(() => {
    if (sushiImages.length === 0) return

    const interval = setInterval(() => {
      const random = sushiImages[Math.floor(Math.random() * sushiImages.length)]
      setSushiList((prev) => [...prev, { id: Date.now(), src: random }])
    }, 3000) // 3秒間隔（画像1つ分の間隔）

    return () => clearInterval(interval)
  }, [sushiImages])

  // ニックネーム関連
  const handleStartGame = () => {
    if (!nickname) {
      setShowNicknameModal(true)
    } else {
      window.location.href = '/game'
    }
  }

  const handleNicknameSubmit = () => {
    if (tempNickname.trim()) {
      setNickname(tempNickname.trim())
      localStorage.setItem('renu-typing-nickname', tempNickname.trim())
      setShowNicknameModal(false)
      setTempNickname('')
      window.location.href = '/game'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 relative overflow-hidden">
      {/* 木枠 */}
      <div className="absolute inset-4 border-8 border-amber-800 rounded-lg pointer-events-none"></div>

      {/* 回転寿司レーン */}
      <div className="absolute top-1/2 left-0 w-full h-60 bg-gradient-to-r from-amber-200 to-amber-300 border-t-4 border-b-4 border-amber-600 overflow-hidden flex items-center"
           style={{ transform: 'translateY(-50%)' }}>
        {/* レーンの装飾 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
        
        {sushiList.map((sushi) => (
          <img
            key={sushi.id}
            src={sushi.src}
            alt="寿司"
            className="absolute h-40 w-40 rounded-full bg-white border-2 border-amber-400 shadow-md animate-sushi-move object-contain p-4"
            onError={(e) => {
              console.log('画像読み込みエラー:', sushi.src)
              e.target.style.display = 'none'
            }}
            onAnimationEnd={() =>
              setSushiList((prev) => prev.filter((item) => item.id !== sushi.id))
            }
          />
        ))}
      </div>

      {/* メインUI */}
      <div className="relative z-20 h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-black mb-4" style={{ fontFamily: 'serif' }}>
            ReNU打
          </h1>
          <div className="text-lg text-gray-600">Made by ReNU</div>
        </div>

        <div className="flex flex-col space-y-4 w-full max-w-xs">
          <button
            onClick={handleStartGame}
            className="bg-gradient-to-b from-orange-200 to-white border-2 border-amber-600 rounded-lg py-4 px-8 text-lg font-bold text-gray-800 hover:from-orange-300 hover:to-orange-100 transition-all duration-200 shadow-lg"
          >
            スタート
          </button>
          <Link 
            to="/how-to-play" 
            className="bg-gradient-to-b from-orange-200 to-white border-2 border-amber-600 rounded-lg py-4 px-8 text-lg font-bold text-gray-800 hover:from-orange-300 hover:to-orange-100 transition-all duration-200 shadow-lg text-center"
          >
            遊び方
          </Link>
          <Link 
            to="/settings" 
            className="bg-gradient-to-b from-orange-200 to-white border-2 border-amber-600 rounded-lg py-4 px-8 text-lg font-bold text-gray-800 hover:from-orange-300 hover:to-orange-100 transition-all duration-200 shadow-lg text-center flex items-center justify-center space-x-2"
          >
            <Settings className="w-5 h-5" />
            <span>設定</span>
          </Link>
        </div>
      </div>

      {/* ニックネーム入力モーダル */}
      {showNicknameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">ニックネームを入力</h3>
            <p className="text-gray-600 mb-6 text-center">
              ランキングに表示されるニックネームを入力してください。
            </p>
            <input
              type="text"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              placeholder="ニックネームを入力"
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-amber-500 focus:outline-none transition-colors duration-200 mb-6"
              maxLength={20}
              onKeyPress={(e) => e.key === 'Enter' && handleNicknameSubmit()}
            />
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowNicknameModal(false)} 
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                キャンセル
              </button>
              <button 
                onClick={handleNicknameSubmit} 
                disabled={!tempNickname.trim()} 
                className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                開始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS アニメーション */}
      <style>{`
        @keyframes sushi-move {
          0%   { left: -200px; }
          100% { left: 110%; }
        }
        .animate-sushi-move {
          animation: sushi-move 12s linear forwards;
        }
      `}</style>
    </div>
  )
}

export default Home