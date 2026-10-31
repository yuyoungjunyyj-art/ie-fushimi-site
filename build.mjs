// Ie Fushimi — v01 static build.
// Wraps each page body in src/pages/<lang>/ with the shared head, header and
// footer and writes the result to public/ (English at /, others at /ja/, /zh/, /ko/).
// Also writes artifact/index.html, a single-file preview for sharing.
// Run:  node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dims = JSON.parse(readFileSync(join(root, "src/img-dims.json"), "utf8"));

// Live domain: canonical, hreflang and Open Graph URLs are built from it.
const SITE_URL = "https://ie.house";

// Pre-opening: visitors with the link can see the site, search engines are asked
// not to list it. Set to true when the [TO CONFIRM] items are done.
const ALLOW_SEARCH_INDEXING = false;

const ADDRESS = {
  en: "11-chōme-130 Fukakusa Sujikaibashi, Fushimi-ku, Kyoto 612-0889, Japan",
  ja: "〒612-0889 京都府京都市伏見区深草直違橋11丁目130",
  street: "11-chōme-130 Fukakusa Sujikaibashi",
  locality: "Kyoto",
  region: "Kyoto",
  postcode: "612-0889",
};
const MAPS_QUERY = encodeURIComponent(ADDRESS.ja);

// ---------------------------------------------------------------------------
// Languages
// ---------------------------------------------------------------------------
const LANGS = {
  en: { prefix: "", label: "EN", html: "en", og: "en_GB", font: "" },
  ja: { prefix: "/ja", label: "日本語", html: "ja", og: "ja_JP", font: "&family=Noto+Serif+JP:wght@400;500" },
  zh: { prefix: "/zh", label: "中文", html: "zh-Hans", og: "zh_CN", font: "&family=Noto+Serif+SC:wght@400;500" },
  ko: { prefix: "/ko", label: "한국어", html: "ko", og: "ko_KR", font: "&family=Noto+Serif+KR:wght@400;500" },
};
const LANG_KEYS = Object.keys(LANGS);

const PAGE_KEYS = ["home", "house", "signatures", "atelier", "collaborations"];
const pathOf = (key) => (key === "home" ? "/" : `/${key}/`);

