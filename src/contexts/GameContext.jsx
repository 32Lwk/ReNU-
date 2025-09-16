import React, { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'

const GameContext = createContext()

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

export const GameProvider = ({ children }) => {
  const [texts, setTexts] = useState([])
  const [currentText, setCurrentText] = useState(null)
  const [gameState, setGameState] = useState('idle') // idle, playing, finished
  const [gameStats, setGameStats] = useState({
    wpm: 0,
    accuracy: 0,
    timeElapsed: 0,
    charactersTyped: 0,
    errors: 0,
  })
  const [rankings, setRankings] = useState([])
  const [personalRankings, setPersonalRankings] = useState([])
  const [debugInfo, setDebugInfo] = useState(null)
  const [nickname, setNickname] = useState(() => {
    // ローカルストレージからニックネームを読み込み
    return localStorage.getItem('renu-typing-nickname') || ''
  })

  // API設定
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // デバッグ情報を取得
  const fetchDebugInfo = useCallback(async () => {
    try {
      console.log('デバッグ情報取得開始...')
      const response = await api.get('/debug/status')
      console.log('デバッグ情報:', response.data)
      setDebugInfo(response.data)
      return response.data
    } catch (error) {
      console.error('デバッグ情報取得エラー:', error)
      setDebugInfo({ error: error.message })
      return null
    }
  }, [api])

  // テキストコンテンツを取得
  const fetchTexts = useCallback(async () => {
    try {
      console.log('=== テキスト取得開始 ===')
      
      // まずデバッグ情報を取得
      const debugInfo = await fetchDebugInfo()
      if (debugInfo) {
        console.log('デバッグ情報:', debugInfo)
        
        if (debugInfo.texts_file.error) {
          console.error('ファイルエラー:', debugInfo.texts_file.error)
        }
        
        if (debugInfo.texts_data.error) {
          console.error('データエラー:', debugInfo.texts_data.error)
        }
      }
      
      console.log('テキスト取得API呼び出し...')
      const response = await api.get('/game/texts')
      console.log('APIレスポンス:', response)
      console.log('テキスト取得成功:', response.data.length, '件')
      
      // テキストデータの詳細をログ出力
      if (response.data && response.data.length > 0) {
        const easyCount = response.data.filter(t => t.difficulty === 'easy').length
        const mediumCount = response.data.filter(t => t.difficulty === 'medium').length
        const hardCount = response.data.filter(t => t.difficulty === 'hard').length
        console.log(`難易度別統計 - Easy: ${easyCount}, Medium: ${mediumCount}, Hard: ${hardCount}`)
        console.log('サンプルテキスト:', response.data.slice(0, 3))
      }
      
      setTexts(response.data)
      console.log('=== テキスト取得完了 ===')
      return response.data
    } catch (error) {
      console.error('=== テキスト取得エラー ===')
      console.error('エラーオブジェクト:', error)
      console.error('エラーメッセージ:', error.message)
      console.error('エラーレスポンス:', error.response)
      console.error('エラーレスポンスデータ:', error.response?.data)
      console.error('エラーレスポンスステータス:', error.response?.status)
      console.error('エラーレスポンスヘッダー:', error.response?.headers)
      console.error('リクエスト設定:', error.config)
      
      setTexts([])
      return []
    }
  }, [api, fetchDebugInfo])

  // ランキングを取得
  const fetchRankings = useCallback(async (dateFilter = "all", limit = 10) => {
    try {
      const params = new URLSearchParams()
      if (dateFilter && dateFilter !== "all") {
        params.append('date_filter', dateFilter)
      }
      params.append('limit', limit.toString())
      
      const response = await api.get(`/rankings?${params}`)
      setRankings(response.data)
      return response.data
    } catch (error) {
      console.error('ランキング取得エラー:', error)
      return []
    }
  }, [api])


  // ゲーム開始
  const startGame = useCallback((textId, difficulty) => {
    setCurrentText(texts.find(t => t.id === textId))
    setGameState('playing')
    setGameStats({
      wpm: 0,
      accuracy: 0,
      timeElapsed: 0,
      charactersTyped: 0,
      errors: 0,
    })
  }, [texts])

  // ランキング送信
  const submitRanking = useCallback(async (stats) => {
    try {
      // データ検証
      if (!nickname || !stats) {
        console.error('ランキング送信エラー: ニックネームまたは統計データが不足')
        throw new Error('ニックネームまたは統計データが不足しています')
      }

      const rankingData = {
        nickname: nickname,
        wpm: stats.wpm || 0,
        accuracy: stats.accuracy || 0,
        errors: stats.errors || 0,
        timeElapsed: stats.timeElapsed || 0,
        charactersTyped: stats.charactersTyped || 0,
        difficulty: 'medium', // デフォルト難易度
        timestamp: new Date().toISOString()
      }
      
      console.log('=== ランキング送信開始 ===')
      console.log('送信データ:', rankingData)
      console.log('API URL:', '/api/rankings')
      
      const response = await api.post('/rankings', rankingData)
      console.log('ランキング送信成功:', response.data)
      
      // ランキングを再取得
      console.log('ランキング再取得中...')
      await fetchRankings()
      console.log('=== ランキング送信完了 ===')
      
      return response.data
    } catch (error) {
      console.error('=== ランキング送信エラー ===')
      console.error('エラーオブジェクト:', error)
      console.error('エラーメッセージ:', error.message)
      console.error('エラーレスポンス:', error.response)
      console.error('エラーレスポンスデータ:', error.response?.data)
      console.error('エラーレスポンスステータス:', error.response?.status)
      console.error('リクエスト設定:', error.config)
      throw error
    }
  }, [nickname, api, fetchRankings])

  // ゲーム終了
  const endGame = useCallback((finalStats) => {
    setGameState('finished')
    setGameStats(finalStats)
  }, [])

  // ゲームリセット
  const resetGame = useCallback(() => {
    setGameState('idle')
    setCurrentText(null)
    setGameStats({
      wpm: 0,
      accuracy: 0,
      timeElapsed: 0,
      charactersTyped: 0,
      errors: 0,
    })
  }, [])

  // ゲーム統計更新
  const updateGameStats = useCallback((newStats) => {
    setGameStats(prev => ({ ...prev, ...newStats }))
  }, [])

  // 個人ランキング取得
  const fetchPersonalRankings = useCallback(async () => {
    try {
      const response = await api.get(`/rankings/personal/${nickname}`)
      setPersonalRankings(response.data)
      return response.data
    } catch (error) {
      console.error('個人ランキング取得エラー:', error)
      setPersonalRankings([])
      return []
    }
  }, [nickname, api])

  const value = {
    texts,
    currentText,
    gameState,
    gameStats,
    rankings,
    personalRankings,
    nickname,
    setNickname,
    debugInfo,
    fetchTexts,
    fetchRankings,
    fetchPersonalRankings,
    fetchDebugInfo,
    submitRanking,
    startGame,
    endGame,
    resetGame,
    updateGameStats,
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}
