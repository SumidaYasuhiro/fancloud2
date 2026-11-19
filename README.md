# fancloud モック（ファンクラブ型サイトのHTMLモック）

MyFans のような「スマホネイティブ」なファンクラブサイトのレイアウト・動きを参考にした、ローカルで動くHTMLモックです。
素材（ロゴ・バナー・イラスト）はすべてオリジナルのダミー（非性的なイラスト）で、あとから差し替えできます。

## 使い方

1. ZIPを展開し、`index.html` を **Chrome でダブルクリック**して開きます。
   Mac / Windows どちらも同じです。サーバーやインストールは不要です。
2. 画面右下のスイッチで **スマホ表示 / PC表示** を切り替えられます（選択は記憶されます）。
   - URLでも指定できます: `index.html?view=pc` / `index.html?view=mobile`
   - 起動時ポップアップを出したくない時: `index.html?nopopup=1`

## ページ構成

| ファイル | 内容 |
|---|---|
| `index.html` | ホーム（バナー、ライブラリ、ジャンル、ピックアップ、クリエイター、新着） |
| `feed.html` | フィード（おすすめ / フォロー中） |
| `unlimited.html` | 見放題ch（おすすめ / 人気 / 新着） |
| `ranking.html` | ランキング（投稿・クリエイター × デイリー/ウィークリー/月間） |
| `messages.html` | メッセージ（一覧 → チャット画面） |
| `account.html` | アカウント（ライブラリ各種、設定メニュー） |
| `search.html` | 検索（キーワード、ジャンル絞り込み） |
| `genres.html` | ジャンル一覧 |
| `creator.html?id=c1` | クリエイターのプロフィール（投稿 / プラン / プロフィール） |
| `post.html?id=p1` | 投稿詳細（コメント、有料ロック表示） |
| `notifications.html` | お知らせ |
| `login.html` | ログイン / 新規登録（入力内容は保存・送信されません） |
| `creator-home.html` | クリエイターメニュー（アカウント画面の「クリエイターメニュー」から入れます）**※想定** |
| `post-new.html` | 新規投稿（写真・動画、説明文、公開範囲、単品販売、予約投稿、ジャンルタグ、プレビュー）。`?edit=投稿ID` で編集 |
| `post-manage.html` | 投稿管理（すべて/公開中/予約中/下書き、編集・削除、サンプルに戻す） **※想定** |
| `plan-settings.html` | プラン設定（追加・編集・削除、無料プラン） |

### Agent Studio（画像・動画・音楽・キャラクター制作のモック）

入口は3か所です：新規投稿の「Create」、アカウント画面／クリエイターメニューの「AI創作」、PC表示の左サイドメニュー「AI創作」。遷移先は `config.js` の `creatorTools.createPage`（Createボタンのみ）（遷移先は `config.js` の `creatorTools.createPage`）。SOUSAKU AI を参考にした構成で、左メニュー（スマホはドロワー）から移動します。上部バーとメニューには常に「fancloudに戻る」があります。実際の生成は行いません。

| 階層 | ファイル | 内容 |
|---|---|---|
| トップ | `studio.html` | インスピレーション（Agent入力、ピックアップモデル、作品一覧）。`?cat=image/video/music/llm` で絞り込み |
| 第2 | `studio-detail.html?id=i1` | 作品・プロンプト詳細（`&from=history` で履歴の作品詳細） |
| 第1 | `studio-models.html` | モデルリスト / `?tab=rank` ランキング |
| 第2 | `studio-model.html?id=…` | モデル詳細 |
| 第1 | `studio-image.html` / `studio-video.html` / `studio-music.html` | 作成フォーム＋結果（`?tab=history` で履歴） |
| 第1 | `studio-characters.html` | ディスカバリー / `?tab=mine` / `?tab=fav` |
| 第2 | `studio-character.html?id=k1` | キャラクター詳細 |

**ポップアップ**: fancloud側からStudioを開くたびに表示されます（Studio内の移動では出ません。`?nopopup=1` で非表示）。画像は `assets/popup/studio-pop.png`、ボタン文言・遷移先は `config.js` の `studio.popup` で変更できます。ボタンは Agent を選んだ状態のインスピレーション（`studio.html?agent=1`）へ移動します。

データ（作品・モデル・キャラクター・履歴）は `js/config.js` の `studio` にあります。モデル名・数値はすべてダミー、構成の一部は推測です（「推測」タグ）。

### クリエイター用ページについて（推測を含みます）

公式のクリエイター画面は確認できていないため、解説記事などで確認できた範囲（マイページ→新規投稿→画像/動画→説明文→公開範囲〔全員/有料プラン会員のみ〕→投稿、画像10MB・JPG/PNG、動画MP4、プラン作成）を土台に、残りは想定で作っています。
想定の項目には黄色い「推測」タグが付きます（単品販売・予約投稿・ジャンルタグ・プラン紐付け・投稿管理・メニュー構成など）。タグは `js/config.js` の `creatorTools.showAssumptionTags: false` で消せます。

