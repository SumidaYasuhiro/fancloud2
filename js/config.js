/* =====================================================================
 *  config.js  ―  このモックの「差し替え設定」ファイル
 *  ---------------------------------------------------------------------
 *  ・ロゴ / 画像 / 文言（キャプション）/ クリエイター / 投稿 はすべてここで管理します。
 *  ・画像は assets/ 以下のフォルダに入れたファイルを読み込みます。
 *    - 同じファイル名（例: post-01.png）で上書きするだけで差し替わります。
 *    - 別形式(jpg/png/webp)にしたい場合は、下の assets.folders の ext を
 *      "jpg" などに変えてください（"auto" なら jpg→png→webp の順に探します）。
 *  ・ブラウザ(Chrome)で index.html をダブルクリックするだけで動きます。
 * ===================================================================== */
window.MOCK_CONFIG = {

  /* ---------- サイト基本情報 ---------- */
  site: {
    name: 'fancloud',
    title: '推しとつながるファンクラブ',
    copyright: '© fancloud mock'
  },

  /* ---------- テーマ色 ---------- */
  theme: {
    primary: '#ff3700'      // メインカラー（ボタン・アクティブ色など）
  },

  /* ---------- 表示モード ----------
   * 'mobile' : スマホ幅（中央の細いカラム）で表示【既定】
   * 'pc'     : PCレイアウト（左サイドナビ＋複数列）
   * 'auto'   : 画面幅で自動切替（768px以上=PC）
   * ※ 画面右下のスイッチで、いつでも切り替えできます（選択は記憶されます）
   */
  defaultView: 'mobile',

  /* ---------- 起動時ポップアップ（1セッションに1回） ---------- */
  popups: {
    welcome: true,          // 「見たい投稿を選択」モーダル
    promo: true             // 見放題chの紹介ポップアップ
  },

  /* ---------- 画像フォルダ設定 ---------- */
  assets: {
    logo: {
      wide: 'assets/logo/logo.png',        // ヘッダー用ロゴ（横長）
      mark: 'assets/logo/logo-mark.png'    // 正方形ロゴ（ファビコン風・PCサイドバー折りたたみ用）
    },
    placeholder: 'assets/common/placeholder.png',  // 画像が見つからない時に表示
    folders: {
      // dir=フォルダ / prefix=ファイル名の先頭 / ext=拡張子 / count=枚数 / pad=連番の桁数
      banners: { dir: 'assets/banners',  prefix: 'banner-', ext: 'png', count: 4,  pad: 2 },
      avatars: { dir: 'assets/creators', prefix: 'avatar-', ext: 'png', count: 8,  pad: 2 },
      covers:  { dir: 'assets/creators', prefix: 'cover-',  ext: 'png', count: 8,  pad: 2 },
      posts:   { dir: 'assets/posts',    prefix: 'post-',   ext: 'png', count: 24, pad: 2 }
    }
  },

  /* ---------- クリエイター用ページの設定（投稿・投稿管理・プラン設定）----------
   *  me                … 「ログイン中のクリエイター」として扱う creators の id
   *  showAssumptionTags … true で「推測」タグ（公式の画面を確認できていない項目）を表示。false で非表示
   *  captionMax / maxMedia / imageMaxMB / priceMin / priceMax … 入力チェックの上限値 */
  creatorTools: {
    me: 'c1',
    showAssumptionTags: true,
    captionMax: 1000,
    maxMedia: 10,
    imageMaxMB: 10,
    priceMin: 50,
    priceMax: 50000,
    createPage: 'studio.html'   /* 「Create」ボタンの遷移先（Agent制作ページ。決まったらここを書き換え） */
  },


  /* ---------- Agent Studio（画像・動画・音楽・キャラクター制作のモック。実際の生成は行いません）----------
   *  ※ 参考サイトを確認できた範囲＋推測で構成。モデル名・提供元・数値はすべてダミーです。 */
  studio: {
    name: 'Agent Studio',
    /* Studioを開くたびに出るポップアップ（画像は assets/popup/studio-pop.png を差し替え可能） */
    popup: { enabled: true, image: 'assets/popup/studio-pop.png', button: '今すぐ創作する', link: 'studio.html?agent=1' },
    credits: { image: 4, video: 30, music: 20 },
    inspirations: [
      { id: 'i1',  kind: 'image', title: '朝霧の稜線、フラットイラスト', prompt: '朝霧がかかる山の稜線、やわらかい光、フラットなイラスト調、青と緑の配色', model: 'aurora-image', ratio: '4:5', img: 1,  user: 'ひなた', likes: 482 },
      { id: 'i2',  kind: 'image', title: 'ふわふわドーナツと珈琲',       prompt: '窓辺のカフェ、湯気の立つ珈琲とドーナツ、水彩風、やさしい色合い', model: 'nova-image', ratio: '1:1', img: 2,  user: 'みるく', likes: 355 },
      { id: 'i3',  kind: 'image', title: '宇宙に浮かぶ惑星のポスター',   prompt: '夜空に浮かぶ大きな惑星と輪、ミニマルなポスター、グラデーション', model: 'aurora-image', ratio: '3:4', img: 6,  user: 'ねこまる', likes: 298 },
      { id: 'i4',  kind: 'image', title: '観葉植物のある部屋',           prompt: '窓辺のモンステラ、午後の光、パステル、ミニマル', model: 'lite-image', ratio: '4:5', img: 5,  user: 'みどり', likes: 210 },
      { id: 'i5',  kind: 'image', title: '夕焼けの帆船',                 prompt: '凪の海に帆船が一隻、夕焼け、静かな雰囲気', model: 'nova-image', ratio: '16:9', img: 9,  user: 'ひなた', likes: 187 },
      { id: 'i6',  kind: 'video', title: '霧が晴れる稜線（5秒）',       prompt: '稜線の霧がゆっくり晴れていく。カメラは固定、鳥が横切る', model: 'aurora-motion', ratio: '9:16', img: 1,  user: 'ひなた', likes: 640, dur: '00:05' },
      { id: 'i7',  kind: 'video', title: '湯気が立つ朝のカフェ',         prompt: '珈琲から立ちのぼる湯気、窓から差す光、ゆっくりズームイン', model: 'kite-motion', ratio: '16:9', img: 2,  user: 'みるく', likes: 412, dur: '00:08' },
      { id: 'i8',  kind: 'video', title: '波と帆船のループ',             prompt: '穏やかな波に揺れる帆船、シームレスなループ', model: 'lite-motion', ratio: '1:1', img: 9,  user: 'ねこまる', likes: 301, dur: '00:05' },
      { id: 'i9',  kind: 'video', title: '惑星が回るロゴアニメ',         prompt: '惑星がゆっくり回転し、最後にロゴが浮かび上がる', model: 'aurora-motion', ratio: '9:16', img: 6,  user: 'あかり', likes: 256, dur: '00:10' },
      { id: 'i10', kind: 'music', title: '朝のローファイ',               prompt: 'ゆったりしたローファイ、ピアノとレコードノイズ、朝の静けさ', model: 'echo-music', ratio: '', img: 14, user: 'そら', likes: 330, dur: '00:30' },
      { id: 'i11', kind: 'music', title: '旅立ちのアコースティック',     prompt: '明るいアコースティックギター、手拍子、前向きなムード', model: 'echo-music', ratio: '', img: 7, user: 'そら', likes: 214, dur: '01:48' },
      { id: 'i12', kind: 'music', title: '夜のシンセウェイブ',           prompt: 'ネオンの街、シンセとベース、インストゥルメンタル', model: 'echo-music', ratio: '', img: 22, user: 'あかり', likes: 190, dur: '02:10' },
      { id: 'i13', kind: 'llm',   title: '投稿のキャプションを3案つくる', prompt: '朝焼けの山の写真に添えるキャプションを、やさしい / 元気 / 詩的の3トーンで考えて', model: 'sage-llm', ratio: '', img: 0, user: 'Agent', likes: 520, reply: '【やさしい】霧が晴れる、ほんの数分。今日も静かな朝をおすそ分けします。\n【元気】おはよう！山の上から朝イチの景色をお届け☀️\n【詩的】光が稜線をなぞるとき、世界はもう一度はじまる。' },
      { id: 'i14', kind: 'llm',   title: '動画の絵コンテをつくる',       prompt: '5秒のショート動画。朝の稜線→光→ズーム→ロゴ の4カットで絵コンテと各カットのプロンプトを書いて', model: 'sage-llm', ratio: '', img: 0, user: 'Agent', likes: 388, reply: 'カット1（0〜1秒）：霧に包まれた稜線。固定カメラ。\nカット2（1〜2秒）：太陽が顔を出し、光が差し込む。\nカット3（2〜4秒）：ゆっくりズームイン。\nカット4（4〜5秒）：ロゴが浮かび上がる。' },
      { id: 'i15', kind: 'llm',   title: '画像プロンプトを磨く',         prompt: '「猫がカフェにいる絵」を、画像モデル向けの具体的なプロンプトに書き直して', model: 'sage-llm', ratio: '', img: 0, user: 'Agent', likes: 276, reply: '窓辺のカフェの席で丸くなる茶トラの猫、午後のやわらかい逆光、湯気の立つマグカップ、パステルのイラスト調、ゆったりした雰囲気、4:5。' },
      { id: 'i16', kind: 'llm',   title: 'ファン向けお知らせ文',         prompt: '新しいプランを始めたことをファンに伝える、短くて親しみやすいお知らせ文をつくって', model: 'sage-llm', ratio: '', img: 0, user: 'Agent', likes: 241, reply: 'お知らせです！新しく「ライトプラン」を始めました。月額500円で、限定フォトと撮影メモが読めます。気軽にのぞいてみてください🌿' }
    ],
    models: [
      { id: 'aurora-image', name: 'Aurora Image', provider: 'Aurora Labs', type: 'image', plan: 'paid', rec: true, desc: '高精細で文字入れも得意な最新モデル', purpose: ['広告', '写真', 'ポスター'], len: '', res: '1K / 2K', credits: 4, score: 98 },
      { id: 'nova-image', name: 'Nova Image Pro', provider: 'Nova Works', type: 'image', plan: 'paid', rec: true, desc: 'やわらかい水彩〜イラスト調に強い', purpose: ['イラスト', 'エンタメ'], len: '', res: '1K / 2K', credits: 4, score: 94 },
      { id: 'lite-image', name: 'Lite Image', provider: 'Aurora Labs', type: 'image', plan: 'free', rec: false, desc: '速くて軽い。下書き・アイデア出しに', purpose: ['下書き'], len: '', res: '1K', credits: 1, score: 81 },
      { id: 'kite-image', name: 'Kite Photo', provider: 'Kite AI', type: 'image', plan: 'paid', rec: false, desc: '写真のようなリアル表現', purpose: ['写真', '広告'], len: '', res: '1K / 2K', credits: 6, score: 90 },
      { id: 'aurora-motion', name: 'Aurora Motion', provider: 'Aurora Labs', type: 'video', plan: 'paid', rec: true, desc: '5〜10秒のシネマティックな動画', purpose: ['広告', 'エンタメ'], len: '5〜10秒', res: '720p / 1080p', credits: 30, score: 97 },
      { id: 'kite-motion', name: 'Kite Motion', provider: 'Kite AI', type: 'video', plan: 'paid', rec: false, desc: 'カメラワークの指定が得意', purpose: ['映像', '広告'], len: '5〜8秒', res: '720p / 1080p', credits: 28, score: 92 },
      { id: 'lite-motion', name: 'Lite Motion', provider: 'Nova Works', type: 'video', plan: 'free', rec: false, desc: 'ループ動画・スタンプ向けの軽量モデル', purpose: ['スタンプ', 'SNS'], len: '3〜5秒', res: '720p', credits: 10, score: 79 },
      { id: 'orbit-motion', name: 'Orbit Video', provider: 'Orbit', type: 'video', plan: 'paid', rec: false, desc: '人物の動きが自然', purpose: ['人物', 'エンタメ'], len: '5〜10秒', res: '720p / 1080p', credits: 32, score: 88 },
      { id: 'echo-music', name: 'Echo Music', provider: 'Orbit', type: 'music', plan: 'paid', rec: true, desc: '30秒〜フルバージョンの楽曲生成', purpose: ['BGM', 'エンタメ'], len: '30秒〜3分', res: '', credits: 20, score: 93 },
      { id: 'echo-lite', name: 'Echo Lite', provider: 'Orbit', type: 'music', plan: 'free', rec: false, desc: 'ループBGM向けの軽量モデル', purpose: ['BGM'], len: '〜30秒', res: '', credits: 8, score: 76 },
      { id: 'sage-llm', name: 'Sage Chat', provider: 'Nova Works', type: 'llm', plan: 'paid', rec: true, desc: 'キャプション・絵コンテ・プロンプト改善の相談相手', purpose: ['文章', '企画'], len: '', res: '', credits: 1, score: 96 },
      { id: 'sage-mini', name: 'Sage Mini', provider: 'Nova Works', type: 'llm', plan: 'free', rec: false, desc: '短い文章づくり向けの軽量モデル', purpose: ['文章'], len: '', res: '', credits: 0, score: 84 }
    ],
    templates: [
      { title: '季節のフォト風', desc: '写真を季節の雰囲気に', img: 15, kind: 'image' },
      { title: 'スタンプ作成', desc: '表情違いを一括生成', img: 17, kind: 'image' },
      { title: 'キャラ紹介ムービー', desc: '設定画から短尺動画', img: 3, kind: 'video' },
      { title: 'ポスター風に仕上げる', desc: '好きな絵をポスターに', img: 6, kind: 'image' },
      { title: '朝のローファイBGM', desc: '投稿に合うBGMをつくる', img: 14, kind: 'music' },
      { title: '商品モック', desc: 'グッズ・パッケージ風', img: 21, kind: 'image' }
    ],
    history: { image: ['i1', 'i4', 'i5', 'i2'], video: ['i6', 'i8'], music: ['i10', 'i12'] },
    characters: [
      { id: 'k1', name: '星野 ミオ', style: 'アニメ', gender: '女性', race: '人間', user: 'ひなた', likes: 1240, img: 2, desc: '星空が好きな天文部の高校生。明るくて少しおっちょこちょい。' },
      { id: 'k2', name: 'ノア', style: 'かわいい', gender: 'その他', race: 'ロボット', user: 'みるく', likes: 980, img: 6, desc: '丸いボディのお世話ロボット。語尾に「ピ」がつく。' },
      { id: 'k3', name: '桜花', style: 'ファンタジー', gender: '女性', race: 'エルフ', user: 'あかり', likes: 870, img: 3, desc: '春の森を守るエルフの弓使い。物静かで優しい。' },
      { id: 'k4', name: 'レイ', style: 'サイバーパンク', gender: '男性', race: '人間', user: 'そら', likes: 760, img: 8, desc: 'ネオン街を走る配達屋。ヘッドホンが手放せない。' },
      { id: 'k5', name: 'もちこ', style: 'かわいい', gender: '女性', race: '獣人', user: 'ねこまる', likes: 702, img: 4, desc: 'お餅みたいにふわふわなうさぎの獣人。おやつ担当。' },
      { id: 'k6', name: '蒼井 カイ', style: 'リアル', gender: '男性', race: '人間', user: 'みどり', likes: 655, img: 7, desc: '観葉植物店の店長。穏やかで聞き上手。' },
      { id: 'k7', name: 'ルナ', style: 'ファンタジー', gender: '女性', race: '獣人', user: 'ひなた', likes: 610, img: 1, desc: '月夜に現れる猫の獣人。気まぐれな案内人。' },
      { id: 'k8', name: 'ガジェ丸', style: 'アニメ', gender: '男性', race: 'ロボット', user: 'あかり', likes: 540, img: 5, desc: '発明好きの少年型ロボット。失敗しても前向き。' }
    ],
    myCharacters: ['k2', 'k5'],
    favCharacters: ['k1', 'k3', 'k7'],
    styles: ['おまかせ', 'アニメ', 'フォト', 'イラスト', '水彩', '3D'],
    ratios: { image: ['カスタム', '21:9', '16:9', '3:2', '4:3', '1:1', '3:4', '2:3', '9:16'], video: ['自動', '1:1', '4:3', '3:4', '9:16', '16:9', '21:9'] }
  },

  /* ---------- 文言（キャプション）---------- */
  text: {
    nav: { home: 'ホーム', feed: 'フィード', unlimited: '見放題ch', ranking: 'ランキング', messages: 'メッセージ', account: 'アカウント',
           search: '検索', notifications: 'お知らせ', genres: 'ジャンル', studio: 'AI創作' },
    login: 'ログイン',
    signup: '新規登録',
    guestBanner: 'いますぐ fancloud アカウントを登録',
    library: '投稿ライブラリ',
    libraryItems: { purchased: '購入済み', playlist: 'プレイリスト', liked: 'いいね済み', history: '視聴履歴' },
    unlimitedBadge: '7万件が見放題!',
    unlimitedLead: '人気投稿や新作など7万件が見放題！',
    unlimitedPrice: '3,980円/月',
    recommendGenres: 'おすすめのジャンル',
    moreGenres: 'ジャンルをもっと見る',
    pickup: '運営ピックアップ',
    creators: 'クリエイター',
    newPosts: '新着投稿',
    morePosts: 'もっと見る',
    follow: 'フォロー',
    following: 'フォロー中',
    subscribe: 'プランに加入する',
    locked: 'プランに加入すると見られます',
    footerLinks: ['利用規約', 'プライバシーポリシー', 'ヘルプ', '運営会社'],
    welcomeTitle: 'あなたが見たい投稿を選択してください',
    welcomeOptions: ['すべて', '風景・旅', 'ほのぼの・動物'],
    welcomeApply: '反映する',
    mockNotice: 'これはデザイン確認用のモックです（送信・決済は行われません）',
    /* クリエイター用ページの文言 */
    creator: {
      assumeTag: '推測',
      noteAssume: 'この画面は公式の画面を確認できていないため、わかっている範囲＋想定で作っています。「推測」の付いた項目は想定です。',
      menuLink: 'クリエイターメニュー', studioLink: 'AI創作（画像・動画・音楽）',
      homeTitle: 'クリエイターメニュー', composeTitle: '新規投稿', editTitle: '投稿を編集', manageTitle: '投稿管理', planTitle: 'プラン設定',
      viewPublic: '公開ページを見る', statFollowers: 'フォロワー', statPosts: '投稿', statLikes: 'いいね',
      newPost: '新規投稿', managePosts: '投稿の管理', planSettings: 'プラン設定', earnings: '売上・振込', bank: '口座設定', editProfile: 'プロフィール編集',
      soon: 'このメニューはモックでは準備中です',
      media: '写真・動画', mediaAdd: '写真・動画を選ぶ',
      create: 'Create', createHint: 'Agentで画像・動画をつくる', createTitle: 'Agent で制作', createSoon: 'Agent による画像・動画制作ページは準備中です（仮ページ）。', createBack: '新規投稿に戻る',
      mediaHint: '画像はJPG/PNG（1枚{imageMax}MBまで）、動画はMP4。HEIC・MOVは変換が必要です。モックではブラウザ内でプレビューするだけで、ファイルは送信されません。',
      caption: '説明文', captionPlaceholder: '投稿の説明文を入力',
      visibility: '公開範囲', visPublic: '全員に公開', visMembers: '有料プラン会員のみ', visPlans: '閲覧できるプラン',
      ppv: '単品販売（PPV）', ppvHint: 'この投稿だけを単品で販売します', ppvPrice: '単品価格（円）',
      schedule: '予約投稿', scheduleHint: '日時を指定して公開します',
      tags: 'ジャンルタグ', tagsHint: '最大3つまで選べます',
      preview: 'プレビュー', previewEmpty: '（説明文が入ります）',
      saveDraft: '下書き保存', post: '投稿する', schedulePost: '予約する', update: '更新する', cancel: 'キャンセル',
      tabAll: 'すべて', tabPub: '公開中', tabSch: '予約中', tabDraft: '下書き',
      edit: '編集', del: '削除', delConfirm: 'この投稿を削除しますか？', delNote: 'モックの中の投稿が消えます（元に戻すボタンで復元できます）。', delDo: '削除する',
      empty: '該当する投稿はありません', resetSamples: 'サンプルの状態に戻す', resetConfirm: '投稿・プランをサンプルの状態に戻しますか？',
      planAdd: 'プランを追加', planName: 'プラン名', planPrice: '月額料金（円）', planFree: '無料プランにする', planDesc: 'プランの説明', planSave: '保存する', planDelete: '削除'
    }
  },

  /* ---------- バナー（トップのスライダー）----------
   * img: assets/banners の連番 / overlay: true なら下の title・sub を画像の上に重ねる
   * 画像に文字が入っている素材を使う場合は overlay:false にしてください。 */
  banners: [
    { img: 1, title: '秋の新企画スタート', sub: '新しいクリエイターと出会おう', link: 'unlimited.html', overlay: true },
    { img: 2, title: 'カフェ巡り特集', sub: '今月の人気投稿をチェック', link: 'ranking.html', overlay: true },
    { img: 3, title: '限定コンテンツをお得に', sub: 'プランに加入して全部見よう', link: 'unlimited.html', overlay: true },
    { img: 4, title: '宇宙みたいな夜景', sub: 'おすすめの投稿を集めました', link: 'genres.html', overlay: true }
  ],

  /* ---------- ジャンル ---------- */
  genres: [
    { id: 'travel',    name: '風景・旅',         count: 4261 },
    { id: 'cafe',      name: 'グルメ・カフェ',    count: 3797 },
    { id: 'animals',   name: 'どうぶつ',         count: 2980 },
    { id: 'illust',    name: 'イラスト',         count: 2558 },
    { id: 'life',      name: 'ライフスタイル',    count: 2214 },
    { id: 'music',     name: '音楽',             count: 1873 },
    { id: 'craft',     name: 'ハンドメイド',      count: 1642 },
    { id: 'fitness',   name: 'フィットネス',      count: 1390 },
    { id: 'photo',     name: '写真',             count: 1288 },
    { id: 'gadget',    name: 'ガジェット',        count: 904 },
    { id: 'game',      name: 'ゲーム',           count: 851 },
    { id: 'study',     name: '学び・勉強',        count: 612 }
  ],

  /* ---------- クリエイター ----------
   * avatar / cover: assets/creators の連番 */
  creators: [
    { id: 'c1', handle: 'hinata_photo', name: 'ひなた', genre: 'travel',  avatar: 5, cover: 1, followers: 21480, verified: true,
      bio: '旅するフォトグラファーです。山や海、まだ知らない景色を撮りに行きます。毎週日曜は旅の裏話も。',
      plans: [ { name: 'ライトプラン', price: 500, desc: '限定フォト＋旅ログが読めます' }, { name: 'プレミアム', price: 1500, desc: '高画質データ＋撮影メモ＋月1のQ&A' } ] },
    { id: 'c2', handle: 'mint_cafe', name: 'ミント', genre: 'cafe', avatar: 4, cover: 2, followers: 15320, verified: true,
      bio: 'カフェ巡りと自家製スイーツの記録。お店の選び方や撮り方のコツも載せています。',
      plans: [ { name: 'スイーツ会員', price: 480, desc: 'レシピと週2回の限定投稿' }, { name: '店舗マップ付き', price: 980, desc: 'おすすめカフェのマップも見られます' } ] },
    { id: 'c3', handle: 'nekomaru', name: 'ねこまる', genre: 'animals', avatar: 1, cover: 3, followers: 33905, verified: true,
      bio: '保護猫2匹と暮らしています。毎日のゆるい日常をおすそわけ。',
      plans: [ { name: 'おやつ応援', price: 300, desc: '日常ショットを毎日更新' }, { name: 'ふわふわ会員', price: 800, desc: '動画＋ライブ配信アーカイブ' } ] },
    { id: 'c4', handle: 'sora_draw', name: 'ソラ', genre: 'illust', avatar: 8, cover: 4, followers: 12210, verified: false,
      bio: 'イラストレーター。ラフから完成までの制作過程と、壁紙素材を配布しています。',
      plans: [ { name: '制作過程プラン', price: 600, desc: 'メイキングと壁紙データ' } ] },
    { id: 'c5', handle: 'haru_plants', name: 'ハル', genre: 'life', avatar: 3, cover: 5, followers: 9874, verified: false,
      bio: '観葉植物と暮らす部屋づくり。育て方やおすすめの鉢カバーも紹介。',
      plans: [ { name: 'グリーンプラン', price: 400, desc: '育成記録と質問受付' } ] },
    { id: 'c6', handle: 'ren_beats', name: 'レン', genre: 'music', avatar: 7, cover: 6, followers: 17650, verified: true,
      bio: '夜に作るローファイ・ビート。デモ音源と制作の裏側を公開しています。',
      plans: [ { name: 'デモ音源プラン', price: 700, desc: '未発表デモを先行公開' }, { name: 'プロジェクト会員', price: 1800, desc: 'プロジェクトファイル配布' } ] },
    { id: 'c7', handle: 'yuu_craft', name: 'ユウ', genre: 'craft', avatar: 2, cover: 7, followers: 8421, verified: false,
      bio: '刺繍やレジンのハンドメイド雑貨を作っています。型紙や作り方も公開。',
      plans: [ { name: '作り方プラン', price: 500, desc: '型紙と動画レッスン' } ] },
    { id: 'c8', handle: 'aoi_fit', name: 'アオイ', genre: 'fitness', avatar: 6, cover: 8, followers: 11036, verified: false,
      bio: '朝ランと軽い筋トレの習慣化。続けるコツと食事メモを毎週まとめています。',
      plans: [ { name: '朝活プラン', price: 450, desc: '週間メニューと食事メモ' } ] }
  ],

  /* ---------- 投稿 ----------
   * img: assets/posts の連番 / type: 'photo' | 'video' / price: 0=無料, 数値=有料ロック */
  posts: [
    { id: 'p1',  creator: 'c1', img: 1,  type: 'photo', price: 0,   likes: 128, comments: 12, time: '47分前', text: '朝イチの稜線。霧が晴れる瞬間を待って、およそ2時間粘りました。今日の1枚目は無料公開です。' },
    { id: 'p2',  creator: 'c2', img: 2,  type: 'photo', price: 0,   likes: 94,  comments: 6,  time: '3時間前', text: '駅前の新しいカフェでモーニング。ドーナツがふわふわで、コーヒーとの相性が最高でした。' },
    { id: 'p3',  creator: 'c3', img: 3,  type: 'video', price: 0,   likes: 391, comments: 28, time: '4時間前', duration: '00:22', text: 'お布団から出たくない朝。今日もまったり出勤前のごあいさつです。' },
    { id: 'p4',  creator: 'c4', img: 4,  type: 'photo', price: 500, likes: 62,  comments: 3,  time: '5時間前', text: '新作イラストのラフ段階。配色の変遷をまとめました。プランに入ると全カットが見られます。' },
    { id: 'p5',  creator: 'c5', img: 5,  type: 'photo', price: 0,   likes: 105, comments: 9,  time: '9時間前', text: '窓辺のモンステラが新しい葉を広げました。水やりのペースを変えたのが良かったのかも。' },
    { id: 'p6',  creator: 'c6', img: 6,  type: 'video', price: 700, likes: 58,  comments: 4,  time: '10時間前', duration: '01:12', text: '夜のビート作り。ドラムの音選びからミックスまでを早送りでお見せします。' },
    { id: 'p7',  creator: 'c7', img: 7,  type: 'photo', price: 0,   likes: 77,  comments: 5,  time: '11時間前', text: '刺繍のお花モチーフが完成！次は同じ柄でブローチにします。' },
    { id: 'p8',  creator: 'c8', img: 8,  type: 'photo', price: 0,   likes: 149, comments: 15, time: '11時間前', text: '5kmのいつもの朝ランコース。紅葉がきれいで、ついペースが落ちました🍁' },
    { id: 'p9',  creator: 'c1', img: 9,  type: 'photo', price: 0,   likes: 88,  comments: 7,  time: '12時間前', text: '凪の海に帆船が1隻。何も考えずにぼーっとできる貴重な時間でした。' },
    { id: 'p10', creator: 'c2', img: 10, type: 'photo', price: 480, likes: 71,  comments: 6,  time: '1日前', text: '自家製プリンのレシピ。固さの調整を3パターン試しました。会員限定で詳細を公開中。' },
    { id: 'p11', creator: 'c3', img: 11, type: 'photo', price: 0,   likes: 205, comments: 19, time: '1日前', text: '段ボールを見つけた瞬間の顔がこちらです。' },
    { id: 'p12', creator: 'c4', img: 12, type: 'photo', price: 0,   likes: 99,  comments: 8,  time: '1日前', text: '春色のお花イラストを描きました。壁紙サイズも後日配布します。' },
    { id: 'p13', creator: 'c5', img: 13, type: 'video', price: 0,   likes: 64,  comments: 5,  time: '2日前', duration: '00:48', text: '森みたいなテラリウム作りの様子。苔の置き方がポイントです。' },
    { id: 'p14', creator: 'c6', img: 14, type: 'photo', price: 0,   likes: 112, comments: 11, time: '2日前', text: '夜景を見ながら作った曲のジャケット案。街の明かりをイメージしました。' },
    { id: 'p15', creator: 'c7', img: 15, type: 'photo', price: 500, likes: 53,  comments: 2,  time: '2日前', text: 'ハンドメイドの小物入れ、型紙つき。プランに入ると型紙PDFがダウンロードできます。' },
    { id: 'p16', creator: 'c8', img: 16, type: 'photo', price: 0,   likes: 134, comments: 13, time: '3日前', text: '海沿いのランニング。波の音を聞きながら走ると、いつもより足が軽いです。' },
    { id: 'p17', creator: 'c1', img: 17, type: 'photo', price: 1500,likes: 76,  comments: 4,  time: '3日前', text: '夕焼けの稜線タイムラプス用の連続写真。高画質データはプレミアム会員向けです。' },
    { id: 'p18', creator: 'c2', img: 18, type: 'photo', price: 0,   likes: 90,  comments: 6,  time: '4日前', text: '午後のコーヒータイム。今日は豆を変えてみました。酸味が少なくて飲みやすい。' },
    { id: 'p19', creator: 'c3', img: 19, type: 'video', price: 0,   likes: 242, comments: 21, time: '4日前', duration: '00:14', text: 'お昼寝から起きたところ。あくびが大きすぎて自分でもびっくり。' },
    { id: 'p20', creator: 'c4', img: 20, type: 'photo', price: 600, likes: 58,  comments: 3,  time: '5日前', text: '幾何学パターンのテクスチャ素材セット。商用利用OKです。' },
    { id: 'p21', creator: 'c5', img: 21, type: 'photo', price: 0,   likes: 84,  comments: 7,  time: '5日前', text: '友達にもらった多肉植物が増えました。鉢の色を揃えるとお部屋がまとまります。' },
    { id: 'p22', creator: 'c6', img: 22, type: 'photo', price: 0,   likes: 120, comments: 10, time: '6日前', text: '星空みたいなジャケットで次のEPを予告。11月末に公開予定です。' },
    { id: 'p23', creator: 'c7', img: 23, type: 'photo', price: 0,   likes: 69,  comments: 4,  time: '6日前', text: '色とりどりの刺繍糸を整理しました。グラデーションに並べると気分が上がります。' },
    { id: 'p24', creator: 'c8', img: 24, type: 'photo', price: 0,   likes: 101, comments: 9,  time: '1週間前', text: '山道ランの一枚。頂上で食べたおにぎりが世界一おいしかった。' }
  ],

  /* ---------- コメント（投稿詳細で表示）---------- */
  comments: [
    { name: 'ことり',   avatar: 4, time: '1時間前', text: 'すごく素敵です！毎回楽しみにしています。' },
    { name: 'ぽんた',   avatar: 2, time: '2時間前', text: '色合いがとても好みです。壁紙にしたいなあ。' },
    { name: 'みつる',   avatar: 5, time: '3時間前', text: '続きの投稿も待ってます〜！' },
    { name: 'ゆきの',   avatar: 7, time: '5時間前', text: '癒されました。ありがとうございます。' }
  ],

  /* ---------- メッセージ ---------- */
  messages: [
    { creator: 'c3', last: 'お返事ありがとう！次の動画も見てね🐱', time: '12:04', unread: 2 },
    { creator: 'c2', last: '新作のプリン、レシピを更新しました', time: '昨日', unread: 0 },
    { creator: 'c1', last: 'プレミアム会員の皆さまへ、月末のQ&Aのお知らせです', time: '11/17', unread: 1 },
    { creator: 'c6', last: 'デモ音源を3曲追加しました🎧', time: '11/15', unread: 0 }
  ],
  chatSample: [
    { from: 'creator', text: 'こんにちは！いつも応援ありがとうございます😊' },
    { from: 'me',      text: '先日の投稿、すごく良かったです！' },
    { from: 'creator', text: 'うれしい！次の更新も楽しみにしていてくださいね。' }
  ],

  /* ---------- お知らせ ---------- */
  notifications: [
    { icon: 'heart',   text: 'ひなた があなたのコメントにいいねしました', time: '12分前', unread: true },
    { icon: 'bell',    text: 'フォロー中の ねこまる が新しい動画を投稿しました', time: '1時間前', unread: true },
    { icon: 'gift',    text: '秋の新企画がスタートしました。バナーからチェック！', time: '昨日', unread: false },
    { icon: 'message', text: 'ミント からメッセージが届いています', time: '11/17', unread: false }
  ],

  /* ---------- 人気キーワード（検索ページ）---------- */
  keywords: ['カフェ', '猫', '風景', '朝ラン', '観葉植物', 'イラスト', 'ローファイ', 'ハンドメイド']
};