// Interface text for the shared chrome (header, footer, form, meta).
const T = {
  en: {
    skip: "Skip to content", menu: "Menu", navLabel: "Main", homeLabel: "Ie Fushimi — home",
    nav: { house: "The House", signatures: "Signatures", atelier: "Atelier", collaborations: "Collaborations" },
    opening: "Opening spring 2027", enquiries: "Enquiries",
    titles: { home: "Ie Fushimi", house: "The House — Ie Fushimi", signatures: "Signatures — Ie Fushimi", atelier: "Ie Atelier — Ie Fushimi", collaborations: "Collaborations — Ie Fushimi" },
    desc: {
      home: "A house of tea in an old Kyoto machiya near Fushimi Inari. Opening spring 2027.",
      house: "A main house of 1948 and a rear annex of 1931, two wells, a garden at the centre and a room below ground.",
      signatures: "Sparkling gyokuro, sand hearth hojicha chai and brown butter financiers: what they are, how they are made and why.",
      atelier: "Objects the house uses every day — commissioned, tested in the rooms, then made in small editions.",
      collaborations: "Residencies, listening sessions, retreats and small gatherings in a Kyoto machiya. Work that takes time and uses the house as it is.",
    },
    form: {
      title: "Write to the house",
      intro: "For architects, makers, artists, brands, suppliers, press and people who would like to work here.",
      name: "Name", org: "Organisation", optional: "(optional)", email: "Email", country: "Country",
      type: "Enquiry", choose: "Choose one", message: "Message",
      link: "Link", linkHint: "(portfolio or Instagram, optional)", file: "Attachment", fileHint: "(PDF, optional)",
      honeypot: "Leave this empty", send: "Send",
      types: ["Architect / designer", "Craftsperson / maker", "Artist / residency", "Brand collaboration", "Retreat / event", "Vendor / supplier", "Press", "Team / careers"],
      privacy: "We use what you send only to reply to you and to keep a record of our correspondence. It is not shared or sold. You can ask us to delete it at any time. This follows Japan's Act on the Protection of Personal Information (APPI) and the GDPR.",
    },
  },
  ja: {
    skip: "本文へ", menu: "メニュー", navLabel: "メイン", homeLabel: "Ie Fushimi ホーム",
    nav: { house: "家", signatures: "シグネチャー", atelier: "アトリエ", collaborations: "コラボレーション" },
    opening: "2027年春 開業予定", enquiries: "お問い合わせ",
    titles: { home: "Ie Fushimi", house: "家 — Ie Fushimi", signatures: "シグネチャー — Ie Fushimi", atelier: "Ie アトリエ — Ie Fushimi", collaborations: "コラボレーション — Ie Fushimi" },
    desc: {
      home: "伏見稲荷の近く、京都の古い町家にひらく茶の家。2027年春 開業予定。",
      house: "1948年の主屋と1931年の離れ、ふたつの井戸、中心の庭、そして地下の一室。",
      signatures: "スパークリング玉露、砂炉のほうじ茶チャイ、焦がしバターのフィナンシェ。何を、どのように、なぜ。",
      atelier: "家が毎日つかう道具。依頼し、部屋で試し、少しだけつくる。",
      collaborations: "京都の町家でのレジデンシー、リスニング、リトリート、小さな集い。時間をかけ、家をそのまま使う仕事。",
    },
    form: {
      title: "家へのお便り",
      intro: "建築家、つくり手、アーティスト、ブランド、取引先、報道関係の方、そしてここで働きたい方へ。",
      name: "お名前", org: "ご所属", optional: "（任意）", email: "メールアドレス", country: "国・地域",
      type: "お問い合わせの種類", choose: "選択してください", message: "メッセージ",
      link: "リンク", linkHint: "（ポートフォリオまたはInstagram、任意）", file: "添付ファイル", fileHint: "（PDF、任意）",
      honeypot: "空欄のままにしてください", send: "送信",
      types: ["建築家・デザイナー", "職人・つくり手", "アーティスト・レジデンシー", "ブランドとの協業", "リトリート・イベント", "取引先・サプライヤー", "報道関係", "採用"],
      privacy: "お送りいただいた内容は、返信とやりとりの記録のためにのみ使用し、第三者への提供や販売は行いません。削除のご依頼はいつでも承ります。個人情報の保護に関する法律（APPI）およびGDPRに準拠しています。",
    },
  },
  zh: {
    skip: "跳到正文", menu: "菜单", navLabel: "主导航", homeLabel: "Ie Fushimi 首页",
    nav: { house: "家", signatures: "招牌", atelier: "工坊", collaborations: "合作" },
    opening: "2027年春季开业", enquiries: "联系我们",
    titles: { home: "Ie Fushimi", house: "家 — Ie Fushimi", signatures: "招牌 — Ie Fushimi", atelier: "Ie 工坊 — Ie Fushimi", collaborations: "合作 — Ie Fushimi" },
    desc: {
      home: "伏见稻荷附近，一座京都老町家里的茶之家。2027年春季开业。",
      house: "1948年的主屋、1931年的后屋、两口古井、居中的庭院，以及地下的一间房。",
      signatures: "起泡玉露、沙炉焙茶香料奶茶、焦化黄油费南雪：是什么，怎么做，为什么。",
      atelier: "这座房子每天使用的器物——先委托，再在房间里试用，然后少量制作。",
      collaborations: "在京都町家里的驻留、聆听会、静修与小型聚会。需要时间、按房子本来的样子使用它的工作。",
    },
    form: {
      title: "写信给这座房子",
      intro: "致建筑师、手艺人、艺术家、品牌、供应商、媒体，以及希望在这里工作的人。",
      name: "姓名", org: "机构", optional: "（选填）", email: "电子邮箱", country: "国家/地区",
      type: "咨询类型", choose: "请选择", message: "留言",
      link: "链接", linkHint: "（作品集或 Instagram，选填）", file: "附件", fileHint: "（PDF，选填）",
      honeypot: "请留空", send: "发送",
      types: ["建筑师 / 设计师", "手艺人 / 创作者", "艺术家 / 驻留", "品牌合作", "静修 / 活动", "供应商", "媒体", "团队 / 招聘"],
      privacy: "您发送的信息仅用于回复您及保存往来记录，不会共享或出售。您可随时要求删除。本网站遵循日本《个人信息保护法》（APPI）及 GDPR。",
    },
  },
  ko: {
    skip: "본문으로 건너뛰기", menu: "메뉴", navLabel: "주 메뉴", homeLabel: "Ie Fushimi 홈",
    nav: { house: "집", signatures: "시그니처", atelier: "아틀리에", collaborations: "협업" },
    opening: "2027년 봄 문을 엽니다", enquiries: "문의",
    titles: { home: "Ie Fushimi", house: "집 — Ie Fushimi", signatures: "시그니처 — Ie Fushimi", atelier: "Ie 아틀리에 — Ie Fushimi", collaborations: "협업 — Ie Fushimi" },
    desc: {
      home: "후시미 이나리 가까이, 교토의 오래된 마치야에 여는 차의 집. 2027년 봄 문을 엽니다.",
      house: "1948년의 본채와 1931년의 뒤채, 두 개의 우물, 가운데의 정원, 그리고 땅 아래의 방 하나.",
      signatures: "스파클링 교쿠로, 모래 화로 호지차 차이, 브라운 버터 피낭시에. 무엇을, 어떻게, 왜.",
      atelier: "이 집이 매일 쓰는 물건들. 의뢰하고, 방에서 써 보고, 적은 수로 만듭니다.",
      collaborations: "교토 마치야에서의 레지던시, 리스닝 세션, 리트리트, 작은 모임. 시간을 들이고, 집을 있는 그대로 쓰는 작업.",
    },
    form: {
      title: "집에 보내는 글",
      intro: "건축가, 만드는 사람, 아티스트, 브랜드, 공급업체, 언론, 그리고 이곳에서 일하고 싶은 분들께.",
      name: "이름", org: "소속", optional: "(선택)", email: "이메일", country: "국가",
      type: "문의 유형", choose: "선택하세요", message: "메시지",
      link: "링크", linkHint: "(포트폴리오 또는 인스타그램, 선택)", file: "첨부 파일", fileHint: "(PDF, 선택)",
      honeypot: "비워 두세요", send: "보내기",
      types: ["건축가 / 디자이너", "공예가 / 제작자", "아티스트 / 레지던시", "브랜드 협업", "리트리트 / 이벤트", "공급업체", "언론", "팀 / 채용"],
      privacy: "보내주신 내용은 답장과 서신 기록에만 사용하며, 공유하거나 판매하지 않습니다. 언제든 삭제를 요청하실 수 있습니다. 일본 개인정보보호법(APPI)과 GDPR을 따릅니다.",
    },
  },
};
const TYPE_VALUES = ["architect", "maker", "residency", "brand", "retreat", "vendor", "press", "careers"];

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------
const ICON_PATHS = `<path d="M112 106 L301 110 L307 129 L304 946 L316 978 L98 978 L108 944 L104 137 Z"/><path d="M403 110 L648 106 Q674 110 680 134 L678 301 Q674 325 649 330 L423 326 Q398 322 394 298 L396 139 Q398 118 403 110 Z"/><path d="M403 404 L648 399 Q675 404 680 429 L678 596 Q672 620 648 624 L423 621 Q398 617 394 593 L396 433 Q398 411 403 404 Z"/><path d="M403 699 L648 695 Q675 700 680 724 L678 891 Q672 915 648 920 L423 917 Q398 913 394 889 L396 728 Q398 706 403 699 Z"/>`;
const icon = (label = "") =>
  `<svg viewBox="90 98 598 888" ${label ? `role="img" aria-label="${label}"` : `aria-hidden="true" focusable="false"`}>${ICON_PATHS}</svg>`;