- 投稿した内容はブラウザ（localStorage）に保存され、ホーム・クリエイターページ・投稿詳細にも反映されます（ログインユーザーは `creatorTools.me` のクリエイター）。
- 選んだ画像・動画はブラウザ内で縮小したサムネイルだけを保存します（ファイル自体は送信されません。動画は再生不可）。保存容量が足りない時は警告が出ます。
- 予約投稿は、指定時刻を過ぎたあとにページを開くと「公開中」として扱われます。
- 売上・口座・プロフィール編集は「準備中」表示のみです。
- 編集時は先頭（カバー）の1枚のみ引き継ぎます。

## 素材・文言の差し替え方

### 1) 画像を差し替える（フォルダの中身を入れ替える）

`assets/` 以下のフォルダに、**同じファイル名で上書き**するだけで切り替わります。

| フォルダ | ファイル名（すべて .png） | 用途 | 現在のサイズ / 比率 |
|---|---|---|---|
| `assets/logo/` | `logo.png`, `logo-mark.png` | ヘッダー/サイドバーのロゴ | 568×144（横長・透過） / 144×144 |
| `assets/banners/` | `banner-01` 〜 `banner-04` | ホームのバナー | 1280×720（16:9） |
| `assets/creators/` | `avatar-01` 〜 `avatar-08` | クリエイターのアイコン | 512×512（1:1） |
| `assets/creators/` | `cover-01` 〜 `cover-08` | プロフィールのカバー画像 | 1920×640（3:1） |
| `assets/posts/` | `post-01` 〜 `post-24` | 投稿サムネイル | 960×1200（4:5） |
| `assets/common/` | `placeholder.png` | 画像が見つからない時の代替 | 960×1200 |

※ サイズは目安です。比率が違う画像でも、枠に合わせて中央を基準に切り抜いて表示されます（ロゴだけは高さ固定で、幅は自動）。

- 既定はすべて **PNG** です。jpg / webp の画像に替える場合は、`js/config.js` の `assets.folders` の `ext` を変更します。
  - 例: `ext: 'jpg'` … すべて .jpg を読み込み
  - `ext: 'auto'` … jpg → png → webp → jpeg → gif の順に探して、最初に見つかったものを使用
    （一部だけ別形式で差し替えたい時に便利です。同名の .png が残っていても構いません）
- ロゴだけは `ext` ではなく、`config.js` の `assets.logo.wide` / `assets.logo.mark` にファイル名（拡張子込み）を書きます。
- 画像の枚数を増減したら、同じ箇所の `count` を合わせてください（足りない分は先頭から繰り返し表示されます）。
- 画像が見つからない場合は `assets/common/placeholder.png` が表示されます。
- バナーに文字入りの画像を使う場合は、`config.js` の `banners` で `overlay: false` にすると文字の重ね表示を消せます。

### 2) 文言・データを変える

`js/config.js` を編集します（テキストエディタで開けます）。

- `site` … サイト名・コピーライト
- `theme.primary` … メインカラー（既定 `#ff3700`）
- `text` … ナビ名、見出し、ボタン、ポップアップの文言
- `banners` / `genres` / `creators` / `posts` / `comments` / `messages` / `notifications` … 表示するデータ
- `defaultView` … 初期の表示モード（`'mobile'` / `'pc'` / `'auto'`）
- `popups` … 起動時ポップアップのオン・オフ
- `creatorTools` … クリエイター用ページの設定（対象クリエイター、推測タグの表示、上限値）
- `text.creator` … クリエイター用ページの文言

## 動き・機能（モックで再現しているもの）

- バナーの自動スライド＋ドット、横スクロールのカード列（PCはマウスドラッグ対応）
- 下部タブバー（スマホ）/ 左サイドナビ（PC）、「7万件が見放題!」の吹き出し
- いいね・フォロー・保存（ブラウザに記憶）、コメント投稿、チャットの自動返信
- 有料投稿のロック表示（ぼかし）とプラン選択のボトムシート
- 起動時のポップアップ、トースト通知、スクロールで要素がふわっと表示
- 画像の読み込み中シマー表示、読み込み後のフェードイン

※ 決済・送信・動画再生など実際の処理は行いません（デザイン確認用）。

## 動作環境

- Google Chrome（Mac / Windows）の最新版を想定しています。Edge / Safari でも概ね動作します。
- 日本語フォントは Hiragino / Yu Gothic UI / Meiryo / Noto Sans JP の順で自動選択します。
- ファイル名・パスはすべて半角英数字・相対パスなので、フォルダを別の場所に移動しても動きます。

## フォルダ構成

```
myfans-mock/
├─ index.html ほか各ページ .html（creator-home / post-new / post-manage / plan-settings を含む）
├─ css/style.css
├─ js/
│  ├─ config.js   ← 画像・文言・データの設定（ここを編集）
│  └─ app.js      ← 描画・動きのプログラム
└─ assets/
   ├─ logo/  banners/  creators/  posts/  common/
```
