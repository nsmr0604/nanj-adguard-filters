# nanj-adguard-filters
[なんJ AdGuard部Wiki](https://wikiwiki.jp/nanj-adguard/)に掲載されているフィルタをフェッチして、Adguardカスタムフィルタに設定できるリンク形式にするnode.jsスクリプト

[Render](https://render.com/)・[Fly.io](https://fly.io/)・[Railway](https://railway.app/)などのNode.js/Docker対応のホスティングで動作します。

- Render: リポジトリを接続すると`render.yaml`が使われます。
- Docker: `docker build -t nanj . && docker run -p 3000:3000 nanj`
- 手動: `npm install && npm start` (`PORT`環境変数でポート指定、既定3000)

WikiのHTMLの内容やルールのTitleが変わると動かなくなる。

| フィルタ    | URL |
| ---------- | --- |
| 280blocker | (デプロイ先URL)/280blocker_adblock.txt |
| なんJ改修フィルター | (デプロイ先URL)/nanj-kaishuu-filter.txt |
| なんJ改修DNSフィルター | (デプロイ先URL)/nanj-kaishuu-dns-filter.txt |
| なんJ拡張フィルター：一般ルール | (デプロイ先URL)/supplement-rules.txt |
| なんJ拡張フィルター：DNSルール | (デプロイ先URL)/DNS-rules.txt |
| なんJ拡張フィルター：Paranoidルール | (デプロイ先URL)/paranoid-rules.txt |

## GitHub Pages / GitHub Actions
`.github/workflows/pages.yml` が6時間ごと(および手動・push時)に`node build.js`でフィルタを取得し、静的ファイルとしてGitHub Pagesへ公開します。リポジトリのSettings > Pages > SourceをGitHub Actionsにしてください。URLは`https://<user>.github.io/<repo>/<ファイル名>`です。280blockerはPages上ではリダイレクトできないため、`index.html`に公式URLへのリンクを載せています(AdGuardには公式URLを直接登録してください)。
