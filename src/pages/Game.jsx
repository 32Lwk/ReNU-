import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import TypingGame from '../components/TypingGame'
import { ArrowLeft, Trophy, Target, Clock } from 'lucide-react'

const Game = () => {
  // すべてのHooksを最初に定義
  const [error, setError] = useState(null)
  const [selectedText, setSelectedText] = useState(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [gameStarted, setGameStarted] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [currentWPM, setCurrentWPM] = useState(0)
  const [currentAccuracy, setCurrentAccuracy] = useState(100) // 精度
  const [currentErrors, setCurrentErrors] = useState(0)       // ミス数
  const [lastWPM, setLastWPM] = useState(0)                  // 時間切れ直前のWPM

  const { texts, fetchTexts, endGame, nickname, debugInfo, submitRanking } = useGame()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // useEffect hooks
  useEffect(() => {
    const loadTexts = async () => {
      try {
        await fetchTexts()
      } catch (error) {
        console.error('テキスト読み込みエラー:', error)
        setError('テキストデータを読み込めませんでした。管理者に連絡してください。')
      }
    }
    loadTexts()
  }, [fetchTexts])

  useEffect(() => {
    const textId = searchParams.get('text')
    if (textId && texts.length > 0) {
      const text = texts.find(t => t.id === parseInt(textId))
      if (text) {
        setSelectedText(text)
        setSelectedDifficulty(text.difficulty)
        setGameStarted(true)
      }
    }
  }, [searchParams, texts])

  // イベントハンドラー
  const handleGameEnd = async (stats) => {
    // TypingGame から渡された最終結果を保存
    setGameResult(stats)
    
    // WPMを再計算して確実に表示
    // 時間経過による終了の場合は入力文字数をWPMとして表示
    let recalculatedWPM
    if (stats.charactersTyped > 0 && stats.timeElapsed > 0) {
      // 通常のWPM計算
      recalculatedWPM = stats.charactersTyped / (stats.timeElapsed / 60)
    } else if (stats.charactersTyped > 0) {
      // 時間経過による終了の場合、入力文字数をWPMとして表示
      recalculatedWPM = stats.charactersTyped
      console.log('Game.jsx - Time-based end: Using typed characters as WPM:', stats.charactersTyped)
    } else {
      recalculatedWPM = 0
    }
    const finalWPM = Math.round(recalculatedWPM * 100) / 100
    
    console.log('Game end - Original WPM:', stats.wpm, 'Recalculated WPM:', finalWPM)
    
    setCurrentWPM(finalWPM)          // ← 再計算されたWPMを反映
    setLastWPM(finalWPM)             // ← 時間切れ直前のWPMも更新
    setCurrentAccuracy(stats.accuracy)
    setCurrentErrors(stats.errors)
    
    // ランキング用の統計を更新
    const updatedStats = {
      ...stats,
      wpm: finalWPM
    }
    
    // ランキングを送信
    try {
      await submitRanking(updatedStats)
      console.log('ランキング送信完了')
    } catch (error) {
      console.error('ランキング送信エラー:', error)
    }
    
    endGame(updatedStats)
  }

  // ゲーム中リアルタイム更新を受け取る
  const handleProgressUpdate = (progress) => {
    console.log('Game.jsx received progress:', progress) // デバッグ用
    setCurrentWPM(progress.wpm)
    setCurrentAccuracy(progress.accuracy)
    setCurrentErrors(progress.errors)
  }

  // WPM更新ハンドラー
  const handleWPMUpdate = (wpm) => {
    setCurrentWPM(wpm)
    setLastWPM(wpm) // 時間切れ直前のWPMを保持
  }

  // 精度更新ハンドラー
  const handleAccuracyUpdate = (accuracy) => {
    setCurrentAccuracy(accuracy)
  }

  // ミス数更新ハンドラー
  const handleErrorsUpdate = (errors) => {
    setCurrentErrors(errors)
  }

  // WPMに基づいて難易度を決定
  const getDifficultyByWPM = (wpm) => {
    if (wpm < 20) return 'easy'
    if (wpm < 40) return 'medium'
    return 'hard'
  }

  const handleNextProblem = () => {
    if (texts.length > 0) {
      const difficulty = getDifficultyByWPM(currentWPM)
      const availableTexts = texts.filter(text => text.is_active && text.difficulty === difficulty)
      
      // 指定された難易度の問題がない場合は、すべての問題から選択
      const textsToUse = availableTexts.length > 0 ? availableTexts : texts.filter(text => text.is_active)
      
      if (textsToUse.length > 0) {
        const randomText = textsToUse[Math.floor(Math.random() * textsToUse.length)]
        setSelectedText(randomText)
        setSelectedDifficulty(randomText.difficulty)
      }
    }
  }

  const startNewGame = () => {
    setGameStarted(true)
    setGameResult(null)
    setCurrentWPM(0) // WPMをリセット
  }

  const backToSelection = () => {
    setGameStarted(false)
    setGameResult(null)
    setSelectedText(null)
  }

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    hard: 'bg-red-100 text-red-800 border-red-200'
  }

  // 条件分岐による早期リターン
  if (!nickname) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">ニックネームが必要です</h1>
        <p className="text-gray-600 mb-6">ゲームをプレイするにはニックネームを設定してください。</p>
        <button
          onClick={() => navigate('/settings')}
          className="btn-primary"
        >
          設定画面へ
        </button>
      </div>
    )
  }

  if (gameResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ゲーム終了！</h1>
            <p className="text-gray-600">お疲れ様でした！</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{gameResult.wpm}</div>
              <div className="text-sm text-gray-600">WPM</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {gameResult.accuracy}%
              </div>
              <div className="text-sm text-gray-600">精度</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(gameResult.timeElapsed)}s
              </div>
              <div className="text-sm text-gray-600">時間</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{gameResult.errors}</div>
              <div className="text-sm text-gray-600">ミス</div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button onClick={startNewGame} className="btn-primary">
              もう一度プレイ
            </button>
            <button onClick={backToSelection} className="btn-secondary">
              テキスト選択に戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            {debugInfo && (
              <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
                <h3 className="font-bold mb-2">デバッグ情報:</h3>
                <div>バックエンド状態: {debugInfo.backend_status}</div>
                <div>ファイルパス: {debugInfo.file_path}</div>
                <div>ファイル存在: {debugInfo.file_exists ? 'あり' : 'なし'}</div>
                <div>ファイルサイズ: {debugInfo.file_size} bytes</div>
                <div>読み込み可能: {debugInfo.file_readable ? 'はい' : 'いいえ'}</div>
                {debugInfo.error && <div className="text-red-600">エラー: {debugInfo.error}</div>}
              </div>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  if (texts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">テキストデータを読み込み中...</h1>
            <p className="text-gray-600 mb-4">しばらくお待ちください。</p>
            {debugInfo && (
              <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
                <h3 className="font-bold mb-2">デバッグ情報:</h3>
                <div>バックエンド状態: {debugInfo.backend_status}</div>
                <div>ファイルパス: {debugInfo.file_path}</div>
                <div>ファイル存在: {debugInfo.file_exists ? 'あり' : 'なし'}</div>
                <div>ファイルサイズ: {debugInfo.file_size} bytes</div>
                <div>読み込み可能: {debugInfo.file_readable ? 'はい' : 'いいえ'}</div>
                {debugInfo.error && <div className="text-red-600">エラー: {debugInfo.error}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!gameStarted) {
    // テキストが選択されていない場合、自動的にランダムなテキストを選択
    if (!selectedText) {
      const availableTexts = texts.filter(text => text.is_active)
      if (availableTexts.length === 0) {
        return (
          <div className="max-w-2xl mx-auto">
            <div className="card text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">テキストがありません。</h1>
              <p className="text-gray-600 mb-6">管理者に連絡してください。</p>
              <button onClick={() => navigate('/')} className="btn-primary">
                ホームに戻る
              </button>
            </div>
          </div>
        )
      }
      
      // WPMに基づいて難易度を決定してテキストを選択
      const difficulty = getDifficultyByWPM(currentWPM)
      const difficultyTexts = availableTexts.filter(text => text.difficulty === difficulty)
      const textsToUse = difficultyTexts.length > 0 ? difficultyTexts : availableTexts
      
      const randomText = textsToUse[Math.floor(Math.random() * textsToUse.length)]
      setSelectedText(randomText)
      setSelectedDifficulty(randomText.difficulty)
      setGameStarted(true)
      return null // 再レンダリングを待つ
    }

    return (
      <div className="max-w-4xl mx-auto">
        {/* 木枠デザイン */}
        <div className="bg-gradient-to-b from-amber-100 to-amber-200 border-8 border-amber-800 rounded-lg p-8">
          {/* 上部UI */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-amber-800 hover:text-amber-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>戻る</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-800" />
                <span className="text-amber-800 font-bold">時間: 0:00</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-amber-800" />
                <span className="text-amber-800 font-bold">WPM: {currentWPM}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-800" />
                <span className="text-amber-800 font-bold">精度: {currentAccuracy}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-amber-800 font-bold">ミス: {currentErrors}</span>
              </div>
            </div>
          </div>

          {/* 寿司の流れるレーン */}
          <div className="h-60 bg-gradient-to-r from-amber-200 to-amber-300 border-t-4 border-b-4 border-amber-600 overflow-hidden flex items-center mb-8 relative">
            {/* 寿司画像が流れる部分 */}
            <div className="absolute inset-0 flex items-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <img
                  key={index}
                  src={`/images/sushi/Re-kun${(index % 10) + 1}.png`}
                  alt={`寿司 ${index + 1}`}
                  className="h-40 w-40 rounded-full bg-white border-2 border-amber-400 shadow-md animate-sushi-move"
                  style={{
                    animationDelay: `${index * 0.5}s`,
                    animationDuration: '12s'
                  }}
                />
              ))}
            </div>
          </div>

          {/* 中央のタイピングエリア */}
          <div className="bg-white rounded-lg p-8 mb-6 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">選択されたテキスト</h2>
              <div className={`inline-block px-4 py-2 rounded-full border-2 ${difficultyColors[selectedText?.difficulty] || difficultyColors.medium}`}>
                {selectedText?.difficulty === 'easy' && '簡単'}
                {selectedText?.difficulty === 'medium' && '普通'}
                {selectedText?.difficulty === 'hard' && '難しい'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-xl text-gray-800 text-center leading-relaxed">
                {selectedText?.content}
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => setGameStarted(true)}
                className="bg-gradient-to-b from-orange-200 to-white border-2 border-amber-600 rounded-lg py-4 px-8 text-lg font-bold text-gray-800 hover:from-orange-300 hover:to-orange-100 transition-all duration-200 shadow-lg"
              >
                ゲーム開始
              </button>
            </div>
          </div>

          {/* 下部スコア表示 */}
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex justify-around text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">WPM</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">0%</div>
                <div className="text-sm text-gray-600">精度</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-sm text-gray-600">ミス</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ゲーム中
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-b from-amber-100 to-amber-200 border-8 border-amber-800 rounded-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={backToSelection}
            className="flex items-center space-x-2 text-amber-800 hover:text-amber-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>戻る</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-800" />
              <span className="text-amber-800 font-bold">時間: 0:00</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-amber-800" />
              <span className="text-amber-800 font-bold">コンボ: 0</span>
            </div>
          </div>
        </div>

        <div className="h-60 bg-gradient-to-r from-amber-200 to-amber-300 border-t-4 border-b-4 border-amber-600 overflow-hidden flex items-center mb-8 relative">
          <div className="absolute inset-0 flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <img
                key={index}
                src={`/images/sushi/Re-kun${(index % 10) + 1}.png`}
                alt={`寿司 ${index + 1}`}
                className="h-40 w-40 rounded-full bg-white border-2 border-amber-400 shadow-md animate-sushi-move"
                style={{
                  animationDelay: `${index * 0.5}s`,
                  animationDuration: '12s'
                }}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 mb-6 shadow-lg">
          <TypingGame
            text={selectedText}
            onGameEnd={handleGameEnd}
            onNextProblem={handleNextProblem}
            onWPMUpdate={handleWPMUpdate}
            onProgress={handleProgressUpdate}
            onAccuracyUpdate={handleAccuracyUpdate}
            onErrorsUpdate={handleErrorsUpdate}
          />
        </div>

        <div className="bg-white rounded-lg p-4 shadow-lg">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{currentWPM}</div>
              <div className="text-sm text-gray-600">WPM</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{currentAccuracy}%</div>
              <div className="text-sm text-gray-600">精度</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{currentErrors}</div>
              <div className="text-sm text-gray-600">ミス</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Game