// Full vertical lockup: Four Fields icon, "The Ie" wordmark (always clean), descriptor.
// [TO CONFIRM] how "Ie Fushimi" locks up with "The Ie" — this follows the
// guideline pattern for approved extensions (wordmark + Suisse caps descriptor).
const lockup = `<div class="lockup" lang="en">${icon()}<span class="wordmark">The Ie</span><span class="descriptor">Fushimi</span></div>`;

// ---------------------------------------------------------------------------
// Partials
// ---------------------------------------------------------------------------
const abs = (p) => (SITE_URL ? SITE_URL.replace(/\/$/, "") + p : p);
const langPath = (lang, key) => LANGS[lang].prefix + pathOf(key);

function img(slug, alt, { sizes = "(min-width: 900px) 50vw, 100vw", eager = false } = {}) {
  const d = dims[slug];
  if (!d) throw new Error("Unknown image: " + slug);
  const [w, h] = d;
  const srcset = `/assets/img/${slug}-640.webp 640w, /assets/img/${slug}.webp ${w}w`;
  return `<img src="/assets/img/${slug}.webp" srcset="${srcset}" sizes="${sizes}" width="${w}" height="${h}" alt="${alt}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}

function enquiry(lang, preselect = "") {
  const f = T[lang].form;
  const opts = TYPE_VALUES.map((v, i) => `<option value="${v}"${v === preselect ? " selected" : ""}>${f.types[i]}</option>`).join("");
  const id = "f-" + (preselect || "general");
  return `
<section class="enquiry"${preselect ? "" : ' id="enquire"'} aria-labelledby="${id}-h">
  <h2 id="${id}-h">${f.title}</h2>
  <p class="measure muted">${f.intro}</p>
  <form class="enquiry-form" novalidate>
    <div class="form-grid">
      <div class="field"><label for="${id}-name">${f.name}</label><input id="${id}-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="${id}-org">${f.org} <span class="hint">${f.optional}</span></label><input id="${id}-org" name="organisation" autocomplete="organization"></div>
      <div class="field"><label for="${id}-email">${f.email}</label><input id="${id}-email" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="${id}-country">${f.country}</label><input id="${id}-country" name="country" autocomplete="country-name"></div>
      <div class="field full"><label for="${id}-type">${f.type}</label><select id="${id}-type" name="type" required><option value="">${f.choose}</option>${opts}</select></div>
      <div class="field full"><label for="${id}-msg">${f.message}</label><textarea id="${id}-msg" name="message" required></textarea></div>
      <div class="field"><label for="${id}-link">${f.link} <span class="hint">${f.linkHint}</span></label><input id="${id}-link" name="link" type="url" inputmode="url"></div>
      <div class="field"><label for="${id}-file">${f.file} <span class="hint">${f.fileHint}</span></label><input id="${id}-file" name="attachment" type="file" accept="application/pdf"></div>
      <div class="hp" aria-hidden="true"><label for="${id}-web">${f.honeypot}</label><input id="${id}-web" name="website" tabindex="-1" autocomplete="off"></div>
    </div>
    <div class="form-foot">
      <button class="button" type="submit">${f.send}</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </div>
    <p class="privacy">${f.privacy} <span class="tbc">[full privacy notice and data controller TO CONFIRM]</span></p>
  </form>
</section>`;
}

function langSwitch(pageKey, lang) {
  return LANG_KEYS.map((l) => `<a href="${langPath(l, pageKey)}" hreflang="${LANGS[l].html}" lang="${LANGS[l].html}"${l === lang ? ' aria-current="true"' : ""}>${LANGS[l].label}</a>`).join('<span aria-hidden="true">/</span>');
}

function header(pageKey, lang, onDark) {
  const t = T[lang];
  const items = PAGE_KEYS.filter((k) => k !== "home")
    .map((k) => `<li><a href="${langPath(lang, k)}"${k === pageKey ? ' aria-current="page"' : ""}>${t.nav[k]}</a></li>`).join("");
  return `
<a class="skip" href="#main">${t.skip}</a>
<header class="site-header descriptor">
  <a class="home-link" href="${langPath(lang, "home")}">${icon(t.homeLabel)}</a>
  <button class="menu-toggle descriptor" type="button" aria-expanded="false" aria-controls="site-nav">${t.menu}</button>
  <nav class="site-nav" id="site-nav" aria-label="${t.navLabel}">
    <ul>${items}
      <li class="lang">${langSwitch(pageKey, lang)}</li>
    </ul>
  </nav>
</header>`;
}

function footer(lang) {
  const t = T[lang];
  return `
<footer class="site-footer">
  <div class="footer-grid">
    <div>${icon()}<p class="serif">Ie Fushimi</p><p lang="en">The Ie by Kokoro Hospitality</p></div>
    <div>
      <p>${t.opening}</p>
      <address class="address" style="font-size:.9rem;font-family:var(--sans)">${lang === "en" || lang === "ko" ? ADDRESS.en + "<br>" : ""}<span lang="ja">${ADDRESS.ja}</span></address>
    </div>
    <div>
      <p><a href="#" class="tbc">[Instagram TO CONFIRM]</a></p>
      <p><a href="#" class="tbc">[enquiries email TO CONFIRM]</a></p>
      <p><a href="${langPath(lang, "home")}#enquire">${t.enquiries}</a></p>
    </div>
  </div>
  <p class="small">© 2026 Kokoro Hospitality.</p>
</footer>`;
}

const FONT_BASE = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400";

function head(pageKey, lang) {
  const t = T[lang];
  const alternates = LANG_KEYS.map((l) => `<link rel="alternate" hreflang="${LANGS[l].html}" href="${abs(langPath(l, pageKey))}">`).join("\n");
  const self = abs(langPath(lang, pageKey));
  const ld = pageKey === "home" ? `
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    additionalType: "https://schema.org/CafeOrCoffeeShop",
    name: "Ie Fushimi",
    description: t.desc.home,
    inLanguage: LANGS[lang].html,
    parentOrganization: { "@type": "Organization", name: "Kokoro Hospitality" },
    address: { "@type": "PostalAddress", streetAddress: ADDRESS.street, addressLocality: ADDRESS.locality, addressRegion: ADDRESS.region, postalCode: ADDRESS.postcode, addressCountry: "JP" },
    ...(SITE_URL ? { url: self } : {}),
  })}</script>` : "";
  return `<!doctype html>
