module.exports = {
  locales: [
    {
      code: "en",
      lang: "en",
      label: "English",
      strings: {
        title: "OpenRevenue | SDK-agnostic revenue backend",
        description:
          "OpenRevenue is an SDK-agnostic revenue backend on Cloudflare Workers. Ship subscription infra in minutes.",
        keywords:
          "open revenue, subscription backend, revenue infrastructure, cloudflare workers, app subscriptions",
        skipToContent: "Skip to main content",
        navDeploy: "Deploy",
        navGithub: "GitHub",
        languageLabel: "Language",
        eyebrow: "SDK-agnostic revenue backend",
        heroTitle: "Open source app subscription infrastructure from the edge.",
        heroLead:
          "OpenRevenue is the worker-first backend for your revenue SDKs. Keep customer data in your Cloudflare account while shipping receipts, entitlements, and analytics-ready events.",
        heroSubnote: "Open source, MIT licensed.",
        ctaDeploy: "Deploy to Cloudflare",
        stackTitle: "Built for scale, cost control, and deployment speed",
        stackBody:
          "A SDK-agnostic stack that runs on Cloudflare Workers, keeps data in your account, and scales with traffic while staying cost-efficient. Your biggest unavoidable cost is the platform fee from Apple & Google, so the rest of the stack stays lean and usage-based.",
        pillHono: "Hono + TypeScript",
        pillD1: "D1 core storage",
        pillSdk: "SDK base URL ready",
        metricScaleLabel: "Scale",
        metricScaleValue: "Edge-native by default",
        metricCostLabel: "Cost control",
        metricCostValue: "Usage-based, no servers",
        metricAgencyLabel: "Agency",
        metricAgencyValue: "Own the stack, no lock-in",
        region: "Region: Earth",
        platformTitle: "OpenRevenue platform",
        platformBody:
          "A clean, SDK-agnostic API that runs in a single worker and scales with your traffic.",
        receiptsTitle: "Receipts",
        receiptsBody:
          "Store purchase proofs from the App Store and Play Store, verify them consistently, and map active subscriptions to entitlements without stitching multiple services together.",
        customersTitle: "Customers",
        customersBody:
          "Serve a unified customer info endpoint with SDK-friendly shapes, including subscriptions, entitlements, and history, so every client gets the same truth.",
        webhooksTitle: "Webhooks",
        webhooksBody:
          "Push renewal, cancellation, and billing events into your stack so downstream systems stay in sync without manual polling.",
        workflowsTitle: "Go from receipt to entitlement in minutes",
        workflowsBody:
          "Start with a lean schema today and keep it as simple or powerful as you need. The core tables cover receipts, customers, subscriptions, and entitlements so you can ship quickly without losing flexibility.",
        storeValidationTitle: "Store validation",
        storeValidationBody:
          "Connect App Store and Play Store receipts, normalize them into a single shape, and keep verifications close to your edge runtime.",
        entitlementsTitle: "Entitlements",
        entitlementsBody:
          "Map purchases to access tiers automatically and return a consistent entitlement payload to every SDK client.",
        identityTitle: "Identity",
        identityBody:
          "Keep user identity clean with app user IDs, attributes, and a unified customer profile that stays in your own storage.",
        deployTitle: "Deploy without boundaries",
        deployBody:
          "Launch your own worker in minutes and drop the base URL into your SDK config.",
        deployRow1: "Deploy from GitHub",
        deployCta: "Deploy to Cloudflare",
        deployRow2: "Seed an API key",
        deployRow3: "Point the SDK base URL",
        footerLine1: "OpenRevenue is open source, edge-first, and designed for parity.",
        footerLine2: "Launch today, evolve as you scale.",
        footerLinkDeploy: "Deploy"
      }
    },
    {
      code: "ru",
      lang: "ru",
      label: "Русский",
      strings: {
        title: "OpenRevenue | Универсальный бэкенд для монетизации",
        description:
          "OpenRevenue — SDK-agnostic бэкенд монетизации на Cloudflare Workers. Запускайте подписки за минуты.",
        keywords:
          "open revenue, бэкенд подписок, инфраструктура монетизации, cloudflare workers, подписки приложений",
        skipToContent: "Перейти к основному содержимому",
        navDeploy: "Деплой",
        navGithub: "GitHub",
        languageLabel: "Язык",
        eyebrow: "Универсальный бэкенд монетизации",
        heroTitle: "Открытая инфраструктура подписок для приложений на краю.",
        heroLead:
          "OpenRevenue — воркер‑ориентированный бэкенд для ваших SDK монетизации. Храните данные клиентов в своём аккаунте Cloudflare и обрабатывайте чеки, энтитлменты и аналитические события.",
        heroSubnote: "Открытый исходный код, лицензия MIT.",
        ctaDeploy: "Развернуть в Cloudflare",
        stackTitle: "Масштабирование, контроль затрат и скорость запуска",
        stackBody:
          "SDK‑agnostic стек на Cloudflare Workers хранит данные в вашем аккаунте и масштабируется вместе с трафиком, оставаясь экономичным. Самая неизбежная статья расходов — комиссия Apple и Google, поэтому остальная часть стека лёгкая и оплачивается по факту использования.",
        pillHono: "Hono + TypeScript",
        pillD1: "D1 — основное хранилище",
        pillSdk: "Базовый URL для SDK",
        metricScaleLabel: "Масштаб",
        metricScaleValue: "Edge‑native по умолчанию",
        metricCostLabel: "Контроль затрат",
        metricCostValue: "Оплата по использованию, без серверов",
        metricAgencyLabel: "Контроль",
        metricAgencyValue: "Владейте стеком, без lock‑in",
        region: "Регион: Земля",
        platformTitle: "Платформа OpenRevenue",
        platformBody:
          "Чистый SDK‑agnostic API, работающий в одном воркере и масштабируемый под ваш трафик.",
        receiptsTitle: "Чеки",
        receiptsBody:
          "Храните подтверждения покупок из App Store и Play Store, стабильно проверяйте их и сопоставляйте активные подписки с энтитлментами без сшивания нескольких сервисов.",
        customersTitle: "Клиенты",
        customersBody:
          "Единая точка доступа к данным клиента со структурами, дружественными SDK, включая подписки, энтитлменты и историю, чтобы все клиенты получали единую истину.",
        webhooksTitle: "Вебхуки",
        webhooksBody:
          "Отправляйте события продления, отмены и биллинга в вашу инфраструктуру, чтобы downstream‑системы синхронизировались без ручного опроса.",
        workflowsTitle: "От чека до доступа за минуты",
        workflowsBody:
          "Начните с простой схемы и развивайте её по мере роста. Базовые таблицы покрывают чеки, клиентов, подписки и энтитлменты, чтобы вы быстро запускались без потери гибкости.",
        storeValidationTitle: "Проверка магазинов",
        storeValidationBody:
          "Подключайте чеки App Store и Play Store, нормализуйте их в единый формат и держите верификацию рядом с edge‑средой.",
        entitlementsTitle: "Энтитлменты",
        entitlementsBody:
          "Автоматически сопоставляйте покупки с уровнями доступа и возвращайте единый payload энтитлментов всем SDK‑клиентам.",
        identityTitle: "Идентичность",
        identityBody:
          "Держите идентификаторы пользователей в порядке с app user ID, атрибутами и единым профилем клиента в вашем хранилище.",
        deployTitle: "Деплой без границ",
        deployBody:
          "Запустите свой воркер за минуты и укажите базовый URL в конфигурации SDK.",
        deployRow1: "Деплой из GitHub",
        deployCta: "Развернуть в Cloudflare",
        deployRow2: "Сгенерировать API‑ключ",
        deployRow3: "Указать базовый URL SDK",
        footerLine1: "OpenRevenue с открытым исходным кодом, edge‑first и рассчитан на паритет.",
        footerLine2: "Запускайтесь сегодня и развивайтесь по мере роста.",
        footerLinkDeploy: "Деплой"
      }
    },
    {
      code: "ko",
      lang: "ko",
      label: "한국어",
      strings: {
        title: "OpenRevenue | SDK-agnostic 수익 백엔드",
        description:
          "OpenRevenue는 Cloudflare Workers에서 동작하는 SDK-agnostic 수익 백엔드입니다. 몇 분 만에 구독 인프라를 출시하세요.",
        keywords:
          "open revenue, 구독 백엔드, 수익 인프라, cloudflare workers, 앱 구독",
        skipToContent: "본문으로 건너뛰기",
        navDeploy: "배포",
        navGithub: "GitHub",
        languageLabel: "언어",
        eyebrow: "SDK-agnostic 수익 백엔드",
        heroTitle: "엣지에서 동작하는 오픈 소스 앱 구독 인프라.",
        heroLead:
          "OpenRevenue는 수익 SDK를 위한 워커 기반 백엔드입니다. Cloudflare 계정에 고객 데이터를 보관하면서 영수증, 권한, 분석 이벤트를 처리하세요.",
        heroSubnote: "오픈 소스, MIT 라이선스.",
        ctaDeploy: "Cloudflare에 배포",
        stackTitle: "확장성, 비용 제어, 빠른 배포를 위해 설계",
        stackBody:
          "Cloudflare Workers 위에서 동작하는 SDK-agnostic 스택으로, 데이터는 여러분 계정에 남고 트래픽에 따라 확장되면서도 비용 효율을 유지합니다. 피할 수 없는 비용은 Apple과 Google의 수수료이므로 나머지는 가볍고 사용량 기반으로 유지됩니다.",
        pillHono: "Hono + TypeScript",
        pillD1: "D1 핵심 스토리지",
        pillSdk: "SDK 기본 URL 준비",
        metricScaleLabel: "확장성",
        metricScaleValue: "엣지 네이티브 기본",
        metricCostLabel: "비용 제어",
        metricCostValue: "사용량 기반, 서버 없음",
        metricAgencyLabel: "주도권",
        metricAgencyValue: "스택 소유, 락인 없음",
        region: "지역: 지구",
        platformTitle: "OpenRevenue 플랫폼",
        platformBody:
          "단일 워커에서 동작하는 깔끔한 SDK-agnostic API로 트래픽에 맞춰 확장됩니다.",
        receiptsTitle: "영수증",
        receiptsBody:
          "App Store와 Play Store의 구매 증빙을 저장하고 일관되게 검증해 활성 구독을 권한으로 매핑합니다. 여러 서비스를 억지로 연결할 필요가 없습니다.",
        customersTitle: "고객",
        customersBody:
          "구독, 권한, 히스토리를 포함한 SDK 친화적 형태의 단일 고객 정보 엔드포인트를 제공해 모든 클라이언트가 같은 진실을 보게 합니다.",
        webhooksTitle: "웹훅",
        webhooksBody:
          "갱신, 취소, 결제 이벤트를 시스템으로 전송해 폴링 없이 동기화를 유지하세요.",
        workflowsTitle: "영수증에서 권한까지, 몇 분",
        workflowsBody:
          "오늘은 단순한 스키마로 시작하고 필요에 따라 확장하세요. 핵심 테이블이 영수증, 고객, 구독, 권한을 커버해 유연성을 잃지 않고 빠르게 출시할 수 있습니다.",
        storeValidationTitle: "스토어 검증",
        storeValidationBody:
          "App Store와 Play Store 영수증을 연결해 단일 포맷으로 정규화하고 엣지 런타임 근처에서 검증을 수행합니다.",
        entitlementsTitle: "권한",
        entitlementsBody:
          "구매를 접근 단계로 자동 매핑하고 모든 SDK 클라이언트에 일관된 권한 페이로드를 반환합니다.",
        identityTitle: "아이덴티티",
        identityBody:
          "앱 사용자 ID, 속성, 통합 고객 프로필로 사용자 정체성을 깔끔하게 유지하고 데이터를 자체 스토리지에 보관합니다.",
        deployTitle: "제약 없는 배포",
        deployBody:
          "몇 분 만에 워커를 배포하고 SDK 설정에 기본 URL을 넣으세요.",
        deployRow1: "GitHub에서 배포",
        deployCta: "Cloudflare에 배포",
        deployRow2: "API 키 생성",
        deployRow3: "SDK 기본 URL 지정",
        footerLine1: "OpenRevenue는 오픈 소스이며 엣지 우선으로 설계되었습니다.",
        footerLine2: "오늘 시작해 규모에 맞게 성장하세요.",
        footerLinkDeploy: "배포"
      }
    },
    {
      code: "ja",
      lang: "ja",
      label: "日本語",
      strings: {
        title: "OpenRevenue | SDK非依存の収益バックエンド",
        description:
          "OpenRevenue は Cloudflare Workers 上で動作する SDK 非依存の収益バックエンドです。数分でサブスク基盤を立ち上げられます。",
        keywords:
          "open revenue, サブスク バックエンド, 収益 インフラ, cloudflare workers, アプリ 課金",
        skipToContent: "本文へスキップ",
        navDeploy: "デプロイ",
        navGithub: "GitHub",
        languageLabel: "言語",
        eyebrow: "SDK非依存の収益バックエンド",
        heroTitle: "エッジで動くオープンソースのアプリ課金基盤。",
        heroLead:
          "OpenRevenue は収益 SDK 向けのワーカーベースのバックエンドです。顧客データを Cloudflare アカウントに保持したまま、レシート、権利、分析イベントを処理できます。",
        heroSubnote: "オープンソース、MIT ライセンス。",
        ctaDeploy: "Cloudflare にデプロイ",
        stackTitle: "スケール、コスト管理、迅速なデプロイのために",
        stackBody:
          "Cloudflare Workers 上で動く SDK 非依存スタック。データはあなたのアカウントに残り、トラフィックに合わせて拡張しながらコスト効率を維持します。避けられないコストは Apple と Google の手数料なので、それ以外は軽量で従量課金に保ちます。",
        pillHono: "Hono + TypeScript",
        pillD1: "D1 コアストレージ",
        pillSdk: "SDK ベースURL対応",
        metricScaleLabel: "スケール",
        metricScaleValue: "エッジネイティブが標準",
        metricCostLabel: "コスト管理",
        metricCostValue: "従量課金、サーバー不要",
        metricAgencyLabel: "主導権",
        metricAgencyValue: "スタックを所有、ロックインなし",
        region: "リージョン: Earth",
        platformTitle: "OpenRevenue プラットフォーム",
        platformBody:
          "単一のワーカーで動くクリーンな SDK 非依存 API。トラフィックに合わせてスケールします。",
        receiptsTitle: "レシート",
        receiptsBody:
          "App Store と Play Store の購入証明を保存し、安定して検証してアクティブなサブスクを権利に紐づけます。複数サービスの継ぎはぎは不要です。",
        customersTitle: "顧客",
        customersBody:
          "サブスク、権利、履歴を含む SDK 向けの形で、統一された顧客情報エンドポイントを提供します。",
        webhooksTitle: "Webhook",
        webhooksBody:
          "更新・解約・請求イベントをスタックへ送信し、ポーリングなしで同期を維持します。",
        workflowsTitle: "レシートから権利まで数分",
        workflowsBody:
          "まずはシンプルなスキーマで開始し、必要に応じて拡張。中核テーブルでレシート、顧客、サブスク、権利をカバーし、柔軟性を保って迅速に出荷できます。",
        storeValidationTitle: "ストア検証",
        storeValidationBody:
          "App Store と Play Store のレシートを接続し単一形式に正規化、検証をエッジ近くで行います。",
        entitlementsTitle: "権利",
        entitlementsBody:
          "購入をアクセス階層に自動マッピングし、どの SDK クライアントにも一貫した権利ペイロードを返します。",
        identityTitle: "アイデンティティ",
        identityBody:
          "app user ID、属性、統合顧客プロファイルでユーザー識別を整理し、自分のストレージに保持します。",
        deployTitle: "境界のないデプロイ",
        deployBody:
          "数分でワーカーを立ち上げ、SDK 設定にベース URL を設定します。",
        deployRow1: "GitHub からデプロイ",
        deployCta: "Cloudflare にデプロイ",
        deployRow2: "API キーを用意",
        deployRow3: "SDK ベースURLを設定",
        footerLine1: "OpenRevenue はオープンソースで、エッジファーストに設計されています。",
        footerLine2: "今日始めて、成長に合わせて進化させましょう。",
        footerLinkDeploy: "デプロイ"
      }
    },
    {
      code: "zh-Hans",
      lang: "zh-Hans",
      label: "简体中文",
      strings: {
        title: "OpenRevenue | 与 SDK 无关的收入后端",
        description:
          "OpenRevenue 是运行在 Cloudflare Workers 上的与 SDK 无关的收入后端。几分钟内即可上线订阅基础设施。",
        keywords:
          "open revenue, 订阅后端, 收入基础设施, cloudflare workers, 应用订阅",
        skipToContent: "跳到主要内容",
        navDeploy: "部署",
        navGithub: "GitHub",
        languageLabel: "语言",
        eyebrow: "与 SDK 无关的收入后端",
        heroTitle: "来自边缘的开源应用订阅基础设施。",
        heroLead:
          "OpenRevenue 是面向收入 SDK 的工作线程后端。将客户数据保存在你的 Cloudflare 账户中，同时处理收据、权益和分析事件。",
        heroSubnote: "开源，MIT 许可。",
        ctaDeploy: "部署到 Cloudflare",
        stackTitle: "为规模、成本控制与部署速度而生",
        stackBody:
          "运行在 Cloudflare Workers 的与 SDK 无关技术栈，数据留在你的账户中，随流量扩展同时保持成本高效。不可避免的成本是 Apple 与 Google 的平台抽成，因此其余部分保持轻量、按量计费。",
        pillHono: "Hono + TypeScript",
        pillD1: "D1 核心存储",
        pillSdk: "SDK 基础 URL 就绪",
        metricScaleLabel: "规模",
        metricScaleValue: "默认边缘原生",
        metricCostLabel: "成本控制",
        metricCostValue: "按量计费，无服务器",
        metricAgencyLabel: "主导权",
        metricAgencyValue: "拥有技术栈，无锁定",
        region: "区域：地球",
        platformTitle: "OpenRevenue 平台",
        platformBody:
          "干净的与 SDK 无关 API，运行在单个 worker 中并随流量扩展。",
        receiptsTitle: "收据",
        receiptsBody:
          "保存来自 App Store 与 Play Store 的购买凭证，稳定验证，并将活跃订阅映射为权益，无需拼接多个服务。",
        customersTitle: "客户",
        customersBody:
          "提供统一的客户信息端点，包含订阅、权益与历史记录，所有客户端获得一致的数据。",
        webhooksTitle: "Webhook",
        webhooksBody:
          "将续订、取消与计费事件推送到你的系统，无需手动轮询即可保持同步。",
        workflowsTitle: "从收据到权益，只需数分钟",
        workflowsBody:
          "从轻量模式开始，按需增强。核心表覆盖收据、客户、订阅与权益，既能快速上线又不失灵活。",
        storeValidationTitle: "商店验证",
        storeValidationBody:
          "接入 App Store 与 Play Store 收据，归一化为统一结构，并将验证放在边缘运行时附近。",
        entitlementsTitle: "权益",
        entitlementsBody:
          "自动将购买映射到访问层级，并为所有 SDK 客户端返回一致的权益载荷。",
        identityTitle: "身份",
        identityBody:
          "通过应用用户 ID、属性和统一客户档案保持身份干净，数据留在你的存储中。",
        deployTitle: "无边界部署",
        deployBody:
          "几分钟内启动 worker，并在 SDK 配置中填入基础 URL。",
        deployRow1: "从 GitHub 部署",
        deployCta: "部署到 Cloudflare",
        deployRow2: "生成 API 密钥",
        deployRow3: "设置 SDK 基础 URL",
        footerLine1: "OpenRevenue 是开源、边缘优先并为对齐而设计。",
        footerLine2: "今天就开始，随着规模演进。",
        footerLinkDeploy: "部署"
      }
    },
    {
      code: "zh-Hant",
      lang: "zh-Hant",
      label: "繁體中文",
      strings: {
        title: "OpenRevenue | 與 SDK 無關的營收後端",
        description:
          "OpenRevenue 是運行在 Cloudflare Workers 上的與 SDK 無關的營收後端。幾分鐘內即可上線訂閱基礎設施。",
        keywords:
          "open revenue, 訂閱後端, 營收基礎設施, cloudflare workers, 應用訂閱",
        skipToContent: "跳至主要內容",
        navDeploy: "部署",
        navGithub: "GitHub",
        languageLabel: "語言",
        eyebrow: "與 SDK 無關的營收後端",
        heroTitle: "來自邊緣的開源應用訂閱基礎設施。",
        heroLead:
          "OpenRevenue 是面向營收 SDK 的工作執行緒後端。將客戶資料保存在你的 Cloudflare 帳戶中，同時處理收據、權益與分析事件。",
        heroSubnote: "開源，MIT 授權。",
        ctaDeploy: "部署到 Cloudflare",
        stackTitle: "為規模、成本控制與部署速度而生",
        stackBody:
          "運行在 Cloudflare Workers 的與 SDK 無關技術棧，資料留在你的帳戶中，隨流量擴展同時保持成本效率。不可避免的成本是 Apple 與 Google 的平台抽成，因此其餘部分保持輕量、按量計費。",
        pillHono: "Hono + TypeScript",
        pillD1: "D1 核心儲存",
        pillSdk: "SDK 基礎 URL 就緒",
        metricScaleLabel: "規模",
        metricScaleValue: "預設邊緣原生",
        metricCostLabel: "成本控制",
        metricCostValue: "按量計費，無伺服器",
        metricAgencyLabel: "主導權",
        metricAgencyValue: "擁有技術棧，無鎖定",
        region: "區域：地球",
        platformTitle: "OpenRevenue 平台",
        platformBody:
          "乾淨的與 SDK 無關 API，在單一 worker 中運行並隨流量擴展。",
        receiptsTitle: "收據",
        receiptsBody:
          "保存來自 App Store 與 Play Store 的購買憑證，穩定驗證，並將有效訂閱映射為權益，無需拼接多個服務。",
        customersTitle: "客戶",
        customersBody:
          "提供統一的客戶資訊端點，包含訂閱、權益與歷史記錄，所有用戶端取得一致資料。",
        webhooksTitle: "Webhook",
        webhooksBody:
          "將續訂、取消與計費事件推送到你的系統，無需手動輪詢即可保持同步。",
        workflowsTitle: "從收據到權益，只需數分鐘",
        workflowsBody:
          "從精簡模式開始，按需增強。核心資料表涵蓋收據、客戶、訂閱與權益，既能快速上線又不失彈性。",
        storeValidationTitle: "商店驗證",
        storeValidationBody:
          "連接 App Store 與 Play Store 收據，正規化為單一格式，並在邊緣執行驗證。",
        entitlementsTitle: "權益",
        entitlementsBody:
          "自動將購買映射到存取層級，並為所有 SDK 用戶端返回一致的權益載荷。",
        identityTitle: "身分",
        identityBody:
          "透過應用使用者 ID、屬性與統一客戶檔案維持身分整潔，資料留在你的儲存中。",
        deployTitle: "無邊界部署",
        deployBody:
          "幾分鐘內啟動 worker，並在 SDK 設定中填入基礎 URL。",
        deployRow1: "從 GitHub 部署",
        deployCta: "部署到 Cloudflare",
        deployRow2: "建立 API 金鑰",
        deployRow3: "設定 SDK 基礎 URL",
        footerLine1: "OpenRevenue 是開源、邊緣優先並為對齊而設計。",
        footerLine2: "今天就開始，隨著規模演進。",
        footerLinkDeploy: "部署"
      }
    },
    {
      code: "zh-HK",
      lang: "zh-HK",
      label: "繁體中文（香港）",
      strings: {
        title: "OpenRevenue | 與 SDK 無關的營收後端",
        description:
          "OpenRevenue 是運行在 Cloudflare Workers 上的與 SDK 無關的營收後端。幾分鐘內即可上線訂閱基礎設施。",
        keywords:
          "open revenue, 訂閱後端, 營收基礎設施, cloudflare workers, 應用訂閱",
        skipToContent: "跳至主要內容",
        navDeploy: "部署",
        navGithub: "GitHub",
        languageLabel: "語言",
        eyebrow: "與 SDK 無關的營收後端",
        heroTitle: "來自邊緣的開源應用訂閱基礎設施。",
        heroLead:
          "OpenRevenue 是面向營收 SDK 的工作執行緒後端。將客戶資料保存在你的 Cloudflare 帳戶中，同時處理收據、權益與分析事件。",
        heroSubnote: "開源，MIT 授權。",
        ctaDeploy: "部署到 Cloudflare",
        stackTitle: "為規模、成本控制與部署速度而生",
        stackBody:
          "運行在 Cloudflare Workers 的與 SDK 無關技術棧，資料留在你的帳戶中，隨流量擴展同時保持成本效率。不可避免的成本是 Apple 與 Google 的平台抽成，因此其餘部分保持輕量、按量計費。",
        pillHono: "Hono + TypeScript",
        pillD1: "D1 核心儲存",
        pillSdk: "SDK 基礎 URL 就緒",
        metricScaleLabel: "規模",
        metricScaleValue: "預設邊緣原生",
        metricCostLabel: "成本控制",
        metricCostValue: "按量計費，無伺服器",
        metricAgencyLabel: "主導權",
        metricAgencyValue: "擁有技術棧，無鎖定",
        region: "區域：地球",
        platformTitle: "OpenRevenue 平台",
        platformBody:
          "乾淨的與 SDK 無關 API，在單一 worker 中運行並隨流量擴展。",
        receiptsTitle: "收據",
        receiptsBody:
          "保存來自 App Store 與 Play Store 的購買憑證，穩定驗證，並將有效訂閱映射為權益，無需拼接多個服務。",
        customersTitle: "客戶",
        customersBody:
          "提供統一的客戶資訊端點，包含訂閱、權益與歷史記錄，所有用戶端取得一致資料。",
        webhooksTitle: "Webhook",
        webhooksBody:
          "將續訂、取消與計費事件推送到你的系統，無需手動輪詢即可保持同步。",
        workflowsTitle: "從收據到權益，只需數分鐘",
        workflowsBody:
          "從精簡模式開始，按需增強。核心資料表涵蓋收據、客戶、訂閱與權益，既能快速上線又不失彈性。",
        storeValidationTitle: "商店驗證",
        storeValidationBody:
          "連接 App Store 與 Play Store 收據，正規化為單一格式，並在邊緣執行驗證。",
        entitlementsTitle: "權益",
        entitlementsBody:
          "自動將購買映射到存取層級，並為所有 SDK 用戶端返回一致的權益載荷。",
        identityTitle: "身分",
        identityBody:
          "透過應用使用者 ID、屬性與統一客戶檔案維持身分整潔，資料留在你的儲存中。",
        deployTitle: "無邊界部署",
        deployBody:
          "幾分鐘內啟動 worker，並在 SDK 設定中填入基礎 URL。",
        deployRow1: "從 GitHub 部署",
        deployCta: "部署到 Cloudflare",
        deployRow2: "建立 API 金鑰",
        deployRow3: "設定 SDK 基礎 URL",
        footerLine1: "OpenRevenue 是開源、邊緣優先並為對齊而設計。",
        footerLine2: "今天就開始，隨著規模演進。",
        footerLinkDeploy: "部署"
      }
    },
    {
      code: "zh-TW",
      lang: "zh-TW",
      label: "繁體中文（台灣）",
      strings: {
        title: "OpenRevenue | 與 SDK 無關的營收後端",
        description:
          "OpenRevenue 是運行在 Cloudflare Workers 上的與 SDK 無關的營收後端。幾分鐘內即可上線訂閱基礎設施。",
        keywords:
          "open revenue, 訂閱後端, 營收基礎設施, cloudflare workers, 應用訂閱",
        skipToContent: "跳至主要內容",
        navDeploy: "部署",
        navGithub: "GitHub",
        languageLabel: "語言",
        eyebrow: "與 SDK 無關的營收後端",
        heroTitle: "來自邊緣的開源應用訂閱基礎設施。",
        heroLead:
          "OpenRevenue 是面向營收 SDK 的工作執行緒後端。將客戶資料保存在你的 Cloudflare 帳戶中，同時處理收據、權益與分析事件。",
        heroSubnote: "開源，MIT 授權。",
        ctaDeploy: "部署到 Cloudflare",
        stackTitle: "為規模、成本控制與部署速度而生",
        stackBody:
          "運行在 Cloudflare Workers 的與 SDK 無關技術棧，資料留在你的帳戶中，隨流量擴展同時保持成本效率。不可避免的成本是 Apple 與 Google 的平台抽成，因此其餘部分保持輕量、按量計費。",
        pillHono: "Hono + TypeScript",
        pillD1: "D1 核心儲存",
        pillSdk: "SDK 基礎 URL 就緒",
        metricScaleLabel: "規模",
        metricScaleValue: "預設邊緣原生",
        metricCostLabel: "成本控制",
        metricCostValue: "按量計費，無伺服器",
        metricAgencyLabel: "主導權",
        metricAgencyValue: "擁有技術棧，無鎖定",
        region: "區域：地球",
        platformTitle: "OpenRevenue 平台",
        platformBody:
          "乾淨的與 SDK 無關 API，在單一 worker 中運行並隨流量擴展。",
        receiptsTitle: "收據",
        receiptsBody:
          "保存來自 App Store 與 Play Store 的購買憑證，穩定驗證，並將有效訂閱映射為權益，無需拼接多個服務。",
        customersTitle: "客戶",
        customersBody:
          "提供統一的客戶資訊端點，包含訂閱、權益與歷史記錄，所有用戶端取得一致資料。",
        webhooksTitle: "Webhook",
        webhooksBody:
          "將續訂、取消與計費事件推送到你的系統，無需手動輪詢即可保持同步。",
        workflowsTitle: "從收據到權益，只需數分鐘",
        workflowsBody:
          "從精簡模式開始，按需增強。核心資料表涵蓋收據、客戶、訂閱與權益，既能快速上線又不失彈性。",
        storeValidationTitle: "商店驗證",
        storeValidationBody:
          "連接 App Store 與 Play Store 收據，正規化為單一格式，並在邊緣執行驗證。",
        entitlementsTitle: "權益",
        entitlementsBody:
          "自動將購買映射到存取層級，並為所有 SDK 用戶端返回一致的權益載荷。",
        identityTitle: "身分",
        identityBody:
          "透過應用使用者 ID、屬性與統一客戶檔案維持身分整潔，資料留在你的儲存中。",
        deployTitle: "無邊界部署",
        deployBody:
          "幾分鐘內啟動 worker，並在 SDK 設定中填入基礎 URL。",
        deployRow1: "從 GitHub 部署",
        deployCta: "部署到 Cloudflare",
        deployRow2: "建立 API 金鑰",
        deployRow3: "設定 SDK 基礎 URL",
        footerLine1: "OpenRevenue 是開源、邊緣優先並為對齊而設計。",
        footerLine2: "今天就開始，隨著規模演進。",
        footerLinkDeploy: "部署"
      }
    }
  ]
};
