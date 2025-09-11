import React, { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import { Settings as SettingsIcon, Save, User, Volume2, VolumeX, Monitor, Smartphone } from 'lucide-react'

const Settings = () => {
  const { nickname, setNickname } = useGame()
  const [localNickname, setLocalNickname] = useState(nickname)
  const [settings, setSettings] = useState({
    soundEnabled: true,
    theme: 'light',
    fontSize: 'medium',
    showTimer: true,
    showProgress: true
  })

  useEffect(() => {
    // ローカルストレージから設定を読み込み
    const savedSettings = localStorage.getItem('renu-typing-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
    
    const savedNickname = localStorage.getItem('renu-typing-nickname')
    if (savedNickname) {
      setLocalNickname(savedNickname)
      setNickname(savedNickname)
    }
  }, [setNickname])

  const handleSaveNickname = () => {
    if (localNickname.trim()) {
      setNickname(localNickname.trim())
      localStorage.setItem('renu-typing-nickname', localNickname.trim())
      alert('ニックネームが保存されました！')
    } else {
      alert('ニックネームを入力してください。')
    }
  }

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('renu-typing-settings', JSON.stringify(newSettings))
  }

  const resetSettings = () => {
    const defaultSettings = {
      soundEnabled: true,
      theme: 'light',
      fontSize: 'medium',
      showTimer: true,
      showProgress: true
    }
    setSettings(defaultSettings)
    localStorage.setItem('renu-typing-settings', JSON.stringify(defaultSettings))
    alert('設定がリセットされました。')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <SettingsIcon className="w-8 h-8 text-primary-600" />
          <span>設定</span>
        </h1>
        <p className="text-gray-600">ゲームの設定をカスタマイズできます。</p>
      </div>

      {/* ニックネーム設定 */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <User className="w-6 h-6 text-primary-600" />
          <span>ニックネーム設定</span>
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ニックネーム
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                value={localNickname}
                onChange={(e) => setLocalNickname(e.target.value)}
                placeholder="ニックネームを入力してください"
                className="flex-1 input-field"
                maxLength={20}
              />
              <button
                onClick={handleSaveNickname}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>保存</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ランキングに表示される名前です。（最大20文字）
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