<html lang="${LANGS[lang].html}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${t.titles[pageKey]}</title>
<meta name="description" content="${t.desc[pageKey]}">
${ALLOW_SEARCH_INDEXING ? "" : '<meta name="robots" content="noindex, nofollow">'}
<meta name="theme-color" content="#D8CFBE">
${SITE_URL ? `<link rel="canonical" href="${self}">` : ""}
${alternates}
<link rel="alternate" hreflang="x-default" href="${abs(langPath("en", pageKey))}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Ie Fushimi">
<meta property="og:title" content="${t.titles[pageKey]}">
<meta property="og:description" content="${t.desc[pageKey]}">
<meta property="og:image" content="${abs("/assets/img/og-" + pageKey + ".jpg")}">
<meta property="og:locale" content="${LANGS[lang].og}">
${LANG_KEYS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${LANGS[l].og}">`).join("\n")}
${SITE_URL ? `<meta property="og:url" content="${self}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONT_BASE}${LANGS[lang].font}&display=swap">
<link rel="stylesheet" href="/assets/css/site.css">
${pageKey === "home" ? `<link rel="preload" as="image" href="/assets/img/hero-basin-poster.webp">` : ""}
<script>document.documentElement.classList.add("js")</script>
<script src="/assets/js/site.js" defer></script>${ld}
</head>`;
}

// Page bodies are written with English paths (/house/, /#enquire);
// on translated pages the internal links gain the language prefix.
function localiseLinks(html, lang) {
  if (lang === "en") return html;
  return html.replace(/href="\/(?!assets\/)([^"]*)"/g, (_, rest) => `href="${LANGS[lang].prefix}/${rest}"`);
}

