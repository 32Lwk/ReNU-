import React from 'react'
import { Play, Target, Trophy, Clock, Zap } from 'lucide-react'

const HowToPlay = () => {
  const steps = [
    {
      icon: <Play className="w-8 h-8" />,
      title: "ゲーム開始",
      description: "「スタート」からゲームを開始し、ニックネームを入力してください。"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "テキスト選択",
      description: "難易度（簡単・普通・難しい）を選択し、プレイしたいテキストを選んでください。"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "タイピング",
      description: "画面上に表示されるテキストを正確に、素早くタイピングしてください。"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "ランキング参加",
      description: "ゲーム終了後、あなたのスコアがランキングに登録されます。"
    }
  ]

  const tips = [
    "正確性を重視しましょう。ミスを減らすことが高スコアの秘訣です。",
    "リラックスしてプレイしましょう。緊張するとミスが増えます。",
    "定期的に練習することで、タイピング速度が向上します。",
    "難易度を徐々に上げて、自分のレベルに合った練習をしましょう。"
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">遊び方</h1>
        <p className="text-gray-600">ReNU打の基本的な遊び方を説明します。</p>
      </div>

      {/* ゲームの流れ */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">ゲームの流れ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                {step.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* スコアの計算方法 */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">スコアの計算方法</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">WPM</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">WPM（Words Per Minute）</h3>
            <p className="text-gray-600">1分間にタイピングできる単語数で、速度を表します。</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">%</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">精度</h3>
            <p className="text-gray-600">正しくタイピングできた文字の割合を表します。</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-red-600">×</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">ミス数</h3>
            <p className="text-gray-600">間違ってタイピングした文字の数を表します。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowToPlay
