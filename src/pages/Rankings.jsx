import React, { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import { Trophy, Medal, Target, Clock, Filter } from 'lucide-react'

const Rankings = () => {
  const { fetchRankings } = useGame()
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDateFilter, setSelectedDateFilter] = useState('all')
  const [limit, setLimit] = useState(50)

  useEffect(() => {
    loadRankings()
  }, [selectedDateFilter, limit])

  const loadRankings = async () => {
    setLoading(true)
    try {
      const data = await fetchRankings(selectedDateFilter, limit)
      setRankings(data)
    } catch (error) {
      console.error('ランキング読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (index) => {
    if (index === 0) return <Medal className="w-6 h-6 text-yellow-500" />
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />
    if (index === 2) return <Medal className="w-6 h-6 text-orange-500" />
    return <span className="text-lg font-bold text-gray-600">{index + 1}</span>
  }

  const getRankColor = (index) => {
    if (index === 0) return 'bg-yellow-50 border-yellow-200'
    if (index === 1) return 'bg-gray-50 border-gray-200'
    if (index === 2) return 'bg-orange-50 border-orange-200'
    return 'bg-white border-gray-200'
  }

  const dateFilterColors = {
    all: 'bg-blue-100 text-blue-800',
    today: 'bg-green-100 text-green-800',
    week: 'bg-yellow-100 text-yellow-800',
    month: 'bg-orange-100 text-orange-800'
  }

  const dateFilterLabels = {
    all: 'すべて',
    today: '今日',
    week: '過去1週間',
    month: '過去1ヶ月'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <span>ランキング</span>
        </h1>
        <p className="text-gray-600">他のプレイヤーと競ってランキングを上げよう！</p>
      </div>

      {/* フィルター */}
      <div className="card mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">フィルター:</span>
            
            <div className="flex space-x-2">
              {['all', 'today', 'week', 'month'].map((dateFilter) => (
                <button
                  key={dateFilter}
                  onClick={() => setSelectedDateFilter(dateFilter)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedDateFilter === dateFilter
                      ? dateFilterColors[dateFilter]
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dateFilterLabels[dateFilter]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">表示件数:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={10}>10件</option>
              <option value={25}>25件</option>
              <option value={50}>50件</option>
              <option value={100}>100件</option>
            </select>
          </div>
        </div>
      </div>

      {/* ランキング一覧 */}
      <div className="card">
        {rankings.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ランキングデータがありません</h3>
            <p className="text-gray-600">
              {selectedDateFilter === 'all' 
                ? 'まだ誰もゲームをプレイしていません。' 
                : `${dateFilterLabels[selectedDateFilter]}のランキングデータがありません。`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {rankings.map((ranking, index) => (
              <div
                key={ranking.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getRankColor(index)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(index)}
                    </div>
                    
                    <div>
                      <div className="font-bold text-gray-900 text-lg">
                        {ranking.nickname}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(ranking.created_at).toLocaleDateString('ja-JP')}</span>
                        </span>
                        {ranking.characters_typed > 0 && (
                          <span className="text-xs text-gray-500">
                            文字数: {ranking.characters_typed}
                          </span>
                        )}
                        {ranking.errors > 0 && (
                          <span className="text-xs text-red-500">
                            ミス: {ranking.errors}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {ranking.wpm} WPM
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round(ranking.accuracy)}% 精度
                    </div>
                  </div>
                </div>

                {/* トップ3の特別表示 */}
                {index < 3 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1 text-gray-600">
                          <Target className="w-4 h-4" />
                          <span>文字数: {ranking.characters_typed || 0}</span>
                        </span>
                        {ranking.time_elapsed > 0 && (
                          <span className="flex items-center space-x-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>時間: {Math.round(ranking.time_elapsed)}秒</span>
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500">
                        {index === 0 && '🥇 1位'}
                        {index === 1 && '🥈 2位'}
                        {index === 2 && '🥉 3位'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 統計情報 */}
      {rankings.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">
              {rankings.length}
            </div>
            <div className="text-sm text-gray-600">総プレイヤー数</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(rankings.reduce((sum, r) => sum + r.wpm, 0) / rankings.length)}
            </div>
            <div className="text-sm text-gray-600">平均WPM</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(rankings.reduce((sum, r) => sum + r.accuracy, 0) / rankings.length)}%
            </div>
            <div className="text-sm text-gray-600">平均精度</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Rankings