function fill(body, lang) {
  return body
    .replace(/\{\{LOCKUP\}\}/g, lockup)
    .replace(/\{\{ICON\}\}/g, icon())
    .replace(/\{\{ADDRESS_EN\}\}/g, ADDRESS.en)
    .replace(/\{\{ADDRESS_JA\}\}/g, ADDRESS.ja)
    .replace(/\{\{MAPS_QUERY\}\}/g, MAPS_QUERY)
    .replace(/\{\{ENQUIRY(?::([a-z]+))?\}\}/g, (_, pre) => enquiry(lang, pre || ""))
    // {{img slug | alt | sizes? | eager?}}
    .replace(/\{\{img ([a-z0-9-]+) \| ([^|}]+?)(?: \| ([^|}]+?))?(?: \| (eager))?\}\}/g, (_, slug, alt, sizes, eager) =>
      img(slug, alt.trim(), { sizes: sizes ? sizes.trim() : undefined, eager: !!eager }));
}

const readBody = (lang, key) => localiseLinks(fill(readFileSync(join(root, "src/pages", lang, key + ".html"), "utf8"), lang), lang);

function write(path, html) {
  const out = join(root, "public", path, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log("wrote", join("public", path, "index.html"));
}

// ---------------------------------------------------------------------------
// Site
// ---------------------------------------------------------------------------
for (const lang of LANG_KEYS) {
  for (const key of PAGE_KEYS) {
    write(langPath(lang, key), `${head(key, lang)}
<body>
${header(key, lang, key === "home")}
<main id="main">
${readBody(lang, key)}
</main>
${footer(lang)}
</body>
</html>
`);
  }
}

// ---------------------------------------------------------------------------
// Shareable preview: one self-contained page for a claude.ai Artifact link.
// Every language × page becomes a view switched by #hash (#house, #ja-house…);
// CSS and JS are inlined, assets are published alongside with relative paths.
// ---------------------------------------------------------------------------
{
  const viewName = (lang, key) => (lang === "en" ? key : `${lang}-${key}`);
  // Keep ids unique across language views.
  const prefixIds = (html, lang) => lang === "en" ? html : html
    .replace(/\b(id|for|aria-labelledby|aria-controls)="([^"]+)"/g, (_, attr, v) => `${attr}="${lang}-${v}"`);
  // Internal paths → view hashes.
  const relink = (html) => html
    .replace(/(src|poster)="\/assets\//g, '$1="assets/')
    .replace(/\/assets\/img\//g, "assets/img/")
    .replace(/href="\/(?:(ja|zh|ko)\/)?([a-z]*)\/?(?:#([a-z0-9-]+))?"/g, (m, l, page, hash) => {
      const lang = l || "en";
      if (page && !PAGE_KEYS.includes(page)) return m;
      if (hash) return `href="#${lang === "en" ? "" : lang + "-"}${hash}"`;
      return `href="#${viewName(lang, page || "home")}"`;
    })
    .replace(/<div class="map-slot"[\s\S]*?<\/div>\s*<\/div>/g, "");

  const views = [];
  for (const lang of LANG_KEYS) for (const key of PAGE_KEYS) {
    const body = prefixIds(readBody(lang, key) + footer(lang), lang);
    views.push(`<div data-view="${viewName(lang, key)}" data-lang="${lang}" data-page="${key}" lang="${LANGS[lang].html}"${lang === "en" && key === "home" ? "" : " hidden"}>\n${relink(body)}\n</div>`);
  }
  const css = readFileSync(join(root, "public/assets/css/site.css"), "utf8");
  const js = readFileSync(join(root, "public/assets/js/site.js"), "utf8");
  const navItems = PAGE_KEYS.filter((k) => k !== "home").map((k) => `<li><a href="#${k}" data-nav="${k}">${T.en.nav[k]}</a></li>`).join("");
  const langItems = LANG_KEYS.map((l) => `<a href="#${viewName(l, "home")}" data-switch="${l}" lang="${LANGS[l].html}">${LANGS[l].label}</a>`).join('<span aria-hidden="true">/</span>');
  const html = `<title>Ie Fushimi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONT_BASE}${LANG_KEYS.map((l) => LANGS[l].font).join("")}&display=swap">
<style>
${css}
:root { color-scheme: light; }
[data-view][hidden] { display: none !important; }
.preview-note { background: var(--ground); color: var(--moss); border-top: 1px solid var(--rule); font-family: var(--sans); font-size: .78rem; padding: .6rem var(--gutter); }
</style>
<header class="site-header descriptor" id="site-header">
  <a class="home-link" href="#home" data-nav-home>${icon("Ie Fushimi — home")}</a>
  <button class="menu-toggle descriptor" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
  <nav class="site-nav" id="site-nav" aria-label="Main">
    <ul>${navItems}
      <li class="lang">${langItems}</li>
    </ul>
  </nav>
</header>
<main id="main">
${views.join("\n")}
</main>
<div class="preview-note">Preview v01, shared for review. Items marked [TO CONFIRM] are still open.</div>
<script>
${js}
(function () {
  const T = ${JSON.stringify(Object.fromEntries(LANG_KEYS.map((l) => [l, { nav: T[l].nav, menu: T[l].menu }])))};
  const views = [...document.querySelectorAll("[data-view]")];
  const header = document.getElementById("site-header");
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".menu-toggle");
  const name = (lang, page) => (lang === "en" ? page : lang + "-" + page);
  function show() {
    const h = decodeURIComponent(location.hash.slice(1)) || "home";
    let view = views.find((v) => v.dataset.view === h);
    let target = null;
    if (!view) { target = document.getElementById(h); view = target ? target.closest("[data-view]") : views[0]; }
    const lang = view.dataset.lang, page = view.dataset.page;
    views.forEach((v) => {
      v.hidden = v !== view;
      v.querySelectorAll("video").forEach((vid) => {
        if (v.hidden) vid.pause();
        else if (vid.hasAttribute("data-autoplay") && !matchMedia("(prefers-reduced-motion: reduce)").matches) vid.play().catch(() => {});
      });
    });
    header.classList.remove("is-hidden");
    header.querySelector("[data-nav-home]").href = "#" + name(lang, "home");
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const k = a.dataset.nav;
      a.href = "#" + name(lang, k);
      a.textContent = T[lang].nav[k];
      if (k === page) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.querySelectorAll("[data-switch]").forEach((a) => {
      a.href = "#" + name(a.dataset.switch, page);
      if (a.dataset.switch === lang) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    toggle.textContent = T[lang].menu;
    document.documentElement.lang = view.getAttribute("lang");
    nav.classList.remove("is-open");
    if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", show);
  show();
})();
</script>
`;
  const out = join(root, "artifact/index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log("wrote artifact/index.html");
}
