// 母版內建 UI 文案（zh-TW）。這裡放的是「引擎層固定文字」（按鈕、通用標籤），
// 不是客戶內容——客戶自己的站名／導覽列文字／文章內容不進這個檔案，那些在 site.config.ts。
const messages = {
  'home.toolsHeading': '工具',
  'home.blogHeading': '文章',
  'home.blogDescription': '閱讀最新攻略文章',

  'tools.pageTitle': '工具',
  'tools.faqHeading': '常見問題',
  'tools.notFound': '找不到這個工具。',
  'tools.misconfigured': '這個工具設定不完整。',

  'blog.pageTitle': '文章',
  'blog.empty': '文章準備中，敬請期待',
  'blog.backToList': '← 回到所有文章',
  'blog.backToTools': '回到工具頁 →',
  'blog.updatedAt': '（最後更新：{date}）',

  'notFound.title': '找不到這個頁面',
  'notFound.body': '你搜尋的頁面不存在或已被移除。',
  'notFound.cta': '回到首頁',

  'header.menuLabel': '選單',
  'footer.quickLinksHeading': '快速連結',
  'footer.aboutHeading': '關於',

  'admin.headerTitle': '後台',
  'admin.navPosts': '文章',
  'admin.navSeo': 'SEO',
  'admin.navFrontend': '前台',
  'admin.logout': '登出',
  'admin.noDbBanner': '尚未設定 Supabase，後台為唯讀示範模式：新增／編輯／刪除文章不會真的寫入資料庫。',
  'admin.loginTitle': '後台登入',
  'admin.passwordLabel': '密碼',
  'admin.passwordPlaceholder': '輸入管理員密碼',
  'admin.loginButton': '登入',
  'admin.seoPlaceholder': 'GSC 儀表板尚未接入，將於 MVP 5 補上 lib/gsc.ts 與抓取腳本後啟用。',
  'admin.faqHeading': 'FAQ（選填）',
  'admin.faqQuestionLabel': '問題',
  'admin.faqAnswerLabel': '答案',
  'admin.faqQuestionPlaceholder': '輸入問題',
  'admin.faqAnswerPlaceholder': '輸入答案',
  'admin.faqAddButton': '＋ 新增一題',
  'admin.faqRemoveButton': '刪除',

  'about.metaTitle': '關於我們',
  'about.heading': '關於 {siteName}',
  'about.whoWeAreHeading': '我們是誰',
  'about.contactHeading': '聯絡我們',

  'disclaimer.metaTitle': '免責聲明',
  'disclaimer.subtitle': '使用本站前，請詳閱以下說明',
  'disclaimer.referenceOnlyHeading': '僅供參考',
  'disclaimer.referenceOnlyBody':
    '{siteName} 提供的計算結果均為根據公開資料推算的參考數字，不構成投資、財務或消費建議。實際結果可能因個別條件而有落差。',
  'disclaimer.affiliateHeading': '聯盟行銷揭露',
  'disclaimer.contactPrefix': '若對本站資訊有任何疑問，歡迎參考',
  'disclaimer.contactLinkText': '關於我們',
  'disclaimer.contactSuffix': '頁面的聯絡方式與我們聯繫。',
} as const

export default messages
