const fs = require('fs')
const path = require('path')

// ひらがな・カタカナ・漢字をローマ字に変換する関数
const toRomaji = (text) => {
  // 漢字の読み仮名辞書（基本的なもの）
  const kanjiToRomaji = {
    '一': 'ichi', '二': 'ni', '三': 'san', '四': 'yon', '五': 'go',
    '六': 'roku', '七': 'nana', '八': 'hachi', '九': 'kyuu', '十': 'juu',
    '百': 'hyaku', '千': 'sen', '万': 'man', '億': 'oku',
    '人': 'jin', '年': 'nen', '月': 'gatsu', '日': 'nichi', '時': 'ji',
    '分': 'fun', '秒': 'byou', '今': 'ima', '大': 'dai', '小': 'shou', 
    '中': 'chuu', '高': 'kou', '低': 'tei', '新': 'shin', '古': 'ko', 
    '長': 'naga', '短': 'tan', '広': 'hiro', '狭': 'sema', '多': 'ta', 
    '少': 'shou', '早': 'haya', '遅': 'oso', '美': 'bi', '醜': 'shuu', 
    '強': 'tsuyo', '弱': 'yowa', '重': 'omo', '軽': 'karu', '熱': 'atsu', 
    '冷': 'tsume', '明': 'aka', '暗': 'kura', '白': 'shiro', '黒': 'kuro', 
    '赤': 'aka', '青': 'ao', '緑': 'midori', '黄': 'ki', '紫': 'murasaki', 
    '茶': 'cha', '灰': 'hai', '山': 'yama', '川': 'kawa', '海': 'umi', 
    '空': 'sora', '雲': 'kumo', '雨': 'ame', '雪': 'yuki', '風': 'kaze', 
    '火': 'hi', '水': 'mizu', '木': 'ki', '花': 'hana', '草': 'kusa', 
    '葉': 'ha', '実': 'mi', '鳥': 'tori', '魚': 'sakana', '犬': 'inu', 
    '猫': 'neko', '馬': 'uma', '牛': 'ushi', '豚': 'buta', '羊': 'hitsuji', 
    '猿': 'saru', '熊': 'kuma', '食': 'tabe', '飲': 'nomi', '見': 'mi', 
    '聞': 'ki', '話': 'hana', '読': 'yo', '書': 'ka', '歩': 'aru', 
    '走': 'hashi', '飛': 'to', '泳': 'oyo', '歌': 'uta', '踊': 'odo', 
    '笑': 'wara', '泣': 'na', '怒': 'oko', '喜': 'yoro', '悲': 'kana', 
    '愛': 'ai', '恋': 'koi', '友': 'tomo', '家族': 'kazoku', '父': 'chichi', 
    '母': 'haha', '兄': 'ani', '姉': 'ane', '弟': 'otouto', '妹': 'imouto', 
    '子': 'ko', '孫': 'mago', '先生': 'sensei', '学生': 'gakusei', 
    '会社員': 'kaishain', '医者': 'isha', '警察': 'keisatsu', 
    '消防士': 'shouboushi', '教師': 'kyoushi', '看護師': 'kangoshi',
    '家': 'ie', '学校': 'gakkou', '病院': 'byouin', '銀行': 'ginkou',
    '店': 'mise', '駅': 'eki', '空港': 'kuukou', '公園': 'kouen',
    '車': 'kuruma', '電車': 'densha', 'バス': 'basu', '飛行機': 'hikouki',
    '船': 'fune', '自転車': 'jitensha', 'バイク': 'baiku',
    '本': 'hon', '新聞': 'shinbun', '雑誌': 'zasshi', '映画': 'eiga',
    '音楽': 'ongaku', 'スポーツ': 'supootsu', 'ゲーム': 'geemu',
    'コンピューター': 'konpyuutaa', 'スマートフォン': 'sumaatofon',
    'テレビ': 'terebi', 'ラジオ': 'rajio', 'カメラ': 'kamera',
    'お金': 'okane', '時間': 'jikan', '場所': 'basho', '国': 'kuni',
    '日本': 'nihon', 'アメリカ': 'amerika', '中国': 'chuugoku',
    '韓国': 'kankoku', 'イギリス': 'igirisu', 'フランス': 'furansu',
    'ドイツ': 'doitsu', 'イタリア': 'itaria', 'スペイン': 'supein',
    'ロシア': 'roshia', 'ブラジル': 'burajiru', 'インド': 'indo',
    'オーストラリア': 'oosutoraria', 'カナダ': 'kanada',
    '東京': 'toukyou', '大阪': 'oosaka', '京都': 'kyouto', '横浜': 'yokohama',
    '名古屋': 'nagoya', '福岡': 'fukuoka', '札幌': 'sapporo',
    '春': 'haru', '夏': 'natsu', '秋': 'aki', '冬': 'fuyu',
    '朝': 'asa', '昼': 'hiru', '夜': 'yoru', '今日': 'kyou',
    '昨日': 'kinou', '明日': 'ashita', '来年': 'rainen', '去年': 'kyonen',
    '来月': 'raigetsu', '先月': 'sengetsu', '来週': 'raishuu', '先週': 'senshuu',
    '月曜日': 'getsuyoubi', '火曜日': 'kayoubi', '水曜日': 'suiyoubi',
    '木曜日': 'mokuyoubi', '金曜日': 'kinyoubi', '土曜日': 'doyoubi', '日曜日': 'nichiyoubi',
    // 追加の漢字
    '深': 'shin', '層': 'sou', '学': 'gaku', '習': 'shuu',
    '自': 'ji', '然': 'zen', '言': 'gen', '語': 'go', '処': 'sho', '理': 'ri',
    '機': 'ki', '械': 'kai', '学': 'gaku', '習': 'shuu',
    '人': 'jin', '工': 'kou', '知': 'chi', '能': 'nou',
    'デ': 'de', 'ー': 'ta', 'タ': 'ta', 'ベ': 'be', 'ー': 'ta', 'ス': 'su',
    'ア': 'a', 'ル': 'ru', 'ゴ': 'go', 'リ': 'ri', 'ズ': 'zu', 'ム': 'mu',
    'ビ': 'bi', 'ッ': 'tsu', 'グ': 'gu', 'デ': 'de', 'ー': 'ta', 'タ': 'ta',
    'ク': 'ku', 'ラ': 'ra', 'ウ': 'u', 'ド': 'do', '学': 'gaku', '習': 'shuu',
    '神': 'shin', '経': 'kei', '網': 'mou', '絡': 'raku',
    '強': 'kyou', '化': 'ka', '学': 'gaku', '習': 'shuu',
    '転': 'ten', '移': 'i', '学': 'gaku', '習': 'shuu',
    '対': 'tai', '抗': 'kou', '生': 'sei', '成': 'sei', '網': 'mou', '絡': 'raku',
    '生': 'sei', '成': 'sei', '対': 'tai', '抗': 'kou', 'ネ': 'ne', 'ッ': 'tsu', 'ト': 'to', 'ワ': 'wa', 'ー': 'ta', 'ク': 'ku',
    '畳': 'jyou', 'み': 'mi', '込': 'ko', 'み': 'mi', '神': 'shin', '経': 'kei', '網': 'mou', '絡': 'raku',
    '長': 'chou', '短': 'tan', '期': 'ki', '記': 'ki', '憶': 'oku',
    '注': 'chuu', '意': 'i', '機': 'ki', '構': 'kou',
    '変': 'hen', '分': 'bun', '器': 'ki', 'エ': 'e', 'ン': 'n', 'コ': 'ko', 'ー': 'ta', 'ダ': 'da', 'ー': 'ta',
    'バ': 'ba', 'ッ': 'tsu', 'チ': 'chi', '正': 'sei', '規': 'ki', '化': 'ka',
    'ド': 'do', 'ロ': 'ro', 'ッ': 'tsu', 'プ': 'pu', 'ア': 'a', 'ウ': 'u', 'ト': 'to',
    'バ': 'ba', 'イ': 'i', 'ア': 'a', 'ス': 'su', '正': 'sei', '則': 'soku', '化': 'ka',
    '最': 'sai', '大': 'dai', 'プ': 'pu', 'ー': 'ta', 'リ': 'ri', 'ン': 'n', 'グ': 'gu',
    '最': 'sai', '小': 'shou', '二': 'ni', '乗': 'jou', '平': 'hei', '均': 'kin', '誤': 'go', '差': 'sa',
    '交': 'kou', '叉': 'sa', 'エ': 'e', 'ン': 'n', 'ト': 'to', 'ロ': 'ro', 'ピ': 'pi', 'ー': 'ta',
    '早': 'sou', '期': 'ki', '停': 'tei', '止': 'shi',
    'ア': 'a', 'ダ': 'da', 'プ': 'pu', 'テ': 'te', 'ィ': 'i', 'ブ': 'bu', '学': 'gaku', '習': 'shuu',
    '強': 'kyou', '化': 'ka', '学': 'gaku', '習': 'shuu',
    '深': 'shin', '層': 'sou', '学': 'gaku', '習': 'shuu',
    '自': 'ji', '然': 'zen', '言': 'gen', '語': 'go', '処': 'sho', '理': 'ri',
    'コ': 'ko', 'ン': 'n', 'ピ': 'pi', 'ュ': 'yu', 'ー': 'ta', 'タ': 'ta', 'ビ': 'bi', 'ジ': 'ji', 'ョ': 'yo', 'ン': 'n',
    '機': 'ki', '械': 'kai', '学': 'gaku', '習': 'shuu',
    '人': 'jin', '工': 'kou', '知': 'chi', '能': 'nou',
    'デ': 'de', 'ー': 'ta', 'タ': 'ta', 'ベ': 'be', 'ー': 'ta', 'ス': 'su',
    'ア': 'a', 'ル': 'ru', 'ゴ': 'go', 'リ': 'ri', 'ズ': 'zu', 'ム': 'mu',
    'ビ': 'bi', 'ッ': 'tsu', 'グ': 'gu', 'デ': 'de', 'ー': 'ta', 'タ': 'ta',
    'ク': 'ku', 'ラ': 'ra', 'ウ': 'u', 'ド': 'do', '学': 'gaku', '習': 'shuu',
    '神': 'shin', '経': 'kei', '網': 'mou', '絡': 'raku',
    '強': 'kyou', '化': 'ka', '学': 'gaku', '習': 'shuu',
    '転': 'ten', '移': 'i', '学': 'gaku', '習': 'shuu',
    '対': 'tai', '抗': 'kou', '生': 'sei', '成': 'sei', '網': 'mou', '絡': 'raku',
    '生': 'sei', '成': 'sei', '対': 'tai', '抗': 'kou', 'ネ': 'ne', 'ッ': 'tsu', 'ト': 'to', 'ワ': 'wa', 'ー': 'ta', 'ク': 'ku',
    '畳': 'jyou', 'み': 'mi', '込': 'ko', 'み': 'mi', '神': 'shin', '経': 'kei', '網': 'mou', '絡': 'raku',
    '長': 'chou', '短': 'tan', '期': 'ki', '記': 'ki', '憶': 'oku',
    '注': 'chuu', '意': 'i', '機': 'ki', '構': 'kou',
    '変': 'hen', '分': 'bun', '器': 'ki', 'エ': 'e', 'ン': 'n', 'コ': 'ko', 'ー': 'ta', 'ダ': 'da', 'ー': 'ta',
    'バ': 'ba', 'ッ': 'tsu', 'チ': 'chi', '正': 'sei', '規': 'ki', '化': 'ka',
    'ド': 'do', 'ロ': 'ro', 'ッ': 'tsu', 'プ': 'pu', 'ア': 'a', 'ウ': 'u', 'ト': 'to',
    'バ': 'ba', 'イ': 'i', 'ア': 'a', 'ス': 'su', '正': 'sei', '則': 'soku', '化': 'ka',
    '最': 'sai', '大': 'dai', 'プ': 'pu', 'ー': 'ta', 'リ': 'ri', 'ン': 'n', 'グ': 'gu',
    '最': 'sai', '小': 'shou', '二': 'ni', '乗': 'jou', '平': 'hei', '均': 'kin', '誤': 'go', '差': 'sa',
    '交': 'kou', '叉': 'sa', 'エ': 'e', 'ン': 'n', 'ト': 'to', 'ロ': 'ro', 'ピ': 'pi', 'ー': 'ta',
    '早': 'sou', '期': 'ki', '停': 'tei', '止': 'shi',
    'ア': 'a', 'ダ': 'da', 'プ': 'pu', 'テ': 'te', 'ィ': 'i', 'ブ': 'bu', '学': 'gaku', '習': 'shuu',
    // 追加の漢字（修正版）
    '量': 'ryou', '子': 'shi', '暗': 'an', '号': 'gou',
    'ホ': 'ho', 'モ': 'mo', 'ル': 'ru', 'フ': 'fu', 'ィ': 'i', 'ッ': 'tsu', 'ク': 'ku',
    '同': 'dou', '型': 'gata', '暗': 'an', '号': 'gou',
    '楕': 'da', '円': 'en', '曲': 'kyoku', '線': 'sen', '暗': 'an', '号': 'gou',
    '対': 'tai', '称': 'shou', '暗': 'an', '号': 'gou',
    '非': 'hi', '対': 'tai', '称': 'shou', '暗': 'an', '号': 'gou',
    'ハ': 'ha', 'ッ': 'tsu', 'シ': 'shi', 'ュ': 'yu', 'ー': 'ta', '暗': 'an', '号': 'gou',
    'デ': 'de', 'ィ': 'i', 'ジ': 'ji', 'タ': 'ta', 'ル': 'ru', '暗': 'an', '号': 'gou',
    'ブ': 'bu', 'ロ': 'ro', 'ッ': 'tsu', 'ク': 'ku', 'チェ': 'che', 'ー': 'ta', 'ン': 'n', '暗': 'an', '号': 'gou',
    'マ': 'ma', 'ル': 'ru', 'チ': 'chi', '暗': 'an', '号': 'gou',
    'ラ': 'ra', 'ン': 'n', 'ダ': 'da', 'ム': 'mu', '暗': 'an', '号': 'gou',
    // 追加の漢字（知識証明関連）
    'ゼ': 'ze', 'ロ': 'ro', '知': 'chi', '識': 'shiki', '証': 'shou', '明': 'mei',
    'マ': 'ma', 'ル': 'ru', 'チ': 'chi', 'パ': 'pa', 'ー': 'ta', 'テ': 'te', 'ィ': 'i', '計': 'kei', '算': 'san',
    'プ': 'pu', 'ラ': 'ra', 'イ': 'i', 'バ': 'ba', 'シ': 'shi', 'ー': 'ta', '計': 'kei', '算': 'san',
    'フ': 'fu', 'ェ': 'e', 'デ': 'de', 'ラ': 'ra', 'ル': 'ru', '計': 'kei', '算': 'san',
    'セ': 'se', 'キ': 'ki', 'ュ': 'yu', 'ア': 'a', '計': 'kei', '算': 'san',
    'マ': 'ma', 'ル': 'ru', 'チ': 'chi', 'パ': 'pa', 'ー': 'ta', 'テ': 'te', 'ィ': 'i', '計': 'kei', '算': 'san',
    'プ': 'pu', 'ラ': 'ra', 'イ': 'i', 'バ': 'ba', 'シ': 'shi', 'ー': 'ta', '計': 'kei', '算': 'san',
    'フ': 'fu', 'ェ': 'e', 'デ': 'de', 'ラ': 'ra', 'ル': 'ru', '計': 'kei', '算': 'san',
    'セ': 'se', 'キ': 'ki', 'ュ': 'yu', 'ア': 'a', '計': 'kei', '算': 'san'
  }

  const hiraganaToRomaji = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n',
    'っ': 'tsu', 'ー': '-', '、': ',', '。': '.', '　': ' '
  }

  const katakanaToRomaji = {
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
    'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヰ': 'wi', 'ヱ': 'we', 'ヲ': 'wo', 'ン': 'n',
    'ッ': 'tsu', 'ー': '-', '、': ',', '。': '.', '　': ' '
  }

  // 拗音の処理
  const smallKana = {
    'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo',
    'ャ': 'ya', 'ュ': 'yu', 'ョ': 'yo'
  }

  let result = ''
  let i = 0

  while (i < text.length) {
    const char = text[i]
    const nextChar = text[i + 1]

    // 漢字の変換を最初にチェック（より厳密に）
    if (kanjiToRomaji[char]) {
      result += kanjiToRomaji[char]
      i++
      continue
    }

    // 拗音の処理（きゃ、しゅ、ちょなど）
    if ((char === 'き' || char === 'し' || char === 'ち' || char === 'に' || 
         char === 'ひ' || char === 'み' || char === 'り' || char === 'ぎ' || 
         char === 'じ' || char === 'び' || char === 'ぴ') && 
        (nextChar === 'ゃ' || nextChar === 'ゅ' || nextChar === 'ょ')) {
      const base = hiraganaToRomaji[char] || katakanaToRomaji[char]
      const small = smallKana[nextChar]
      if (base && small) {
        result += base.slice(0, -1) + small
        i += 2
        continue
      }
    }

    // 通常の文字変換
    if (hiraganaToRomaji[char]) {
      result += hiraganaToRomaji[char]
    } else if (katakanaToRomaji[char]) {
      result += katakanaToRomaji[char]
    } else {
      // 変換できない文字はそのまま残す（漢字など）
      result += char
    }
    i++
  }

  return result
}

// texts.jsonファイルを読み込み
const textsPath = path.join(__dirname, '..', 'data', 'texts.json')
const textsData = JSON.parse(fs.readFileSync(textsPath, 'utf8'))

// 各テキストにローマ字を追加
textsData.texts.forEach(text => {
  text.romaji = toRomaji(text.content)
})

// ファイルに書き戻し
fs.writeFileSync(textsPath, JSON.stringify(textsData, null, 2), 'utf8')

console.log('ローマ字を追加しました！')
