import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Settings, Plus, Edit, Trash2, Eye, EyeOff, Save, X, Lock, Trophy, RotateCcw, AlertTriangle } from 'lucide-react'

const Admin = () => {
  const [adminPassword, setAdminPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('texts')
  const [texts, setTexts] = useState([])
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingText, setEditingText] = useState(null)
  const [editingRanking, setEditingRanking] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showRankingEditForm, setShowRankingEditForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    difficulty: 'medium',
    is_active: true
  })
  const [rankingFormData, setRankingFormData] = useState({
    nickname: '',
    wpm: 0,
    accuracy: 0,
    errors: 0,
    time_elapsed: 0,
    characters_typed: 0,
    difficulty: 'medium'
  })

  // API設定
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadTexts()
      if (activeTab === 'rankings') {
        loadRankings()
      }
    }
  }, [isAuthenticated, activeTab])

  const handleLogin = async () => {
    try {
      console.log('ログイン試行開始')
      console.log('入力パスワード:', adminPassword)
      console.log('API URL:', `/admin/texts?password=${encodeURIComponent(adminPassword)}`)
      
      // パスワードで認証を試行
      const response = await api.get(`/admin/texts?password=${encodeURIComponent(adminPassword)}`)
      console.log('API レスポンス:', response)
      setIsAuthenticated(true)
      setTexts(response.data)
      console.log('認証成功:', response.data)
    } catch (error) {
      console.error('認証エラー詳細:', error)
      console.error('エラーレスポンス:', error.response)
      console.log('使用したパスワード:', adminPassword)
      alert(`パスワードが正しくありません。デフォルトパスワード: admin123\nエラー: ${error.message}`)
    }
  }

  const loadTexts = async () => {
    try {
      const response = await api.get(`/admin/texts?password=${encodeURIComponent(adminPassword)}`)
      setTexts(response.data)
    } catch (error) {
      console.error('テキスト読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRankings = async () => {
    try {
      const response = await api.get(`/admin/rankings?password=${encodeURIComponent(adminPassword)}`)
      setRankings(response.data)
    } catch (error) {
      console.error('ランキング読み込みエラー:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingText) {
        await api.put(`/admin/texts/${editingText.id}?password=${encodeURIComponent(adminPassword)}`, formData)
      } else {
        await api.post(`/admin/texts?password=${encodeURIComponent(adminPassword)}`, formData)
      }
      
      await loadTexts()
      resetForm()
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('このテキストを削除しますか？')) return
    
    try {
      await api.delete(`/admin/texts/${id}?password=${encodeURIComponent(adminPassword)}`)
      await loadTexts()
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      difficulty: 'medium',
      is_active: true
    })
    setEditingText(null)
    setShowAddForm(false)
  }

  const startEdit = (text) => {
    setFormData({
      title: text.title,
      content: text.content,
      difficulty: text.difficulty,
      is_active: text.is_active
    })
    setEditingText(text)
    setShowAddForm(true)
  }

  const startEditRanking = (ranking) => {
    setRankingFormData({
      nickname: ranking.nickname,
      wpm: ranking.wpm,
      accuracy: ranking.accuracy,
      errors: ranking.errors,
      time_elapsed: ranking.time_elapsed,
      characters_typed: ranking.characters_typed,
      difficulty: ranking.difficulty
    })
    setEditingRanking(ranking)
    setShowRankingEditForm(true)
  }

  const handleRankingSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/admin/rankings/${editingRanking.id}?password=${encodeURIComponent(adminPassword)}`, rankingFormData)
      await loadRankings()
      resetRankingForm()
    } catch (error) {
      console.error('ランキング更新エラー:', error)
      alert('ランキングの更新に失敗しました')
    }
  }

  const handleDeleteRanking = async (id) => {
    if (!confirm('このランキングを削除しますか？')) return
    
    try {
      await api.delete(`/admin/rankings/${id}?password=${encodeURIComponent(adminPassword)}`)
      await loadRankings()
    } catch (error) {
      console.error('ランキング削除エラー:', error)
      alert('ランキングの削除に失敗しました')
    }
  }

  const handleResetAllRankings = async () => {
    if (!confirm('すべてのランキングをリセットしますか？この操作は取り消せません。')) return
    
    try {
      await api.delete(`/admin/rankings?password=${encodeURIComponent(adminPassword)}`)
      await loadRankings()
      alert('すべてのランキングがリセットされました')
    } catch (error) {
      console.error('ランキングリセットエラー:', error)
      alert('ランキングのリセットに失敗しました')
    }
  }

  const resetRankingForm = () => {
    setRankingFormData({
      nickname: '',
      wpm: 0,
      accuracy: 0,
      errors: 0,
      time_elapsed: 0,
      characters_typed: 0,
      difficulty: 'medium'
    })
    setEditingRanking(null)
    setShowRankingEditForm(false)
  }

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  }

  const difficultyLabels = {
    easy: '簡単',
    medium: '普通',
    hard: '難しい'
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="mb-6">
            <Lock className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">管理者認証</h1>
            <p className="text-gray-600">管理者パスワードを入力してください。</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="管理者パスワード"
              className="w-full input-field"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <div className="text-sm text-gray-500 text-center">
              デフォルトパスワード: <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin123</span>
            </div>
            <button
              onClick={handleLogin}
              className="w-full btn-primary"
            >
              ログイン
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Settings className="w-8 h-8 text-primary-600" />
          <span>管理者画面</span>
        </h1>
        <p className="text-gray-600">ゲームのテキストコンテンツと設定を管理できます。誤字だらけなので修正してください。</p>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('texts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'texts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            テキスト管理
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rankings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ランキング管理
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ゲーム設定
          </button>
        </nav>
      </div>

      {/* テキスト管理タブ */}
      {activeTab === 'texts' && (
        <div>
          {/* 追加/編集フォーム */}
          {showAddForm && (
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingText ? 'テキスト編集' : '新しいテキスト追加'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タイトル
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      難易度
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="input-field"
                    >
                      <option value="easy">簡単</option>
                      <option value="medium">普通</option>
                      <option value="hard">難しい</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    テキスト内容
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-field h-40 resize-none"
                    required
                    placeholder="タイピングゲームで使用するテキストを入力してください..."
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {formData.content.length} 文字
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    アクティブ（ゲームで使用可能）
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingText ? '更新' : '追加'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* テキスト一覧 */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">テキスト一覧</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>新しいテキスト</span>
              </button>
            </div>

            <div className="space-y-4">
              {texts.map((text) => (
                <div
                  key={text.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{text.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[text.difficulty]}`}>
                          {difficultyLabels[text.difficulty]}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          text.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {text.is_active ? 'アクティブ' : '非アクティブ'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {text.content.substring(0, 100)}...
                      </p>
                      <div className="text-xs text-gray-500">
                        文字数: {text.content.length} | 
                        作成日: {new Date(text.created_at).toLocaleDateString('ja-JP')} |
                        更新日: {new Date(text.updated_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => startEdit(text)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(text.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {texts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">テキストがありません。</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 btn-primary"
                  >
                    最初のテキストを追加
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ランキング管理タブ */}
      {activeTab === 'rankings' && (
        <div>
          {/* ランキング編集フォーム */}
          {showRankingEditForm && (
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">ランキング編集</h2>
                <button
                  onClick={resetRankingForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleRankingSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ニックネーム
                    </label>
                    <input
                      type="text"
                      value={rankingFormData.nickname}
                      onChange={(e) => setRankingFormData({ ...rankingFormData, nickname: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      難易度
                    </label>
                    <select
                      value={rankingFormData.difficulty}
                      onChange={(e) => setRankingFormData({ ...rankingFormData, difficulty: e.target.value })}
                      className="input-field"
                    >
                      <option value="easy">簡単</option>
                      <option value="medium">普通</option>
                      <option value="hard">難しい</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WPM
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={rankingFormData.wpm}
                      onChange={(e) => setRankingFormData({ ...rankingFormData, wpm: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      精度 (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={rankingFormData.accuracy}
                      onChange={(e) => setRankingFormData({ ...rankingFormData, accuracy: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      エラー数
                    </label>
                    <input
                      type="number"
                      value={rankingFormData.errors}
                      onChange={(e) => setRankingFormData({ ...rankingFormData, errors: parseInt(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      経過時間 (秒)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={rankingFormData.time_elapsed}
                      onChange={(e) => setRankingFormData({ ...rankingFormData, time_elapsed: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      入力文字数
                    </label>
                    <input
                      type="number"
                      value={rankingFormData.characters_typed}
                      onChange={(e) => setRankingFormData({ ...rankingFormData, characters_typed: parseInt(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={resetRankingForm}
                    className="btn-secondary"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>更新</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ランキング一覧 */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">ランキング一覧</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleResetAllRankings}
                  className="btn-danger flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>全リセット</span>
                </button>
                <button
                  onClick={loadRankings}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span>更新</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {rankings.map((ranking, index) => (
                <div
                  key={ranking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                        <h3 className="text-lg font-bold text-gray-900">{ranking.nickname}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[ranking.difficulty]}`}>
                          {difficultyLabels[ranking.difficulty]}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">WPM:</span>
                          <span className="ml-1 font-bold text-primary-600">{ranking.wpm}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">精度:</span>
                          <span className="ml-1 font-bold text-green-600">{Math.round(ranking.accuracy)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">エラー:</span>
                          <span className="ml-1 font-bold text-red-600">{ranking.errors}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">文字数:</span>
                          <span className="ml-1 font-bold text-blue-600">{ranking.characters_typed}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        作成日: {new Date(ranking.created_at).toLocaleDateString('ja-JP')} |
                        経過時間: {Math.round(ranking.time_elapsed)}秒
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => startEditRanking(ranking)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRanking(ranking.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {rankings.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">ランキングデータがありません。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ゲーム設定タブ */}
      {activeTab === 'settings' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">ゲーム設定</h2>
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="w-5 h-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-800">設定機能</h3>
              </div>
              <p className="text-yellow-700 text-sm">
                やる気があれば作ります。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
