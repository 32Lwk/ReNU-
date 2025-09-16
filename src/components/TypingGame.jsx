import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useGame } from '../contexts/GameContext'

const TypingGame = ({ text, onGameEnd, onNextProblem, onWPMUpdate, onProgress, onAccuracyUpdate, onErrorsUpdate }) => {
  const { updateGameStats, endGame } = useGame()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [errors, setErrors] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10) // 10秒のタイマー
  const [totalTimeLeft, setTotalTimeLeft] = useState(60) // 1分の総時間
  const [currentSushi, setCurrentSushi] = useState('')
  const [sushiKey, setSushiKey] = useState(0) // 寿司のリセット用
  const [gameStats, setGameStats] = useState({
    wpm: 0,
    accuracy: 0,
    timeElapsed: 0,
    charactersTyped: 0,
  })
  
  const inputRef = useRef(null)
  const intervalRef = useRef(null)
  const timerRef = useRef(null)
  const totalTimerRef = useRef(null)
  const charactersTypedRef = useRef(0) // リアルタイムのタイプ文字数を追跡
  const errorsRef = useRef(0) // リアルタイムのエラー数を追跡

  // 寿司画像のリスト
  const sushiImages = [
    'JU_Re-kun_3.png',
    'Re-kun1-2.png',
    'Re-kun1.png',
    'Re-kun10.png',
    'Re-kun11.png',
    'Re-kun13.png',
    'Re-kun14.png',
    'Re-kun15.png',
    'Re-kun16.png',
    'Re-kun17.png',
    'Re-kun18.png',
    'Re-kun19.png',
    'Re-kun2.png',
    'Re-kun21-3.jpg',
    'Re-kun21.png',
    'Re-kun22.png',
    'Re-kun23.png',
    'Re-kun24.png',
    'Re-kun25.png',
    'Re-kun26.png',
    'Re-kun27.png',
    'Re-kun28.png',
    'Re-kun29.png',
    'Re-kun3.png',
    'Re-kun32.png',
    'Re-kun33.png',
    'Re-kun34.png',
    'Re-kun35.png',
    'Re-kun36.png',
    'Re-kun37.png',
    'Re-kun38.png',
    'Re-kun39.png',
    'Re-kun4.png',
    'Re-kun40.png',
    'Re-kun41.png',
    'Re-kun5.png',
    'Re-kun6.png',
    'Re-kun7.png',
    'Re-kun8.png',
    'Re-kun9.png',
    'かのゆかリーくん.png',
    'きたむらリーくん.png',
    'こばゆうリーくん.png',
    'ジョニーリーくん.png',
    'ベビーリーくん.png',
    '小原リーくん.png',
    '恒川リーくん.png',
    '植松リー太郎.png'
  ]

  // ランダムな寿司を選択
  const getRandomSushi = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * sushiImages.length)
    return sushiImages[randomIndex]
  }, [])

  // ゲーム終了
  const finishGame = useCallback(() => {
    setIsPlaying(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    if (totalTimerRef.current) clearInterval(totalTimerRef.current)

    // ✅ ref を使って最新の入力数とエラー数を取得
    const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0
    const typed = charactersTypedRef.current
    const err = errorsRef.current

    console.log('Game finish - Raw data:', { elapsed, typed, err, startTime })

    // 👉 時間経過による終了の場合は入力文字数をWPMとして表示
    // 通常のWPM計算: 入力文字数 ÷ 経過時間(分)
    // 時間経過終了の場合: 入力文字数をそのままWPMとして表示
    let finalWPM
    if (typed > 0 && elapsed > 0) {
      // 通常のWPM計算
      finalWPM = typed / (elapsed / 60)
    } else if (typed > 0) {
      // 時間経過による終了の場合、入力文字数をWPMとして表示
      finalWPM = typed
      console.log('Time-based end: Using typed characters as WPM:', typed)
    } else {
      finalWPM = 0
    }

    const totalInputs = typed + err
    const finalAccuracy = totalInputs > 0 
      ? (typed / totalInputs) * 100 
      : 100

    const finalStats = {
      wpm: Math.round(finalWPM * 100) / 100,
      accuracy: Math.round(finalAccuracy * 100) / 100,
      errors: err,
      timeElapsed: elapsed,
      charactersTyped: typed
    }

    console.log('Game finished with stats:', finalStats)
    console.log('WPM calculation details:', {
      charactersTyped: typed,
      timeElapsed: elapsed,
      timeInMinutes: elapsed / 60,
      calculatedWPM: finalWPM,
      roundedWPM: Math.round(finalWPM * 100) / 100,
      isTimeBasedEnd: elapsed === 0 || typed > 0 && elapsed === 0
    })

    // ✅ state を更新して UI に即反映
    setGameStats(finalStats)

    // ✅ 親に通知（即座に実行）
    console.log('Final stats being sent:', finalStats) // デバッグ用
    if (onWPMUpdate) {
      onWPMUpdate(finalStats.wpm)
    }
    if (onProgress) {
      onProgress({
        wpm: finalStats.wpm,
        accuracy: finalStats.accuracy,
        errors: finalStats.errors
      })
    }
    onGameEnd(finalStats)
  }, [onGameEnd, onWPMUpdate, onProgress, onAccuracyUpdate, onErrorsUpdate, startTime])


  // 次の問題へ
  const nextProblem = useCallback(() => {
    // タイマーをリセット
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    // 新しい寿司を選択
    setCurrentSushi(getRandomSushi())
    
    // 寿司のキーを更新してアニメーションをリセット
    setSushiKey(prev => prev + 1)
    
    // 問題をリセット
    setCurrentIndex(0)
    setUserInput('')
    setTimeLeft(10)
    
    // 親コンポーネントに次の問題を要求
    if (onNextProblem) {
      onNextProblem()
    }
    
    // 新しい10秒タイマーを開始
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 時間切れ - 次の問題へ
          nextProblem()
          return 10
        }
        return prev - 1
      })
    }, 1000)
  }, [onNextProblem, getRandomSushi])

  // ゲーム開始
  const startGame = useCallback(() => {
    setStartTime(Date.now())
    setIsPlaying(true)
    setCurrentIndex(0)
    setUserInput('')
    setErrors(0)
    setTimeLeft(10)
    setTotalTimeLeft(60)
    setCurrentSushi(getRandomSushi())
    setSushiKey(0) // 寿司のキーを初期化
    charactersTypedRef.current = 0 // refをリセット
    errorsRef.current = 0 // refをリセット
    inputRef.current?.focus()

    // 10秒タイマー開始
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 時間切れ - 次の問題へ
          nextProblem()
          return 10
        }
        return prev - 1
      })
    }, 1000)

    // 1分の総タイマー開始
    totalTimerRef.current = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (prev <= 1) {
          // 総時間切れ - ゲーム終了（即座に実行）
          console.log('Time limit reached, finishing game...')
          finishGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [nextProblem, finishGame, getRandomSushi])

  // タイマー更新
  useEffect(() => {
    if (isPlaying && startTime) {
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000
        setGameStats(prev => {
          // 👉 WPM = 入力文字数 ÷ 経過時間(分)
          const wpm = prev.charactersTyped > 0 
            ? prev.charactersTyped / (elapsed / 60)
            : 0
          const roundedWPM = Math.round(wpm * 100) / 100
          
          // 親コンポーネントにWPMを通知
          if (onWPMUpdate) {
            onWPMUpdate(roundedWPM)
          }
          
          // 精度とミス数も通知
          const totalInputs = prev.charactersTyped + errors
          const accuracy = totalInputs > 0 
            ? (prev.charactersTyped / totalInputs) * 100
            : 100
          
          if (onAccuracyUpdate) {
            onAccuracyUpdate(Math.round(accuracy * 100) / 100)
          }
          if (onErrorsUpdate) {
            onErrorsUpdate(errors)
          }
          
          return {
            ...prev,
            timeElapsed: elapsed,
            wpm: roundedWPM,
            accuracy: Math.round(accuracy * 100) / 100
          }
        })
      }, 100)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, startTime, onWPMUpdate, onAccuracyUpdate, onErrorsUpdate])

  // リアルタイム統計更新
  useEffect(() => {
    if (onProgress && isPlaying) {
      const totalInputs = gameStats.charactersTyped + errors
      const accuracy = totalInputs > 0 
        ? (gameStats.charactersTyped / totalInputs) * 100
        : 100
      
      const progressData = {
        wpm: gameStats.wpm,
        accuracy: Math.round(accuracy * 100) / 100,
        errors: errors,
      }
      
      console.log('useEffect progress update:', progressData) // デバッグ用
      onProgress(progressData)
    }
  }, [gameStats.wpm, gameStats.charactersTyped, errors, onProgress, isPlaying])

  // 入力処理
  const handleInput = (e) => {
    if (!isPlaying) return

    const input = e.target.value
    const romajiText = text.romaji || ''
    const expectedChar = romajiText[currentIndex]

    if (input === romajiText.substring(0, currentIndex + 1)) {
      setCurrentIndex(prev => prev + 1)
      setUserInput(input)
      setGameStats(prev => {
        const newCount = prev.charactersTyped + 1
        charactersTypedRef.current = newCount // refも更新
        console.log('Characters typed updated:', newCount) // デバッグ用
        
        // 精度も更新
        const totalInputs = newCount + errors
        const accuracy = totalInputs > 0 
          ? (newCount / totalInputs) * 100
          : 100
        
        return {
          ...prev,
          charactersTyped: newCount,
          accuracy: Math.round(accuracy * 100) / 100
        }
      })
      
      // ゲーム終了チェック（ローマ字の文字数で判定）
      if (currentIndex + 1 >= romajiText.length) {
        // 問題完了 - 次の問題へ
        nextProblem()
      }
    } else if (input.length > currentIndex) {
      // 間違った入力
      setErrors(prev => {
        const newErrorCount = prev + 1
        errorsRef.current = newErrorCount // refも更新
        console.log('Error count:', newErrorCount) // デバッグ用
        
        // gameStatsの精度も更新
        setGameStats(prevStats => {
          const totalInputs = prevStats.charactersTyped + newErrorCount
          const accuracy = totalInputs > 0 
            ? (prevStats.charactersTyped / totalInputs) * 100
            : 100
          
          return {
            ...prevStats,
            accuracy: Math.round(accuracy * 100) / 100
          }
        })
        
        return newErrorCount
      })
      setUserInput(input.substring(0, currentIndex))
    }
    
    // リアルタイム統計更新を即座に実行
    if (onProgress && startTime) {
      const currentTyped = charactersTypedRef.current
      const currentErrors = errorsRef.current
      const totalInputs = currentTyped + currentErrors
      const accuracy = totalInputs > 0 
        ? (currentTyped / totalInputs) * 100
        : 100
      
      // リアルタイムWPM計算
      const elapsed = (Date.now() - startTime) / 1000
      const currentWPM = (currentTyped > 0 && elapsed > 0)
        ? currentTyped / (elapsed / 60)
        : 0
      
      const progressData = {
        wpm: Math.round(currentWPM * 100) / 100,
        accuracy: Math.round(accuracy * 100) / 100,
        errors: currentErrors,
      }
      
      console.log('Real-time progress update:', progressData) // デバッグ用
      onProgress(progressData)
    }
  }

  // キー入力処理（変換問題を修正）
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      console.log('Escape key pressed, finishing game...')
      finishGame()
    }
    
    // 日本語入力の変換を無効化
    if (e.key === 'Enter' && e.target.value !== text.content) {
      e.preventDefault()
    }
  }

  // 日本語入力の変換を無効化
  const handleCompositionStart = (e) => {
    e.preventDefault()
  }

  const handleCompositionEnd = (e) => {
    e.preventDefault()
  }


  // 文字の状態を取得
  const getCharStatus = (index) => {
    if (index < currentIndex) return 'correct'
    if (index === currentIndex) return 'current'
    return 'pending'
  }

  // 文字をレンダリング（ローマ字ベース）
  const renderText = () => {
    const romajiText = text.romaji || ''
    return romajiText.split('').map((char, index) => {
      const status = getCharStatus(index)
      return (
        <span
          key={index}
          className={`typing-char ${status} ${
            char === ' ' ? 'bg-gray-200' : ''
          }`}
        >
          {char}
        </span>
      )
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 画像を参考にしたUI */}
      <div className="bg-gradient-to-b from-green-100 to-green-200 border-8 border-amber-800 rounded-lg p-8">
        {/* 上部の統計情報 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{gameStats.wpm}</div>
              <div className="text-sm text-gray-600">WPM</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(gameStats.accuracy * 100) / 100}%
              </div>
              <div className="text-sm text-gray-600">精度</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errors}</div>
              <div className="text-sm text-gray-600">ミス</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-800">{timeLeft}</div>
              <div className="text-sm text-gray-600">問題時間</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{totalTimeLeft}</div>
              <div className="text-sm text-gray-600">総時間</div>
            </div>
          </div>
        </div>

         {/* 寿司の流れるレーン */}
         <div className="h-32 bg-gradient-to-r from-amber-200 to-amber-300 border-t-4 border-b-4 border-amber-600 overflow-hidden flex items-center mb-8 relative">
           {isPlaying && currentSushi && (
             <img
               key={sushiKey}
               src={`/images/sushi/${currentSushi}`}
               alt="流れる寿司"
               className="h-24 w-24 rounded-full bg-white border-2 border-amber-400 shadow-md absolute animate-sushi-flow top-4"
             />
           )}
         </div>

        {/* 中央のタイピングエリア */}
        <div className="bg-white rounded-lg p-8 mb-6 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{text.title}</h2>
             <div className="text-sm text-gray-600">
               文字数: {(text.romaji || '').length}
             </div>
          </div>
          
           {/* タイピングテキスト表示 */}
           <div className="bg-gray-50 p-6 rounded-lg mb-6">
             {/* ローマ字表示（上） */}
             <div className="text-2xl text-gray-800 text-center leading-relaxed mb-4">
               {renderText()}
             </div>
             {/* 日本語表示（下） */}
             <div className="text-lg text-gray-600 text-center">
               {text.content}
             </div>
           </div>

          {/* 入力フィールド */}
          <div className="flex items-center space-x-4">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder={isPlaying ? "タイピングを開始してください..." : "ゲームを開始してください"}
              disabled={!isPlaying}
              className="flex-1 p-4 border-2 border-gray-300 rounded-lg text-lg focus:border-amber-500 focus:outline-none"
              autoComplete="off"
              spellCheck="false"
            />
            
            <div className="flex space-x-2">
              {!isPlaying ? (
                <button
                  onClick={startGame}
                  className="bg-gradient-to-b from-orange-200 to-white border-2 border-amber-600 rounded-lg py-4 px-8 text-lg font-bold text-gray-800 hover:from-orange-300 hover:to-orange-100 transition-all duration-200 shadow-lg"
                >
                  開始
                </button>
              ) : (
                <button
                  onClick={() => {
                    console.log('End button clicked, finishing game...')
                    finishGame()
                  }}
                  className="bg-gradient-to-b from-gray-200 to-white border-2 border-gray-600 rounded-lg py-4 px-8 text-lg font-bold text-gray-800 hover:from-gray-300 hover:to-gray-100 transition-all duration-200 shadow-lg"
                >
                  終了
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 下部のスコア表示 */}
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{gameStats.wpm}</div>
              <div className="text-sm text-gray-600">WPM</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(gameStats.accuracy * 100) / 100}%
              </div>
              <div className="text-sm text-gray-600">精度</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{errors}</div>
              <div className="text-sm text-gray-600">ミス</div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS アニメーション */}
      <style>{`
        @keyframes sushi-flow {
          0% { 
            left: -100px; 
            transform: translateX(0);
          }
          100% { 
            left: 100%; 
            transform: translateX(0);
          }
        }
        .animate-sushi-flow {
          animation: sushi-flow 5s linear forwards;
        }
        .typing-char {
          display: inline-block;
          padding: 2px 4px;
          margin: 0 1px;
          border-radius: 3px;
          transition: all 0.2s ease;
        }
        .typing-char.correct {
          background-color: #10b981;
          color: white;
        }
        .typing-char.current {
          background-color: #f59e0b;
          color: white;
          animation: blink 1s infinite;
        }
        .typing-char.pending {
          background-color: transparent;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default TypingGame