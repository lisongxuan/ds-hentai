const React = require('react');

const THEME_ID = 'dsh-exhentai';
const STORAGE_KEY = 'ds-hentai:enabled';
const PREVIOUS_THEME_KEY = 'ds-hentai:previous-theme';
const CHIPS_KEY = 'ds-hentai:chips';
const MODE_KEY = 'ds-hentai:mode';
const FAVS_KEY = 'ds-hentai:favs';
const MODEL_KEY = 'ds-hentai:model';
const REGION_KEY = 'ds-hentai:region';
const CATS_KEY = 'ds-hentai:cats';
const SIDEBAR_KEY = 'ds-hentai:native-sidebar';
const COMPOSER_KEY = 'ds-hentai:composer';
const BUILTIN_THEMES = new Set(['light', 'dark', 'system']);
const COMPOSER_MODES = Object.freeze(['skin', 'native']);
const DEFAULT_PRESETS = Object.freeze([
  { id: 'standard', label: 'Standard mode' },
  { id: 'code', label: 'PTC mode' },
  { id: 'minimal', label: 'Minimal mode' },
  { id: 'creator', label: 'Creator mode' }
]);
const SLASH_COMMANDS = Object.freeze([
  { id: 'compact', hint: 'Compact older conversation history' },
  { id: 'export', hint: 'Download this Session log as a ZIP archive' },
  { id: 'feedback', hint: 'Record feedback about this session' },
  { id: 'goal', hint: 'Set or view the goal for a long-running task' },
  { id: 'permission', hint: 'Switch the permission preset' },
  { id: 'plan', hint: 'Enter or leave plan mode' },
  { id: 'model', hint: 'Select the model for this conversation' }
]);
const CSS = __EXHENTAI_CSS__;

const MODES = Object.freeze(['minimal', 'minimalplus', 'compact', 'extended', 'thumbnail']);
const MODE_OPTIONS = Object.freeze([
  { id: 'minimal', label: 'Minimal' },
  { id: 'minimalplus', label: 'Minimal+' },
  { id: 'compact', label: 'Compact' },
  { id: 'extended', label: 'Extended' },
  { id: 'thumbnail', label: 'Thumbnail' }
]);
const REGIONS = Object.freeze([
  { id: 'auto', label: 'Auto-Detect' },
  { id: 'eu', label: 'Europe' },
  { id: 'na', label: 'North America' },
  { id: 'sa', label: 'South America' },
  { id: 'as', label: 'Asia' },
  { id: 'oc', label: 'Oceania' }
]);
const APPEARANCE_OPTIONS = Object.freeze([
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' }
]);
const FULL_ACCESS = 'danger-full-access';
const HOST_LOCALES = Object.freeze([
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' }
]);
const CATEGORIES = Object.freeze([
  { id: 'chat', label: 'Chat', tone: 'ct2' },
  { id: 'code', label: 'Code', tone: 'ct3' },
  { id: 'files', label: 'Files', tone: 'ct4' },
  { id: 'tools', label: 'Tools', tone: 'ct5' },
  { id: 'plan', label: 'Plan', tone: 'cta' },
  { id: 'search', label: 'Search', tone: 'ct9' },
  { id: 'agent', label: 'Agent', tone: 'ct6' },
  { id: 'skill', label: 'Skill', tone: 'ct7' },
  { id: 'notes', label: 'Notes', tone: 'ct8' },
  { id: 'misc', label: 'Misc', tone: 'ct1' }
]);

const LOCALE_NS = 'ds-hentai';
const SETTINGS_ZH = Object.freeze({
  'skin.title': 'DsHentai 深色画廊皮肤',
  'skin.desc': '画廊导航、表格会话、搜索式发送与状态脚；关闭后恢复切换前的系统外观。',
  'skin.enable': '启用皮肤',
  'skin.system': '系统外观',
  'chips.title': '分类彩色标签',
  'chips.desc': '类别 chip 彩条（红/橙/金/绿/蓝/紫）；关闭后统一改用中性灰。',
  'chips.on': '彩色标签：开启',
  'chips.off': '彩色标签：关闭',
  'chips.enable': '启用分类彩色标签',
  'chips.hint': '会话标签上的分类彩条可关闭，画廊会改成统一灰色。',
  'sidebar.title': '原生侧边栏',
  'sidebar.desc': '会话页是否显示 DSH 左侧会话栏。关闭后用 Front Page 表切换会话。',
  'sidebar.hint': '在 Chat / Trajectory 旁显示原生会话侧边栏。',
  'sidebar.show': '显示',
  'sidebar.hide': '隐藏',
  'composer.title': '对话输入框',
  'composer.desc': '皮肤搜索坞与原生输入卡二选一；选原生时不显示皮肤输入框。',
  'composer.hint': '只显示一种输入框，另一种会隐藏。',
  'composer.skin': '皮肤输入框',
  'composer.native': '原生输入框',
  'mode.prompt': '希望首页和搜索页使用哪种显示模式？',
  'mode.minimal': 'Minimal',
  'mode.minimalplus': 'Minimal+',
  'mode.compact': 'Compact',
  'mode.extended': 'Extended',
  'mode.thumbnail': 'Thumbnail',
  'host.title': '宿主',
  'host.desc': '插件、插件市场和供应商 API 密钥仍在原生宿主面板中。',
  'host.open': '打开宿主设置',
  'gallery.title': '画廊皮肤',
  'gallery.desc': '使用 DsHentai 画廊壳层，或恢复 DeepSeek Harness 内置外观。',
  'display.title': '首页显示',
  'preset.title': 'Agent 预设',
  'preset.desc': '应用于当前会话。进行中的任务仍使用开始时的预设。',
  'perm.title': '权限',
  'perm.desc': '为当前会话选择权限模式。',
  'perm.needSession': '请先打开一个会话。',
  'perm.unavailable': '权限预设不可用。',
  'appearance.title': '外观',
  'appearance.desc': 'DeepSeek Harness 内置外观。关闭画廊皮肤时使用。',
  'appearance.light': '浅色',
  'appearance.dark': '深色',
  'appearance.system': '跟随系统',
  'language.title': '语言',
  'language.desc': '界面语言。',
  'models.title': '模型',
  'models.desc': '当前会话使用的模型。供应商密钥仍在宿主设置中。',
  'models.loading': '正在加载模型…',
  'models.empty': '此会话没有可用模型。'
});
const SETTINGS_EN = Object.freeze({
  'skin.title': 'DsHentai dark gallery skin',
  'skin.desc': 'Gallery nav, session table, search-style send, and status footer. Turning off restores the previous system appearance.',
  'skin.enable': 'Enable skin',
  'skin.system': 'System appearance',
  'chips.title': 'Category color chips',
  'chips.desc': 'Category chip colors (red/orange/gold/green/blue/purple). Off uses a uniform gray.',
  'chips.on': 'Color chips: on',
  'chips.off': 'Color chips: off',
  'chips.enable': 'Enable colored category chips',
  'chips.hint': 'Category color chips on session tags can be turned off if you prefer a uniform gray gallery.',
  'sidebar.title': 'Native sidebar',
  'sidebar.desc': 'Show the DSH session sidebar on the session page. Off uses the Front Page table to switch sessions.',
  'sidebar.hint': 'Show the native session sidebar next to Chat / Trajectory.',
  'sidebar.show': 'Show',
  'sidebar.hide': 'Hide',
  'composer.title': 'Composer',
  'composer.desc': 'Choose the skin search dock or the native composer. The other is hidden.',
  'composer.hint': 'Choose one composer. The other is hidden.',
  'composer.skin': 'Skin composer',
  'composer.native': 'Native composer',
  'mode.prompt': 'Which display mode would you like to use on the front and search pages?',
  'mode.minimal': 'Minimal',
  'mode.minimalplus': 'Minimal+',
  'mode.compact': 'Compact',
  'mode.extended': 'Extended',
  'mode.thumbnail': 'Thumbnail',
  'host.title': 'Host',
  'host.desc': 'Plugins, Plugin Market, and provider API keys remain in the native host panel.',
  'host.open': 'Open Host Settings',
  'gallery.title': 'Gallery Skin',
  'gallery.desc': 'Use the DsHentai gallery chrome, or restore the built-in DeepSeek Harness appearance.',
  'display.title': 'Front Page Display',
  'preset.title': 'Agent Preset',
  'preset.desc': 'Applies to this session. Running work keeps the preset it began with.',
  'perm.title': 'Permission',
  'perm.desc': 'Choose the permission mode for the current session.',
  'perm.needSession': 'Open a session first.',
  'perm.unavailable': 'Permission presets are unavailable.',
  'appearance.title': 'Appearance',
  'appearance.desc': 'Built-in DeepSeek Harness appearance. Used when the gallery skin is off.',
  'appearance.light': 'Light',
  'appearance.dark': 'Dark',
  'appearance.system': 'System',
  'language.title': 'Language',
  'language.desc': 'Interface language.',
  'models.title': 'Models',
  'models.desc': 'Model for the current session. Provider keys stay in Host Settings.',
  'models.loading': 'Loading models…',
  'models.empty': 'No models available for this session.'
});

function interpolateTemplate(template, params) {
  if (!params) return template;
  return String(template).replace(/\{(\w+)\}/g, (match, name) => (
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
  ));
}
function detectBrowserLocaleId() {
  try {
    const lang = (typeof navigator !== 'undefined'
      && ((navigator.languages && navigator.languages[0]) || navigator.language)) || 'zh';
    return String(lang).toLowerCase().startsWith('en') ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}
function settingsLookup(localeId, key) {
  const dict = String(localeId || '').toLowerCase().startsWith('en') ? SETTINGS_EN : SETTINGS_ZH;
  return dict[key] || SETTINGS_ZH[key] || SETTINGS_EN[key] || key;
}
function fallbackT(key, params) {
  return interpolateTemplate(settingsLookup(detectBrowserLocaleId(), key), params);
}
function localeServiceOf(ctx) {
  try {
    if (ctx && ctx.locale) return ctx.locale;
    if (ctx && typeof ctx.get === 'function') return ctx.get('locale');
  } catch {}
  return null;
}
function registerSettingsLocales(ctx) {
  const locale = localeServiceOf(ctx);
  if (!locale || typeof locale.register !== 'function') return undefined;
  return locale.register(LOCALE_NS, { zh: SETTINGS_ZH, en: SETTINGS_EN });
}
function bindSettingsT(ctx) {
  try {
    const locale = localeServiceOf(ctx);
    if (locale && typeof locale.bind === 'function') {
      const bound = locale.bind(LOCALE_NS);
      if (typeof bound === 'function') return bound;
    }
  } catch {}
  return fallbackT;
}
function settingsModeOptions(t) {
  const translate = typeof t === 'function' ? t : fallbackT;
  return MODE_OPTIONS.map((item) => ({ id: item.id, label: translate('mode.' + item.id) }));
}
function settingsAppearanceOptions(t) {
  const translate = typeof t === 'function' ? t : fallbackT;
  return APPEARANCE_OPTIONS.map((item) => ({ id: item.id, label: translate('appearance.' + item.id) }));
}

const THEME = Object.freeze({
  id: THEME_ID,
  colorScheme: 'dark',
  tokens: Object.freeze({
    '--dsw-font-family': 'Arial, Helvetica, "PingFang SC", "Microsoft YaHei", sans-serif',
    '--dsw-alias-bg-base': '#34353b',
    '--dsw-alias-bg-layer-1': '#3a3d44',
    '--dsw-alias-bg-layer-2': '#40454b',
    '--dsw-alias-bg-layer-3': '#4f535b',
    '--dsw-alias-bg-module-platform': '#4f535b',
    '--dsw-alias-bg-multi-select': '#40454b',
    '--dsw-alias-bg-overlay': '#4f535b',
    '--dsw-alias-bg-skeleton': 'rgba(255,255,255,0.08)',
    '--dsw-alias-border-l1': 'rgba(141,141,141,0.28)',
    '--dsw-alias-border-l2-darkmode-thin': 'rgba(141,141,141,0.34)',
    '--dsw-alias-border-l2': 'rgba(141,141,141,0.34)',
    '--dsw-alias-border-l3': '#8d8d8d',
    '--dsw-alias-border-l4': '#aeaeae',
    '--dsw-alias-border-inverted': 'rgba(0,0,0,0)',
    '--dsw-alias-border-inverted2': 'rgba(0,0,0,0)',
    '--dsw-alias-brand-primary': '#f1f1f1',
    '--dsw-alias-brand-primary-invert': '#34353b',
    '--dsw-alias-brand-text': '#dddddd',
    '--dsw-alias-button-contrast-fill': '#34353b',
    '--dsw-alias-button-elevated-fill': '#4f535b',
    '--dsw-alias-button-floating-fill': '#4f535b',
    '--dsw-alias-button-floating-hover': '#575b62',
    '--dsw-alias-button-ghost-active-border': '#aeaeae',
    '--dsw-alias-button-ghost-active-fill': '#43464e',
    '--dsw-alias-button-ghost-active-hover': '#4f535b',
    '--dsw-alias-button-info-fill': '#575b62',
    '--dsw-alias-button-info-hover': '#686d75',
    '--dsw-alias-button-primary-dimmed': '#4f535b',
    '--dsw-alias-button-primary-fill': '#4f535b',
    '--dsw-alias-button-primary-hover': '#575b62',
    '--dsw-alias-button-tool-bar-fill-invisible': 'rgba(31,31,31,0.36)',
    '--dsw-alias-button-tool-bar-fill': 'rgba(84,85,87,0.5)',
    '--dsw-alias-button-tool-bar-hover': 'rgba(84,85,87,0.6)',
    '--dsw-alias-interactive-bg-active': 'rgba(255,255,255,0.12)',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(255,255,255,0.10)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(255,51,51,0.10)',
    '--dsw-alias-interactive-bg-hover-solid': '#43464e',
    '--dsw-alias-interactive-bg-hover': 'rgba(255,255,255,0.07)',
    '--dsw-alias-label-caption': '#8f8f8f',
    '--dsw-alias-label-dimmed': '#6f6f6f',
    '--dsw-alias-label-primary-bluish': '#c8c8c8',
    '--dsw-alias-label-primary-dimmed': '#8a8a8a',
    '--dsw-alias-label-primary-foreground': '#34353b',
    '--dsw-alias-label-primary-inverted': '#34353b',
    '--dsw-alias-label-primary': '#f1f1f1',
    '--dsw-alias-label-secondary': '#b8b8b8',
    '--dsw-alias-label-tertiary': '#9a9a9a',
    '--dsw-alias-markdown-citation': '#4f535b',
    '--dsw-alias-markdown-code-block-banner': '#40454b',
    '--dsw-alias-markdown-code-block': '#3a3d44',
    '--dsw-alias-markdown-code-segment-selected': '#4f535b',
    '--dsw-alias-markdown-code-segment-unselected': '#3a3d44',
    '--dsw-alias-markdown-inline-code': '#4f535b',
    '--dsw-alias-markdown-placeholder': '#3a3d44',
    '--dsw-alias-markdown-tag': '#42464d',
    '--dsw-alias-scrollbar-bg-l1': '#4f535b',
    '--dsw-alias-scrollbar-bg-l2': '#45484f',
    '--dsw-alias-scrollbar-hover-l1': '#8d8d8d',
    '--dsw-alias-scrollbar-hover-l2': '#979797',
    '--dsw-alias-state-business-primary': '#8d8d8d',
    '--dsw-alias-state-business-tertiary': '#4f535b',
    '--dsw-alias-state-error-primary': '#ff3333',
    '--dsw-alias-state-error-secondary': '#fb7878',
    '--dsw-alias-state-success-primary': '#3fbf47',
    '--dsw-alias-state-success-secondary': '#00e639',
    '--dsw-alias-state-success-tertiary': 'rgba(0,230,57,0.12)',
    '--dsw-alias-state-warn-label': '#fb7878',
    '--dsw-alias-state-warn-primary': '#d38f1d',
    '--dsw-alias-state-warn-secondary': '#db6c24',
    '--dsw-alias-state-warn-tertiary': 'rgba(211,143,29,0.12)',
    '--dsw-alias-toast-bg': '#4f535b',
    '--dsw-alias-tooltip-bg': '#ffffe1',
    '--dsw-tooltip-ink': '#1f1f1f',
    '--dsw-specific-bubble-highlight': '#5a5e66',
    '--dsw-specific-bubble': '#4f535b',
    '--dsw-specific-input-major': '#34353b',
    '--dsw-specific-login-input': '#3a3d44',
    '--dsw-specific-menu': '#4f535b',
    '--dsw-specific-selector': '#40454b',
    '--dsw-specific-sidebar-fill': '#3a3d44',
    '--dsw-specific-sidebar-nav-item-active-accent': '#f1f1f1',
    '--dsw-specific-sidebar-nav-item-active': '#4f535b',
    '--dsw-specific-sidebar-nav-item-hover': '#40454b',
    '--dsw-specific-tip': '#4f535b'
  })
});

function readFlag(key, onDefault) {
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return onDefault;
    return value !== 'off';
  } catch {
    return onDefault;
  }
}
function writeFlag(key, enabled) {
  try { window.localStorage.setItem(key, enabled ? 'on' : 'off'); } catch {}
}
function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeJson(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function readEnabled() { return readFlag(STORAGE_KEY, true); }
function writeEnabled(enabled) { writeFlag(STORAGE_KEY, enabled); }
function readChipsEnabled() { return readFlag(CHIPS_KEY, true); }
function writeChipsEnabled(enabled) { writeFlag(CHIPS_KEY, enabled); }
function readPreviousTheme() {
  try {
    const value = window.localStorage.getItem(PREVIOUS_THEME_KEY);
    return BUILTIN_THEMES.has(value) ? value : 'system';
  } catch {
    return 'system';
  }
}
function writePreviousTheme(themeId) {
  if (!BUILTIN_THEMES.has(themeId)) return;
  try { window.localStorage.setItem(PREVIOUS_THEME_KEY, themeId); } catch {}
}
function readMode() {
  try {
    const value = window.localStorage.getItem(MODE_KEY);
    return MODES.includes(value) ? value : 'compact';
  } catch {
    return 'compact';
  }
}
function writeMode(mode) {
  if (!MODES.includes(mode)) return;
  try { window.localStorage.setItem(MODE_KEY, mode); } catch {}
}
function readFavs() {
  const value = readJson(FAVS_KEY, []);
  return Array.isArray(value) ? value.map(String) : [];
}
function writeFavs(ids) { writeJson(FAVS_KEY, ids); }
function readModel() {
  try {
    return window.localStorage.getItem(MODEL_KEY) || '';
  } catch {
    return '';
  }
}
function writeModel(id) {
  try { window.localStorage.setItem(MODEL_KEY, String(id || '')); } catch {}
}
function readRegion() {
  try {
    const value = window.localStorage.getItem(REGION_KEY);
    return REGIONS.some((item) => item.id === value) ? value : 'auto';
  } catch {
    return 'auto';
  }
}
function writeRegion(id) {
  if (!REGIONS.some((item) => item.id === id)) return;
  try { window.localStorage.setItem(REGION_KEY, id); } catch {}
}
function readCats() {
  const value = readJson(CATS_KEY, CATEGORIES.map((item) => item.id));
  return Array.isArray(value) && value.length > 0 ? value.map(String) : CATEGORIES.map((item) => item.id);
}
function writeCats(ids) { writeJson(CATS_KEY, ids); }
function readNativeSidebar() { return readFlag(SIDEBAR_KEY, false); }
function writeNativeSidebar(enabled) { writeFlag(SIDEBAR_KEY, enabled); }
function readComposerMode() {
  try {
    const value = window.localStorage.getItem(COMPOSER_KEY);
    return COMPOSER_MODES.includes(value) ? value : 'skin';
  } catch {
    return 'skin';
  }
}
function writeComposerMode(mode) {
  if (!COMPOSER_MODES.includes(mode)) return;
  try { window.localStorage.setItem(COMPOSER_KEY, mode); } catch {}
}
function markChromeFlags(sidebarOn, composerMode) {
  if (!document.body) return;
  document.body.setAttribute('data-dsh-exhentai-sidebar', sidebarOn ? 'on' : 'off');
  document.body.setAttribute('data-dsh-exhentai-composer', COMPOSER_MODES.includes(composerMode) ? composerMode : 'skin');
}

function h(type, props) {
  return React.createElement(type, props, ...Array.prototype.slice.call(arguments, 2));
}

function hashString(value) {
  let hash = 0;
  const text = String(value || '');
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return hash;
}
function pathBasename(value) {
  const text = String(value || '').replace(/[\\/]+$/, '');
  if (!text) return '';
  const parts = text.split(/[\\/]/);
  return parts[parts.length - 1] || '';
}
function toneFor(value) {
  const key = String(value || '').toLowerCase();
  const hit = CATEGORIES.find((item) => item.id === key);
  if (hit) return hit.tone;
  return CATEGORIES[hashString(key) % CATEGORIES.length].tone;
}
function categoryFor(session) {
  const hay = `${session.title || ''} ${session.subtitle || ''}`.toLowerCase();
  const hit = CATEGORIES.find((item) => item.id !== 'misc' && hay.includes(item.id));
  if (hit) return hit;
  return CATEGORIES[hashString(session.id || session.title) % CATEGORIES.length];
}
function nativeTagValues(session) {
  const values = [];
  const push = (value) => {
    if (value == null || value === '') return;
    if (Array.isArray(value)) {
      for (const item of value) push(item);
      return;
    }
    if (typeof value === 'object') {
      push(value.label || value.name || value.id || value.tag);
      return;
    }
    values.push(String(value));
  };
  push(session && session.tags);
  const pv = session && session.projectionValues;
  if (pv && pv !== session) push(pv.tags);
  return values;
}
function pushTagItem(items, seen, kind, value, tone) {
  const label = String(value == null ? '' : value).trim();
  if (!label) return;
  const id = label.toLowerCase();
  if (seen.has(id)) return;
  seen.add(id);
  items.push({ id, label, kind, tone: tone || toneFor(id) });
}
function sessionTagItems(session) {
  const seen = new Set();
  const items = [];
  for (const tag of nativeTagValues(session)) pushTagItem(items, seen, 'tag', tag);
  pushTagItem(items, seen, 'workspace', session && session.workspace);
  pushTagItem(items, seen, 'model', session && session.model);
  const cat = categoryFor(session || {});
  pushTagItem(items, seen, 'cat', cat.id, cat.tone);
  return items;
}
function sessionTags(session) {
  return sessionTagItems(session).map((item) => item.label);
}
function galleryButtons(sessions) {
  const seen = new Set();
  const items = [];
  const rows = Array.isArray(sessions) ? sessions : [];
  for (const session of rows) {
    for (const tag of nativeTagValues(session)) pushTagItem(items, seen, 'tag', tag);
  }
  for (const session of rows) pushTagItem(items, seen, 'workspace', session.workspace);
  for (const session of rows) pushTagItem(items, seen, 'model', session.model);
  for (const session of rows) {
    if (items.length >= 10) break;
    const cat = categoryFor(session);
    pushTagItem(items, seen, 'cat', cat.id, cat.tone);
  }
  for (const cat of CATEGORIES) {
    if (items.length >= 10) break;
    pushTagItem(items, seen, 'cat', cat.id, cat.tone);
  }
  return items.slice(0, 10);
}
function postedMs(session) {
  if (session && typeof session.posted === 'number' && Number.isFinite(session.posted)) return session.posted;
  const date = session && session.posted != null ? new Date(session.posted) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}
function permissionLabel(option) {
  if (!option) return '';
  if (option.value === FULL_ACCESS) return 'Full access';
  const name = String(option.name || option.value || '');
  if (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    return name.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  return name;
}
function modelBaseId(id) {
  return String(id || '').replace(/-\d{4}$/, '');
}
function eachNamedModel(directory, predicate) {
  const groups = (directory && directory.groups) || [];
  for (const group of groups) {
    const models = (group && group.models) || [];
    for (const model of models) {
      if (model && predicate(group, model)) return { group, model };
    }
  }
  return null;
}
function findModelEntry(directory) {
  const current = directory && directory.current;
  if (!current || current.model == null) return null;
  const exact = eachNamedModel(directory, (group, model) => model.id === current.model
    && (!current.provider || group.id === current.provider));
  if (exact) return exact;
  const base = modelBaseId(current.model);
  return eachNamedModel(directory, (group, model) => model.id === base || modelBaseId(model.id) === base);
}
function reasoningInfo(directory) {
  const hit = findModelEntry(directory);
  const listed = hit && hit.model && hit.model.reasoning;
  const listedEfforts = listed && (listed.efforts || listed.options || listed.levels);
  if (listedEfforts && listedEfforts.length) return listed;
  const current = directory && directory.current;
  const base = modelBaseId(current && current.model);
  const borrowed = eachNamedModel(directory, (_group, model) => {
    const reasoning = model.reasoning;
    const efforts = reasoning && (reasoning.efforts || reasoning.options || reasoning.levels);
    return !!(efforts && efforts.length && (model.id === base || modelBaseId(model.id) === base));
  });
  return (borrowed && borrowed.model && borrowed.model.reasoning) || listed || null;
}
function modelSelectionOf(selection) {
  if (!selection || selection.model == null) return null;
  const payload = { provider: selection.provider, model: selection.model };
  const effort = selection.reasoningEffort || selection.effort;
  if (effort !== undefined && effort !== null && effort !== '') payload.reasoningEffort = effort;
  return payload;
}
function flattenModelChoices(directory) {
  const groups = (directory && directory.groups) || [];
  const choices = [];
  const current = directory && directory.current;
  for (const group of groups) {
    const models = (group && group.models) || [];
    for (const model of models) {
      if (!model || model.id == null) continue;
      const provider = group.id;
      const selection = { provider, model: model.id };
      const effort = (current && current.provider === provider
        && current.model === model.id
        && (current.reasoningEffort || current.effort))
        || (model.reasoning && model.reasoning.defaultEffort);
      if (effort !== undefined && effort !== null && effort !== '') selection.reasoningEffort = effort;
      choices.push({
        id: `${provider}:${model.id}`,
        provider,
        model: model.id,
        label: model.name || model.id,
        group: group.name || group.id || provider,
        selection
      });
    }
  }
  return choices;
}
function currentModelId(directory, choices) {
  const current = directory && directory.current;
  if (!current) return '';
  const hit = (choices || []).find((item) => item.provider === current.provider && item.model === current.model);
  return hit ? hit.id : `${current.provider || ''}:${current.model || ''}`;
}
function currentModelLabel(directory, choices) {
  const current = directory && directory.current;
  if (!current) return '';
  const hit = (choices || []).find((item) => item.provider === current.provider && item.model === current.model);
  return (hit && hit.label) || current.model || '';
}
function currentEffortValue(directory) {
  const current = directory && directory.current;
  if (!current) return '';
  return String(current.reasoningEffort || current.effort || '');
}
function effortChoices(directory) {
  const reasoning = reasoningInfo(directory);
  const raw = (reasoning && (reasoning.efforts || reasoning.options || reasoning.levels)) || [];
  return raw.map((item) => {
    if (item == null) return null;
    if (typeof item === 'string' || typeof item === 'number') {
      return { id: String(item), label: String(item).replace(/^\w/, (ch) => ch.toUpperCase()) };
    }
    const id = item.id || item.value || item.name;
    if (id == null) return null;
    return { id: String(id), label: String(item.name || item.label || id) };
  }).filter(Boolean);
}
function shortLabel(value, fallback) {
  const text = String(value || '').trim();
  if (!text) return fallback;
  return text.length > 28 ? `${text.slice(0, 26)}…` : text;
}
function formatPosted(value) {
  if (!value && value !== 0) return '—';
  const raw = String(value).trim();
  if (/^\d+\s*[smhdwy]$/i.test(raw) || /^(just now|yesterday|today|昨天|今天|刚刚)$/i.test(raw)) return raw;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return raw.slice(0, 16);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function formatClockDuration(ms) {
  const total = Math.round(Number(ms) / 1000);
  if (!Number.isFinite(total) || total <= 0) return null;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h${m}m${s}s`;
  if (m > 0) return `${m}m${s}s`;
  return `${s}s`;
}
function formatCompactTok(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M tok`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k tok`;
  return `${Math.round(n)} tok`;
}
function formatSessionMeter(stats, tokens) {
  const groups = [];
  const head = [];
  const turns = stats && Number(stats.turns);
  const steps = stats && Number(stats.steps);
  if (turns > 0) head.push(`${turns} turn${turns === 1 ? '' : 's'}`);
  if (steps > 0) head.push(`${steps} step${steps === 1 ? '' : 's'}`);
  if (head.length) groups.push(head.join(' · '));

  const time = [];
  const llm = formatClockDuration(stats && stats.llmMs);
  if (llm) time.push(`LLM ${llm}`);
  const tool = formatClockDuration(stats && stats.toolMs);
  if (tool) time.push(`Tool call ${tool}`);
  if (time.length) groups.push(time.join(' · '));

  const speed = [];
  const ttftMs = stats && Number(stats.ttftMs);
  const ttftSteps = stats && Number(stats.ttftSteps);
  if (ttftMs > 0 && ttftSteps > 0) speed.push(`TTFT avg ${(ttftMs / ttftSteps / 1000).toFixed(1)}s`);
  else if (ttftMs > 0) speed.push(`TTFT ${(ttftMs / 1000).toFixed(1)}s`);
  const decodeMs = stats && Number(stats.decodeMs);
  const decodeTokens = stats && Number(stats.decodeTokens);
  if (decodeMs > 0 && decodeTokens > 0) {
    const rate = decodeTokens / (decodeMs / 1000);
    speed.push(`${rate >= 10 ? Math.round(rate) : rate.toFixed(1)} tok/s`);
  }
  if (speed.length) groups.push(speed.join(' · '));

  const cacheRead = tokens && Number(tokens.cacheReadTokens) || 0;
  const cacheWrite = tokens && Number(tokens.cacheWriteTokens) || 0;
  const uncached = tokens && Number(tokens.uncachedInputTokens) || 0;
  const input = cacheRead + cacheWrite + uncached;
  if (input > 0 && cacheRead + uncached > 0) {
    groups.push(`Cache hit ${Math.round(cacheRead / (cacheRead + uncached) * 100)}%`);
  }
  const io = [];
  const inLabel = formatCompactTok(input);
  const outLabel = formatCompactTok(tokens && tokens.outputTokens);
  if (inLabel) io.push(`Input ${inLabel}`);
  if (outLabel) io.push(`Output ${outLabel}`);
  if (io.length) groups.push(io.join(' · '));
  return groups;
}

function nativeNodes(selector) {
  const root = document.getElementById('root') || document.body;
  return Array.prototype.slice.call(root.querySelectorAll(selector))
    .filter((node) => !node.closest('.dsh-ex-chrome, [data-dsh-ex-chrome]'));
}
function setNativeValue(el, value) {
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, 'value');
  if (desc && desc.set) desc.set.call(el, value);
  else el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}
function nodeName(node) {
  return `${node.getAttribute('aria-label') || ''}`.trim().toLowerCase();
}
function nodeText(node) {
  return `${node.textContent || ''}`.replace(/\s+/g, ' ').trim().toLowerCase();
}
function clickNamed(names, opts) {
  const lowered = names.map((name) => name.toLowerCase());
  const skip = opts && typeof opts.skip === 'function' ? opts.skip : null;
  const nodes = nativeNodes('button, a, [role="button"], [role="menuitem"], [role="tab"]')
    .filter((node) => !(skip && skip(node)));
  const exact = (node) => {
    const aria = nodeName(node);
    const text = nodeText(node);
    return lowered.some((name) => aria === name || text === name);
  };
  for (const node of nodes) {
    if (exact(node)) { node.click(); return true; }
  }
  if (opts && opts.exact) return false;
  for (const node of nodes) {
    const aria = nodeName(node);
    const text = nodeText(node);
    if (lowered.some((name) => (aria && (aria === name || aria.startsWith(name + ' '))) || text === name)) {
      node.click();
      return true;
    }
  }
  return false;
}
function clickClass(substr) {
  const node = nativeNodes('button, a, [role="button"]').find((item) =>
    String(item.className || '').includes(substr)
  );
  if (!node) return false;
  node.click();
  return true;
}
function findComposer() {
  return nativeNodes('textarea').sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0]
    || nativeNodes('[contenteditable="true"]')[0]
    || null;
}
function findSendButton() {
  const named = nativeNodes('button').find((node) => {
    const label = `${node.getAttribute('aria-label') || ''} ${node.textContent || ''}`.toLowerCase();
    return label.includes('send') || label.includes('发送');
  });
  if (named) return named;
  const primaries = nativeNodes('[class$="_primary"]');
  return primaries[primaries.length - 1] || null;
}
function readDomSessions() {
  const rows = nativeNodes('[class*="_sessionRow"]');
  return rows.map((row, index) => {
    const titleEl = row.querySelector('[class*="_title"]');
    const timeEl = row.querySelector('[class*="_time"]');
    const title = ((titleEl && titleEl.textContent) || '').replace(/\s+/g, ' ').trim()
      || `Session ${index + 1}`;
    const posted = ((timeEl && timeEl.textContent) || '').replace(/\s+/g, ' ').trim() || null;
    return {
      id: row.getAttribute('data-id') || `dom:${index}:${title.slice(0, 48)}`,
      title,
      posted,
      selected: /\b_selected\b/.test(row.className) || row.getAttribute('aria-selected') === 'true',
      node: row
    };
  });
}
function mergeDomPosted(sessions) {
  const times = new Map();
  for (const row of nativeNodes('[class*="_sessionRow"]')) {
    const titleEl = row.querySelector('[class*="_title"]');
    const timeEl = row.querySelector('[class*="_time"]');
    const title = titleEl && titleEl.textContent && titleEl.textContent.replace(/\s+/g, ' ').trim();
    const posted = timeEl && timeEl.textContent && timeEl.textContent.replace(/\s+/g, ' ').trim();
    if (title && posted) times.set(title, posted);
  }
  if (times.size === 0) return sessions;
  return sessions.map((session) => {
    if (session.posted) return session;
    const posted = times.get(session.title);
    return posted ? Object.assign({}, session, { posted }) : session;
  });
}
function readSessionModel(item) {
  if (!item || typeof item !== 'object') return '';
  if (item.model) return String(item.model);
  if (item.modelId) return String(item.modelId);
  const pv = item.projectionValues || {};
  const raw = pv.model || pv.selectedModel || pv.currentModel;
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  return String(raw.model || raw.name || raw.id || '');
}
function normalizeSession(item, index) {
  if (!item) return null;
  if (typeof item === 'string') return { id: item, title: item, posted: null, selected: false, tags: [], workspace: '', model: '' };
  const id = item.id || item.sessionId || item.key || `anon:${index}`;
  return {
    id: String(id),
    title: item.displayTitle || item.title || item.name || item.label || String(id),
    subtitle: item.subtitle || item.preview || '',
    posted: item.updatedAt || item.updated_at || item.mtime || item.modifiedAt
      || item.createdAt || item.created_at || item.posted || item.time || item.relativeTime || null,
    cwd: item.cwd || item.path || '',
    model: readSessionModel(item),
    workspace: item.workspace || item.workspaceName || '',
    tags: nativeTagValues(item),
    projectionValues: item.projectionValues || null,
    pages: item.messageCount || item.pages || null,
    selected: item.selected === true || item.current === true,
    node: null
  };
}
function decorateSessions(rows, workspaceSnap) {
  const list = Array.isArray(rows) ? rows : [];
  const items = workspaceSnap && Array.isArray(workspaceSnap.items) ? workspaceSnap.items : [];
  const archived = new Set((workspaceSnap && workspaceSnap.archivedSessionIds) || []);
  return list.filter((session) => !archived.has(session.id)).map((session) => {
    if (session.workspace) return session;
    const ws = items.find((item) => Array.isArray(item.sessionIds) && item.sessionIds.map(String).includes(String(session.id)));
    const workspace = (ws && ws.title) || pathBasename(session.cwd);
    return workspace ? Object.assign({}, session, { workspace }) : session;
  });
}
function pickSessions(snap) {
  if (!snap) return [];
  if (Array.isArray(snap)) return snap.map(normalizeSession).filter(Boolean);
  if (snap.byId && typeof snap.byId === 'object') {
    const ids = Array.isArray(snap.ids) ? snap.ids
      : Array.isArray(snap.order) ? snap.order
      : Object.keys(snap.byId);
    const current = snap.current || snap.currentId || snap.selectedId;
    return ids.map((id, index) => {
      const item = snap.byId[id];
      if (!item) return null;
      return normalizeSession(Object.assign({}, item, { id, selected: String(id) === String(current) }), index);
    }).filter(Boolean);
  }
  const list = snap.sessions || snap.items || snap.list || snap.rows;
  if (Array.isArray(list)) return list.map(normalizeSession).filter(Boolean);
  return [];
}
function currentIdFrom(snap, sessions) {
  if (snap && typeof snap === 'object' && !Array.isArray(snap)) {
    const id = snap.currentId || snap.selectedId || snap.activeId || snap.sessionId;
    if (id) return String(id);
  }
  const selected = sessions.find((item) => item.selected);
  return selected ? selected.id : null;
}

function createNativeBridge(ctx) {
  const serviceOf = (name, fallback) => {
    try {
      if (typeof ctx.get === 'function') {
        const value = ctx.get(name);
        if (value) return value;
      }
    } catch {}
    try {
      if (fallback) return fallback();
    } catch {}
    return ctx[name] || null;
  };
  const sessionsOf = () => serviceOf('sessions', () => ctx.sessions);
  const conversationOf = () => serviceOf('conversation', () => ctx.conversation);
  const clickMenuOption = (names) => {
    const lowered = names.map((name) => String(name || '').toLowerCase());
    const nodes = nativeNodes('[role="menuitem"], [role="option"], [role="radio"], button, [role="button"]');
    for (const node of nodes) {
      const aria = nodeName(node);
      const text = nodeText(node);
      if (lowered.some((name) => name && (aria === name || text === name || aria.startsWith(name + ',') || text.startsWith(name + ' ')))) {
        node.click();
        return true;
      }
    }
    return false;
  };
  const readConnection = () => {
    try {
      const conn = serviceOf('connection', () => ctx.connection);
      if (!conn) return { state: 'unknown', label: 'idle' };
      const snap = typeof conn.getSnapshot === 'function' ? conn.getSnapshot()
        : typeof conn.status === 'function' ? conn.status()
          : conn.status || conn.state;
      const text = typeof snap === 'string' ? snap : (snap && (snap.state || snap.status || snap.phase)) || 'unknown';
      const lower = String(text).toLowerCase();
      if (lower.includes('connect') && !lower.includes('disconnect')) return { state: 'up', label: 'connected' };
      if (lower.includes('reconnect') || lower.includes('retry')) return { state: 'warn', label: 'reconnecting' };
      if (lower.includes('close') || lower.includes('disconnect') || lower.includes('error')) return { state: 'down', label: 'offline' };
      return { state: 'unknown', label: String(text) };
    } catch {
      return { state: 'unknown', label: 'idle' };
    }
  };
  const selectSession = (session, props) => {
    try {
      if (props && typeof props.useSessions === 'function') {
        const snap = props.useSessions();
        if (snap && typeof snap.select === 'function') { snap.select(session.id); return true; }
        if (snap && typeof snap.open === 'function') { snap.open(session.id); return true; }
      }
    } catch {}
    try {
      const sessions = sessionsOf();
      if (sessions && typeof sessions.select === 'function') { sessions.select(session.id); return true; }
      if (sessions && typeof sessions.setCurrent === 'function') { sessions.setCurrent(session.id); return true; }
      if (sessions && typeof sessions.open === 'function') { sessions.open(session.id); return true; }
    } catch {}
    if (session.node) { session.node.click(); return true; }
    const rows = nativeNodes('[class*="_sessionRow"]');
    const hit = rows.find((row) => (row.textContent || '').replace(/\s+/g, ' ').includes(session.title));
    if (hit) { hit.click(); return true; }
    return false;
  };
  const startSession = () => {
    if (clickClass('_newSession')) return true;
    const workspaceNew = nativeNodes('button, [role="button"]').find((node) =>
      nodeName(node).startsWith('new session in')
    );
    if (workspaceNew) { workspaceNew.click(); return true; }
    try {
      const sessions = sessionsOf();
      if (sessions && typeof sessions.create === 'function') { sessions.create(); return true; }
    } catch {}
    return clickNamed(['new session', 'new chat', 'new conversation', '新会话', '新建会话'], {
      skip: (node) => /_brand/.test(String(node.className || ''))
    });
  };
  const openSettings = () => {
    const trigger = nativeNodes('button, [role="button"]').find((node) => {
      const cls = String(node.className || '');
      const text = nodeText(node);
      return /_trigger/.test(cls) && (text === 'settings' || text.startsWith('settings '));
    });
    if (trigger) {
      if (trigger.getAttribute('aria-expanded') !== 'true') trigger.click();
      return true;
    }
    try {
      if (ctx.layout && typeof ctx.layout.open === 'function') { ctx.layout.open('settings'); return true; }
      if (ctx.layout && typeof ctx.layout.show === 'function') { ctx.layout.show('settings'); return true; }
    } catch {}
    if (clickNamed(['settings', '设置'], { exact: true })) return true;
    const rail = nativeNodes('[class*="_trigger"][class*="_rail"], [class$="_rail"]').find((node) => {
      const label = `${node.getAttribute('aria-label') || ''} ${node.textContent || ''}`.toLowerCase();
      return !label || label.includes('setting') || label.includes('workspace');
    });
    if (rail) { rail.click(); return true; }
    return false;
  };
  const closeSettings = () => {
    const closeBtn = nativeNodes('button').find((node) => {
      const cls = String(node.className || '');
      return /_close/.test(cls) && node.closest('[role="dialog"]');
    });
    if (closeBtn) { closeBtn.click(); return true; }
    const trigger = nativeNodes('button, [role="button"]').find((node) => {
      const cls = String(node.className || '');
      const text = nodeText(node);
      return /_trigger/.test(cls) && (text === 'settings' || text.startsWith('settings '));
    });
    if (trigger && trigger.getAttribute('aria-expanded') === 'true') {
      trigger.click();
      return true;
    }
    try {
      if (ctx.layout && typeof ctx.layout.close === 'function') { ctx.layout.close('settings'); return true; }
      if (ctx.layout && typeof ctx.layout.hide === 'function') { ctx.layout.hide('settings'); return true; }
    } catch {}
    return false;
  };
  const listSessions = () => {
    try {
      const sessions = sessionsOf();
      if (sessions) {
        if (sessions.list && typeof sessions.list.getSnapshot === 'function') {
          const rows = pickSessions(sessions.list.getSnapshot());
          if (rows.length) return mergeDomPosted(rows);
        }
        if (typeof sessions.getSnapshot === 'function') {
          const rows = pickSessions(sessions.getSnapshot());
          if (rows.length) return mergeDomPosted(rows);
        }
        if (typeof sessions.list === 'function') {
          const rows = pickSessions(sessions.list());
          if (rows.length) return mergeDomPosted(rows);
        }
      }
    } catch {}
    return readDomSessions();
  };
  const openWorkspace = () => clickNamed(['workspace', 'workspaces', 'add workspace', '工作区', 'files', '文件'], { exact: true })
    || clickNamed(['workspace', 'workspaces', '工作区']);
  const openSearch = () => clickNamed(['search sessions', 'search sessions...'], { exact: true })
    || clickNamed(['search sessions']);
  const openCommands = () => clickNamed(['commands', 'command', '命令'], { exact: true });
  const sendPlain = (text, sessionId) => {
    const trimmed = String(text || '');
    if (!trimmed) return false;
    try {
      if (sessionId) {
        const sessions = sessionsOf();
        if (sessions && typeof sessions.scope === 'function') {
          const scoped = sessions.scope(sessionId);
          if (scoped && scoped.conversation && typeof scoped.conversation.send === 'function') {
            scoped.conversation.send(trimmed, 'queue');
            return true;
          }
        }
      }
    } catch {}
    const composer = findComposer();
    if (composer) {
      if (composer.getAttribute('contenteditable') === 'true') {
        composer.focus();
        composer.textContent = trimmed;
        composer.dispatchEvent(new InputEvent('input', { bubbles: true, data: trimmed }));
      } else {
        composer.focus();
        setNativeValue(composer, trimmed);
      }
    }
    const send = findSendButton();
    if (send && !send.disabled) { send.click(); return true; }
    if (composer) {
      composer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      return true;
    }
    return false;
  };
  const attachFiles = (fileList, sessionId) => {
    const files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return false;
    try {
      const conversation = conversationOf();
      if (conversation && typeof conversation.createDraftImages === 'function') {
        const images = conversation.createDraftImages(files);
        const hub = conversation.input;
        const sessions = sessionsOf();
        const id = sessionId || (sessions && sessions.list && typeof sessions.list.getSnapshot === 'function'
          ? currentIdFrom(sessions.list.getSnapshot(), [])
          : null);
        const shell = hub && id && typeof hub.shell === 'function' ? hub.shell(id) : null;
        if (shell && typeof shell.addImages === 'function') {
          const ids = images.map((image) => image.id);
          if (!shell.addImages(ids)) {
            if (typeof conversation.releaseDraftImages === 'function') conversation.releaseDraftImages(images);
            return false;
          }
          return true;
        }
        if (typeof conversation.releaseDraftImages === 'function') conversation.releaseDraftImages(images);
      }
    } catch {}
    try {
      const transfer = new DataTransfer();
      for (const file of files) transfer.items.add(file);
      const event = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer });
      document.dispatchEvent(event);
      if (event.defaultPrevented) return true;
    } catch {}
    const input = nativeNodes('input[type="file"]')[0];
    if (input) {
      try {
        const transfer = new DataTransfer();
        for (const file of files) transfer.items.add(file);
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } catch {}
    }
    return clickNamed(['attach', 'attachment', 'upload', '附件', '上传']);
  };
  const listDraftFiles = (sessionId) => {
    try {
      const conversation = conversationOf();
      if (!conversation || !sessionId) return [];
      const hub = conversation.input;
      const shell = hub && typeof hub.shell === 'function' ? hub.shell(sessionId) : null;
      const ids = shell && Array.isArray(shell.imageIds) ? shell.imageIds : [];
      if (!ids.length) return [];
      if (typeof conversation.draftImages === 'function') {
        return conversation.draftImages(ids).map((item) => {
          const file = item && item.file;
          return (file && file.name) || item.name || item.id;
        }).filter(Boolean);
      }
      return ids;
    } catch {
      return [];
    }
  };
  const openModelPicker = () => clickNamed(['select model', 'model', 'models', '模型'], { exact: true })
    || clickNamed(['model', 'models', '模型']);
  const sessionFace = (sessionId) => {
    try {
      const sessions = sessionsOf();
      if (sessions && typeof sessions.binding === 'function') {
        const bound = sessions.binding(sessionId);
        if (bound && bound.session) return bound.session;
      }
    } catch {}
    return null;
  };
  const readProjection = (sessionId, key) => {
    try {
      const session = sessionFace(sessionId);
      if (session && session.projections && typeof session.projections.faceOf === 'function') {
        return session.projections.faceOf(key).getSnapshot();
      }
    } catch {}
    return null;
  };
  const readSessionStats = (sessionId) => {
    if (!sessionId) return { stats: null, tokens: null };
    return {
      stats: readProjection(sessionId, 'sessionStats'),
      tokens: readProjection(sessionId, 'tokenUsage')
    };
  };
  const sessionsWire = () => {
    try {
      const api = ctx.connection && ctx.connection.api;
      return api && api.sessions ? api.sessions : null;
    } catch {
      return null;
    }
  };
  const renameSession = async (sessionId, title) => {
    const session = sessionFace(sessionId);
    if (session && typeof session.rename === 'function') {
      const result = await session.rename(title);
      if (result && result.ok === false) throw new Error((result.error && result.error.message) || 'rename failed');
      return true;
    }
    return false;
  };
  const forkSession = async (sessionId) => {
    const sessions = sessionsOf();
    if (sessions && typeof sessions.fork === 'function') {
      const childId = await sessions.fork({ sessionId, increaseTitle: true });
      if (childId && typeof sessions.open === 'function') sessions.open(childId);
      return childId;
    }
    clickNamed(['fork session', 'fork', '分叉', '复制会话']);
    return null;
  };
  const archiveSession = async (sessionId) => {
    if (ctx.workspaces && typeof ctx.workspaces.archiveSession === 'function') {
      await ctx.workspaces.archiveSession(sessionId);
      return true;
    }
    return clickNamed(['archive session', 'archive', '归档']);
  };
  const listWorkspaces = () => {
    try {
      if (ctx.workspaces && ctx.workspaces.list && typeof ctx.workspaces.list.getSnapshot === 'function') {
        return ctx.workspaces.list.getSnapshot();
      }
    } catch {}
    return { items: [], archivedSessionIds: [] };
  };
  const emptyDirectory = () => ({ current: null, groups: [], failures: [], status: 'idle', error: null, routable: null });
  const listModels = async (sessionId) => {
    if (!sessionId) return emptyDirectory();
    try {
      const dirs = typeof ctx.get === 'function' ? ctx.get('modelDirectories') : ctx.modelDirectories;
      if (dirs && typeof dirs.directoryFor === 'function') {
        const directory = dirs.directoryFor(sessionId);
        await directory.load();
        return directory.store.getSnapshot();
      }
    } catch {}
    try {
      const wire = sessionsWire();
      if (wire && typeof wire.models === 'function') {
        const { result } = await wire.models({ sessionId });
        if (result && result.ok) {
          return Object.assign(emptyDirectory(), result.value, { status: 'ready' });
        }
        return Object.assign(emptyDirectory(), { status: 'error', error: result && result.error && result.error.message });
      }
    } catch (err) {
      return Object.assign(emptyDirectory(), { status: 'error', error: String(err && err.message || err) });
    }
    const label = nativeNodes('button').find((node) => /select model|选择模型/.test(nodeName(node)));
    const aria = label ? label.getAttribute('aria-label') || '' : '';
    const match = aria.match(/current[:\s]+(.+)$/i);
    if (match) {
      return Object.assign(emptyDirectory(), {
        current: { provider: '', model: match[1].trim() },
        status: 'ready'
      });
    }
    return Object.assign(emptyDirectory(), { status: 'error', error: 'model directory unavailable' });
  };
  const selectModel = async (sessionId, selection) => {
    const payload = modelSelectionOf(selection);
    if (!sessionId || !payload) return false;
    try {
      const dirs = typeof ctx.get === 'function' ? ctx.get('modelDirectories') : ctx.modelDirectories;
      if (dirs && typeof dirs.directoryFor === 'function') {
        await dirs.directoryFor(sessionId).select(payload);
        return true;
      }
    } catch {}
    try {
      const wire = sessionsWire();
      if (wire && typeof wire.selectModel === 'function') {
        const { result } = await wire.selectModel(Object.assign({ sessionId }, payload));
        return !!(result && result.ok);
      }
    } catch {}
    return false;
  };
  const defaultPermissionOptions = () => ([
    { value: 'read-only', name: 'read-only' },
    { value: 'workspace-write', name: 'workspace-write' },
    { value: FULL_ACCESS, name: FULL_ACCESS }
  ]);
  const readPermissions = (sessionId) => {
    try {
      const session = sessionFace(sessionId);
      if (session && session.projections && typeof session.projections.faceOf === 'function') {
        const snap = session.projections.faceOf('permissions').getSnapshot();
        if (snap && Array.isArray(snap.options) && snap.options.length) return snap;
        if (snap && snap.currentValue) {
          return {
            currentValue: snap.currentValue,
            options: defaultPermissionOptions()
          };
        }
      }
    } catch {}
    const btn = nativeNodes('button').find((node) => /access mode|访问模式/.test(nodeName(node)));
    if (!btn) return { currentValue: 'workspace-write', options: defaultPermissionOptions() };
    const aria = btn.getAttribute('aria-label') || '';
    const match = aria.match(/current[:\s]+(.+)$/i);
    const label = match ? match[1].trim() : '';
    const currentValue = label === 'Full access' || /full access/i.test(label)
      ? FULL_ACCESS
      : label.toLowerCase().replace(/\s+/g, '-');
    return {
      currentValue: currentValue || 'workspace-write',
      options: defaultPermissionOptions()
    };
  };
  const setPermission = async (sessionId, preset) => {
    if (!sessionId || !preset) return false;
    const session = sessionFace(sessionId);
    if (session && typeof session.command === 'function') {
      try {
        const result = await session.command(`/permission ${preset}`);
        if (result && result.ok && (!result.value || result.value.matched !== false)) return true;
        if (result === true) return true;
      } catch {}
    }
    if (clickNamed(['access mode', '访问模式'])) {
      const labels = [permissionLabel({ value: preset, name: preset }), preset, String(preset).replace(/-/g, ' ')];
      window.setTimeout(() => { clickMenuOption(labels); }, 0);
      return true;
    }
    return false;
  };
  const sendPrompt = (text, sessionId) => {
    const trimmed = String(text || '').trim();
    if (!trimmed) return false;
    if (/^\/[A-Za-z][\w-]*/.test(trimmed)) return runCommand(sessionId, trimmed);
    return sendPlain(trimmed, sessionId);
  };
  const runCommand = (sessionId, line) => {
    const trimmed = String(line || '').trim();
    if (!trimmed) return false;
    try {
      const session = sessionFace(sessionId);
      if (session && typeof session.command === 'function') {
        Promise.resolve(session.command(trimmed)).catch(() => {});
        return true;
      }
    } catch {}
    return sendPlain(trimmed, sessionId);
  };
  const openSessionLog = () => clickNamed(['session log'], { exact: true })
    || clickNamed(['session log', 'export', '导出']);
  const presetButton = () => nativeNodes('button').find((node) => {
    if (node.closest('[role="dialog"], [class*="_settings"], [class*="_drawer"]')) return false;
    const label = `${node.getAttribute('aria-label') || ''} ${node.getAttribute('title') || ''} ${node.textContent || ''}`;
    return /standard mode|minimal mode|creator mode|ptc mode|code mode/i.test(label)
      || /agent preset for/i.test(label);
  });
  const readPreset = () => {
    const btn = presetButton();
    const text = btn && (btn.textContent || '').replace(/\s+/g, ' ').trim();
    if (text) return text;
    const header = nativeNodes('[class*="_titleRow"], [class*="_header"]').find((node) => /mode/i.test(node.textContent || ''));
    const match = header && (header.textContent || '').match(/(Standard|PTC|Minimal|Creator|Code)\s+mode/i);
    return match ? `${match[1]} mode` : '';
  };
  const listPresets = () => DEFAULT_PRESETS.slice();
  const selectPreset = (label) => {
    const btn = presetButton();
    if (btn && !btn.disabled) {
      btn.click();
      window.setTimeout(() => {
        clickMenuOption([label, String(label).replace(/\s+mode$/i, ''), `${String(label).replace(/\s+mode$/i, '')} mode`]);
      }, 0);
      return true;
    }
    return false;
  };
  const listLocales = () => {
    try {
      const locale = serviceOf('locale', () => ctx.locale);
      const rows = locale && (
        typeof locale.list === 'function' ? locale.list()
          : typeof locale.locales === 'function' ? locale.locales()
            : locale.locales || locale.available
      );
      if (Array.isArray(rows) && rows.length) {
        return rows.map((item) => {
          if (typeof item === 'string') {
            return { id: item, label: item === 'zh' || item === 'zh-CN' ? '中文' : item === 'en' ? 'English' : item };
          }
          const id = item && (item.id || item.code || item.locale);
          if (!id) return null;
          return { id, label: item.label || item.name || id };
        }).filter(Boolean);
      }
      if (locale && (typeof locale.setLocale === 'function' || typeof locale.set === 'function')) {
        return HOST_LOCALES.slice();
      }
    } catch {}
    return [];
  };
  const readLocale = () => {
    try {
      const locale = serviceOf('locale', () => ctx.locale);
      if (locale) {
        if (typeof locale.getLocale === 'function') {
          const value = locale.getLocale();
          if (typeof value === 'string' && value) return value;
          const id = value && (value.id || value.code || value.locale);
          if (id) return id;
        }
        const snap = typeof locale.getSnapshot === 'function' ? locale.getSnapshot() : locale.active || locale.current;
        if (typeof snap === 'string' && snap) return snap;
        const id = snap && (snap.id || snap.code || snap.locale);
        if (id) return id;
      }
    } catch {}
    try {
      return String(document.documentElement.getAttribute('lang') || '').trim();
    } catch {}
    return '';
  };
  const setLocale = (id) => {
    if (!id) return false;
    try {
      const locale = serviceOf('locale', () => ctx.locale);
      if (!locale) return false;
      if (typeof locale.setLocale === 'function') { locale.setLocale(id); return true; }
      if (typeof locale.set === 'function') { locale.set(id); return true; }
    } catch {}
    return false;
  };
  const openConfigFile = () => {
    openSettings();
    window.setTimeout(() => {
      clickNamed(['open configuration file'], { exact: true })
        || clickNamed(['open configuration file', 'configuration file']);
    }, 80);
    return true;
  };
  return {
    readConnection, selectSession, startSession, openSettings, closeSettings, openWorkspace,
    openSearch, openCommands, sendPrompt, attachFiles, openModelPicker, listSessions,
    renameSession, forkSession, archiveSession, listWorkspaces, listModels, selectModel,
    readPermissions, setPermission, listDraftFiles, runCommand, openSessionLog,
    readPreset, listPresets, selectPreset, readSessionStats,
    listLocales, readLocale, setLocale, openConfigFile
  };
}

function OptRadios({ name, value, options, onChange }) {
  return h('div', { className: 'dsh-ex-optinner' },
    (options || []).map((item) => h('p', { key: item.id },
      h('label', { className: 'dsh-ex-lr' },
        h('input', {
          type: 'radio',
          name,
          value: item.id,
          checked: value === item.id,
          onChange: () => onChange(item.id, item)
        }),
        h('span', null),
        item.label
      )
    ))
  );
}

function ModeRadios({ name, mode, onChange, t }) {
  return h(OptRadios, { name, value: mode, options: settingsModeOptions(t), onChange });
}

function SettingsRow({
  t: tProp, subscribeLocale,
  getEnabled, setEnabled, subscribe, getChips, setChips, subscribeChips,
  getMode, setMode, subscribeMode, getNativeSidebar, setNativeSidebar, subscribeNativeSidebar,
  getComposerMode, setComposerMode, subscribeComposerMode
}) {
  const t = typeof tProp === 'function' ? tProp : fallbackT;
  const [enabled, setLocalEnabled] = React.useState(getEnabled());
  const [chips, setLocalChips] = React.useState(getChips());
  const [mode, setLocalMode] = React.useState(getMode());
  const [nativeSidebar, setLocalSidebar] = React.useState(typeof getNativeSidebar === 'function' ? getNativeSidebar() : false);
  const [composerMode, setLocalComposer] = React.useState(typeof getComposerMode === 'function' ? getComposerMode() : 'skin');
  const [, setLocaleRev] = React.useState(0);
  React.useEffect(() => subscribe(setLocalEnabled), [subscribe]);
  React.useEffect(() => subscribeChips(setLocalChips), [subscribeChips]);
  React.useEffect(() => subscribeMode(setLocalMode), [subscribeMode]);
  React.useEffect(() => (typeof subscribeNativeSidebar === 'function' ? subscribeNativeSidebar(setLocalSidebar) : undefined), [subscribeNativeSidebar]);
  React.useEffect(() => (typeof subscribeComposerMode === 'function' ? subscribeComposerMode(setLocalComposer) : undefined), [subscribeComposerMode]);
  React.useEffect(() => (typeof subscribeLocale === 'function' ? subscribeLocale(setLocaleRev) : undefined), [subscribeLocale]);

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    padding: '14px 0',
    borderBottom: '1px solid var(--dsw-alias-border-l1)'
  };
  const copyStyle = { marginTop: '4px', color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px', lineHeight: 1.5 };
  const baseButton = {
    minWidth: '108px',
    height: '30px',
    border: '2px solid var(--dsw-alias-border-l3)',
    borderRadius: '3px',
    padding: '0 12px',
    cursor: 'pointer',
    font: 'inherit',
    background: 'var(--dsw-alias-button-elevated-fill)',
    color: 'var(--dsw-alias-label-primary)'
  };
  const buttonStyle = (selected) => Object.assign({}, baseButton, selected
    ? { color: '#f1f1f1', background: '#43464e', borderColor: '#aeaeae' }
    : null);

  return h('div', { className: 'dsh-ex-host-settings' },
    h('div', { style: rowStyle },
      h('div', { style: { minWidth: 0 } },
        h('div', { style: { color: 'var(--dsw-alias-label-primary)', fontWeight: 600 } }, t('skin.title')),
        h('div', { style: copyStyle }, t('skin.desc'))
      ),
      h('div', { style: { display: 'flex', gap: '8px', flexShrink: 0 } },
        h('button', { type: 'button', style: buttonStyle(enabled), 'aria-pressed': enabled, onClick: () => { setEnabled(true); setLocalEnabled(true); } }, t('skin.enable')),
        h('button', { type: 'button', style: buttonStyle(!enabled), 'aria-pressed': !enabled, onClick: () => { setEnabled(false); setLocalEnabled(false); } }, t('skin.system'))
      )
    ),
    h('div', { style: rowStyle },
      h('div', { style: { minWidth: 0 } },
        h('div', { style: { color: 'var(--dsw-alias-label-primary)', fontWeight: 600 } }, t('chips.title')),
        h('div', { style: copyStyle }, t('chips.desc'))
      ),
      h('button', {
        type: 'button',
        style: Object.assign({}, buttonStyle(chips), { minWidth: '132px' }),
        'aria-pressed': chips,
        onClick: () => { const next = !chips; setChips(next); setLocalChips(next); }
      }, chips ? t('chips.on') : t('chips.off'))
    ),
    h('div', { style: rowStyle },
      h('div', { style: { minWidth: 0 } },
        h('div', { style: { color: 'var(--dsw-alias-label-primary)', fontWeight: 600 } }, t('sidebar.title')),
        h('div', { style: copyStyle }, t('sidebar.desc'))
      ),
      h('div', { style: { display: 'flex', gap: '8px', flexShrink: 0 } },
        h('button', {
          type: 'button',
          style: buttonStyle(nativeSidebar),
          'aria-pressed': nativeSidebar,
          onClick: () => { if (setNativeSidebar) setNativeSidebar(true); setLocalSidebar(true); }
        }, t('sidebar.show')),
        h('button', {
          type: 'button',
          style: buttonStyle(!nativeSidebar),
          'aria-pressed': !nativeSidebar,
          onClick: () => { if (setNativeSidebar) setNativeSidebar(false); setLocalSidebar(false); }
        }, t('sidebar.hide'))
      )
    ),
    h('div', { style: rowStyle },
      h('div', { style: { minWidth: 0 } },
        h('div', { style: { color: 'var(--dsw-alias-label-primary)', fontWeight: 600 } }, t('composer.title')),
        h('div', { style: copyStyle }, t('composer.desc'))
      ),
      h('div', { style: { display: 'flex', gap: '8px', flexShrink: 0 } },
        h('button', {
          type: 'button',
          style: buttonStyle(composerMode === 'skin'),
          'aria-pressed': composerMode === 'skin',
          onClick: () => { if (setComposerMode) setComposerMode('skin'); setLocalComposer('skin'); }
        }, t('composer.skin')),
        h('button', {
          type: 'button',
          style: buttonStyle(composerMode === 'native'),
          'aria-pressed': composerMode === 'native',
          onClick: () => { if (setComposerMode) setComposerMode('native'); setLocalComposer('native'); }
        }, t('composer.native'))
      )
    ),
    h('div', { className: 'dsh-ex-optouter', style: { padding: '14px 0' } },
      h('p', { style: { margin: '0 0 8px', color: 'var(--dsw-alias-label-primary)' } }, t('mode.prompt')),
      h(ModeRadios, {
        name: 'dsh-ex-host-mode',
        mode,
        t,
        onChange: (next) => { setMode(next); setLocalMode(next); }
      })
    )
  );
}

function useStore(get, subscribe, fallback) {
  const [value, setValue] = React.useState(() => {
    try {
      if (typeof get === 'function') return get();
      return get === undefined ? fallback : get;
    } catch {
      return fallback;
    }
  });
  React.useEffect(() => {
    if (typeof subscribe !== 'function') return undefined;
    try { return subscribe(setValue); } catch { return undefined; }
  }, [subscribe]);
  return value === undefined ? fallback : value;
}

let chromeHost = null;

function hostProps(props) {
  const inject = props && props.inject && typeof props.inject === 'object' ? props.inject : {};
  return Object.assign({}, chromeHost || {}, inject, props || {});
}

function createPortalNode(node, target) {
  try {
    const rd = require('react-dom');
    const fn = rd.createPortal || (rd.default && rd.default.createPortal);
    if (typeof fn === 'function') return fn(node, target);
  } catch {}
  return node;
}

function NavBar({ view, onNav }) {
  const items = [
    { id: 'index', label: 'Front Page' },
    { id: 'new', label: 'New Session' },
    { id: 'popular', label: 'Popular' },
    { id: 'files', label: 'Workspaces' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'settings', label: 'Settings' }
  ];
  return h('nav', { className: 'dsh-ex-nb', 'aria-label': 'Gallery' },
    items.map((item) => h('button', {
      key: item.id,
      type: 'button',
      'aria-current': view === item.id ? 'page' : undefined,
      onClick: () => onNav(item.id)
    }, item.label))
  );
}

function CategoryTable({ items, enabled, onToggle }) {
  const chips = Array.isArray(items) && items.length ? items : CATEGORIES;
  const rows = [chips.slice(0, 5), chips.slice(5, 10)];
  return h('table', { className: 'dsh-ex-cats' },
    h('tbody', null,
      rows.map((row, rowIndex) => h('tr', { key: rowIndex },
        row.map((cat) => h('td', { key: cat.id },
          h('button', {
            type: 'button',
            className: `dsh-ex-cs dsh-ex-${cat.tone || toneFor(cat.id)}`,
            title: cat.label,
            'data-off': enabled.includes(cat.id) ? undefined : '1',
            'aria-pressed': enabled.includes(cat.id),
            onClick: () => onToggle(cat.id)
          }, cat.label)
        ))
      ))
    )
  );
}

function stopRow(event) {
  event.stopPropagation();
}

function SessionTable({ sessions, currentId, mode, onOpen, onFav, favs, showActions, onRename, onFork, onArchive }) {
  if (sessions.length === 0) {
    return h('div', { className: 'dsh-ex-empty' }, 'No galleries found.');
  }
  if (mode === 'thumbnail') {
    return h('div', { className: 'dsh-ex-thumbs' },
      sessions.map((session) => {
        const lead = sessionTagItems(session)[0] || categoryFor(session);
        return h('div', {
          key: session.id,
          className: 'dsh-ex-thumb',
          role: 'button',
          tabIndex: 0,
          'aria-selected': session.id === currentId,
          onClick: () => onOpen(session),
          onKeyDown: (event) => { if (event.key === 'Enter') onOpen(session); }
        },
          h('div', { className: 'dsh-ex-thumb-art', 'aria-hidden': 'true' }),
          h('button', { type: 'button', className: `dsh-ex-cs dsh-ex-${lead.tone}`, style: { width: 108, margin: '8px auto 0' }, title: lead.label }, lead.label),
          h('div', { className: 'dsh-ex-glink' }, session.title),
          h('div', { className: 'dsh-ex-pages' }, formatPosted(session.posted))
        );
      })
    );
  }
  const hideTags = mode === 'minimal';
  return h('table', { className: `dsh-ex-itg${hideTags ? ' dsh-ex-minimal' : ''}` },
    h('thead', null,
      h('tr', null,
        h('th', null),
        h('th', null, 'Published'),
        h('th', null, 'Title'),
        showActions ? h('th', { className: 'dsh-ex-hide-wide' }, 'Action') : null
      )
    ),
    h('tbody', null,
      sessions.map((session) => {
        const tags = sessionTagItems(session);
        const lead = tags[0] || categoryFor(session);
        return h('tr', {
          key: session.id,
          'aria-selected': session.id === currentId,
          onClick: () => onOpen(session)
        },
          h('td', { className: 'dsh-ex-catcell' },
            h('button', { type: 'button', className: `dsh-ex-cs dsh-ex-${lead.tone}`, style: { width: 88 }, title: lead.label, onClick: (event) => { event.stopPropagation(); onOpen(session); } }, lead.label)
          ),
          h('td', { className: 'dsh-ex-posted' },
            h('div', null, formatPosted(session.posted)),
            h('div', null,
              h('button', {
                type: 'button',
                className: 'dsh-ex-text',
                title: 'Favorite',
                style: { background: 'none', border: 0, color: favs.includes(session.id) ? '#fb7878' : '#c2a8a4', minHeight: 'auto' },
                onClick: (event) => { event.stopPropagation(); onFav(session.id); }
              }, favs.includes(session.id) ? '♥' : '♡')
            )
          ),
          h('td', null,
            h('div', { className: 'dsh-ex-glink' }, session.title),
            hideTags ? null : h('div', { className: 'dsh-ex-tags' },
              tags.map((tag) => h('div', { key: tag.id, className: 'dsh-ex-gt', title: tag.label }, tag.label))
            )
          ),
          showActions ? h('td', { className: 'dsh-ex-uploader dsh-ex-hide-wide', onClick: stopRow },
            h('button', { type: 'button', className: 'dsh-ex-action', onClick: () => onRename(session) }, 'Rename'),
            h('button', { type: 'button', className: 'dsh-ex-action', onClick: () => onFork(session) }, 'Fork'),
            h('button', { type: 'button', className: 'dsh-ex-action', onClick: () => onArchive(session) }, 'Archive')
          ) : null
        );
      })
    )
  );
}

function FileSearchPanel({ native, sessionId, note, onNote, draftFiles, onDraftFiles }) {
  const names = Array.isArray(draftFiles) ? draftFiles : [];
  return h('div', { className: 'dsh-ex-files' },
    h('p', null, 'File Search — attach a local image to the next prompt.'),
    h('input', {
      type: 'file',
      multiple: true,
      accept: 'image/*',
      'aria-label': 'Attach files',
      onChange: (event) => {
        const files = event.target.files;
        const picked = Array.prototype.map.call(files || [], (file) => file.name).join(', ');
        const ok = native.attachFiles(files, sessionId);
        if (onNote) onNote(ok ? (picked ? `Attached: ${picked}` : 'Attached.') : (picked ? `Could not attach ${picked}` : 'Could not attach files.'));
        if (onDraftFiles && typeof native.listDraftFiles === 'function') {
          onDraftFiles(native.listDraftFiles(sessionId) || []);
        }
        event.target.value = '';
      }
    }),
    names.length ? h('p', null, 'Queued: ', names.join(', ')) : null,
    note ? h('p', { className: 'dsh-ex-dim' }, note) : null
  );
}

function sessionNeeded() {
  return h('div', { className: 'dsh-ex-adv' }, h('p', { className: 'dsh-ex-dim' }, 'Open a session first.'));
}

function ModelPanel({ sessionId, modelDir, onSelectModel }) {
  if (!sessionId) return sessionNeeded();
  const choices = flattenModelChoices(modelDir);
  const selectedModel = currentModelId(modelDir, choices);
  return h('div', { className: 'dsh-ex-adv' },
    h('p', null, 'Model'),
    modelDir && modelDir.status === 'loading' ? h('p', { className: 'dsh-ex-dim' }, 'Loading models…') : null,
    modelDir && modelDir.error ? h('p', { className: 'dsh-ex-error' }, modelDir.error) : null,
    choices.length === 0 && (!modelDir || modelDir.status !== 'loading')
      ? h('p', { className: 'dsh-ex-dim' }, 'No models available for this session.')
      : choices.map((item) => h('label', { key: item.id, className: 'dsh-ex-lr', title: `${item.group} / ${item.label}` },
        h('input', {
          type: 'radio',
          name: 'dsh-ex-model',
          checked: selectedModel === item.id,
          onChange: () => onSelectModel(item.selection)
        }),
        h('span', null),
        item.group && item.group !== item.label ? `${item.group} — ${item.label}` : item.label
      ))
  );
}

function AccessPanel({ sessionId, permState, onSelectPerm }) {
  if (!sessionId) return sessionNeeded();
  const options = permState && Array.isArray(permState.options)
    ? permState.options.filter((item) => item && item.value && item.value !== 'custom')
    : [];
  const currentPerm = permState && permState.currentValue;
  return h('div', { className: 'dsh-ex-adv' },
    h('p', null, 'Access mode'),
    options.length === 0
      ? h('p', { className: 'dsh-ex-dim' }, 'Permission presets are unavailable.')
      : options.map((item) => h('label', { key: item.value, className: 'dsh-ex-lr' },
        h('input', {
          type: 'radio',
          name: 'dsh-ex-perm',
          checked: currentPerm === item.value,
          onChange: () => onSelectPerm(item.value)
        }),
        h('span', null),
        permissionLabel(item)
      ))
  );
}

function AgentPanel({ native, presetLabel }) {
  const presets = typeof native.listPresets === 'function' ? native.listPresets() : DEFAULT_PRESETS.slice();
  const current = String(presetLabel || '').toLowerCase();
  return h('div', { className: 'dsh-ex-adv' },
    h('p', null, 'Agent preset'),
    presets.map((item) => h('label', { key: item.id, className: 'dsh-ex-lr' },
      h('input', {
        type: 'radio',
        name: 'dsh-ex-preset',
        checked: current === String(item.label || '').toLowerCase()
          || current.includes(item.id)
          || current.startsWith(String(item.label || '').toLowerCase().replace(/\s+mode$/, '')),
        onChange: () => native.selectPreset(item.label)
      }),
      h('span', null),
      item.label
    )),
    h('p', { className: 'dsh-ex-dim' }, 'If radios do not apply, the preset is locked for this session; set the default in Host Settings.')
  );
}

function EffortPanel({ sessionId, modelDir, onSelectEffort }) {
  if (!sessionId) return sessionNeeded();
  const choices = effortChoices(modelDir);
  const reasoning = reasoningInfo(modelDir);
  const current = currentEffortValue(modelDir).toLowerCase()
    || String((reasoning && reasoning.defaultEffort) || '').toLowerCase();
  return h('div', { className: 'dsh-ex-adv' },
    h('p', null, 'Reasoning effort'),
    choices.length === 0
      ? h('p', { className: 'dsh-ex-dim' }, 'This model route has no selectable reasoning effort.')
      : choices.map((item) => h('label', {
        key: item.id,
        className: 'dsh-ex-lr',
        onClick: (event) => { event.preventDefault(); onSelectEffort(item.id); }
      },
        h('input', {
          type: 'radio',
          name: 'dsh-ex-effort',
          value: item.id,
          checked: current === String(item.id).toLowerCase(),
          onChange: () => onSelectEffort(item.id)
        }),
        h('span', null),
        item.label
      ))
  );
}

function CommandsPanel({ native, sessionId, setOpenOpt }) {
  const run = (item) => {
    if (item.id === 'model') { setOpenOpt('model'); return; }
    if (item.id === 'permission') { setOpenOpt('access'); return; }
    if (item.id === 'export' && typeof native.openSessionLog === 'function') {
      native.openSessionLog();
      return;
    }
    if (typeof native.runCommand === 'function') native.runCommand(sessionId, `/${item.id}`);
  };
  return h('div', { className: 'dsh-ex-adv' },
    h('p', null, 'Commands'),
    SLASH_COMMANDS.map((item) => h('p', { key: item.id },
      h('button', { type: 'button', className: 'dsh-ex-text', onClick: () => run(item) }, item.id),
      ' — ', item.hint
    ))
  );
}

function OptionLinks({ items }) {
  const nodes = [];
  items.forEach((item, index) => {
    if (index) nodes.push(' ');
    nodes.push('[');
    nodes.push(h('button', { key: item.id, type: 'button', onClick: item.onClick }, item.label));
    nodes.push(']');
  });
  return h('div', { className: 'dsh-ex-links' }, nodes);
}

function optionLinkLabel(open, id, noun, value) {
  if (open === id) return `Hide ${noun}`;
  const shown = shortLabel(value, '');
  return shown ? `${noun}: ${shown}` : noun;
}

function OpenOptionPanel(props) {
  const which = props.openOpt;
  if (which === 'model') return h(ModelPanel, props);
  if (which === 'access') return h(AccessPanel, props);
  if (which === 'agent') return h(AgentPanel, props);
  if (which === 'effort') return h(EffortPanel, props);
  if (which === 'commands') return h(CommandsPanel, props);
  if (which === 'files') return h(FileSearchPanel, props);
  return null;
}

function RenameDialog({ draft, setDraft, error, onCancel, onConfirm }) {
  return h('div', { className: 'dsh-ex-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Rename session' },
    h('div', { className: 'dsh-ex-modal-box' },
      h('p', null, 'Rename session'),
      h('input', {
        type: 'text',
        value: draft,
        autoFocus: true,
        'aria-label': 'Session title',
        onChange: (event) => setDraft(event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Enter') { event.preventDefault(); onConfirm(); }
          if (event.key === 'Escape') { event.preventDefault(); onCancel(); }
        }
      }),
      error ? h('p', { className: 'dsh-ex-error' }, error) : null,
      h('p', { className: 'dsh-ex-modal-actions' },
        h('input', { type: 'button', value: 'Cancel', onClick: onCancel }),
        ' ',
        h('input', { type: 'button', value: 'OK', onClick: onConfirm, disabled: !String(draft || '').trim() })
      )
    )
  );
}

function IndexPane({
  sessions, currentId, mode, setMode, query, setQuery, chips, cats, toggleCat,
  page, setPage, pageSize, onOpen, onFav, favs, onClear, onRename, onFork, onArchive
}) {
  const start = page * pageSize;
  const pageRows = sessions.slice(start, start + pageSize);
  const pageCount = Math.max(1, Math.ceil(sessions.length / pageSize));
  const ticks = 24;
  const tickOn = Math.min(ticks - 1, Math.round((page / Math.max(pageCount - 1, 1)) * (ticks - 1)));
  return h('div', { className: 'dsh-ex-index' },
    h('div', { className: 'dsh-ex-ido' },
      h('h1', { className: 'dsh-ex-ih' }, 'DeepSeek Harness — ', h('a', { href: '#', onClick: (event) => event.preventDefault() }, 'Now With Hentais')),
      h('div', { className: 'dsh-ex-idi' },
        h(CategoryTable, { items: chips, enabled: cats, onToggle: toggleCat }),
        h('div', { className: 'dsh-ex-search-row' },
          h('input', {
            type: 'text',
            value: query,
            placeholder: 'Search Keywords',
            maxLength: 200,
            'aria-label': 'Search sessions',
            onChange: (event) => { setQuery(event.target.value); setPage(0); }
          }),
          h('input', { type: 'button', value: 'Search', onClick: () => setPage(0) }),
          h('input', { type: 'button', value: 'Clear', onClick: onClear })
        )
      ),
      h('div', { className: 'dsh-ex-range', 'aria-hidden': 'true' },
        Array.from({ length: ticks }).map((_, index) => h('button', {
          key: index,
          type: 'button',
          'data-on': index === tickOn ? '1' : undefined,
          onClick: () => setPage(Math.min(pageCount - 1, Math.round(index / (ticks - 1) * (pageCount - 1))))
        }))
      ),
      h('div', { className: 'dsh-ex-found' }, h('p', null, `Found ${sessions.length} results.`)),
      h('div', { className: 'dsh-ex-searchnav' },
        h('div', null),
        h('div', null, h('button', { type: 'button', className: 'dsh-ex-text', disabled: page === 0, onClick: () => setPage(0) }, '<< First')),
        h('div', null, h('button', { type: 'button', className: 'dsh-ex-text', disabled: page === 0, onClick: () => setPage(page - 1) }, '< Prev')),
        h('div', null, `${page + 1} / ${pageCount}`),
        h('div', null, h('button', { type: 'button', className: 'dsh-ex-text', disabled: page >= pageCount - 1, onClick: () => setPage(page + 1) }, 'Next >')),
        h('div', null, h('button', { type: 'button', className: 'dsh-ex-text', disabled: page >= pageCount - 1, onClick: () => setPage(pageCount - 1) }, 'Last >>')),
        h('div', null,
          h('select', { value: mode, 'aria-label': 'Display mode', onChange: (event) => setMode(event.target.value) },
            MODE_OPTIONS.map((item) => h('option', { key: item.id, value: item.id }, item.label))
          )
        )
      ),
      h(SessionTable, {
        sessions: pageRows,
        currentId,
        mode,
        onOpen,
        onFav,
        favs,
        showActions: mode === 'extended' || mode === 'compact',
        onRename,
        onFork,
        onArchive
      })
    )
  );
}

function SettingsPane({
  t: tProp, enabled, setEnabled, chips, setChips, mode, setMode,
  nativeSidebar, setNativeSidebar, composerMode, setComposerMode,
  appearance, setAppearance, native, onHostSettings,
  presetLabel, permState, onSelectPerm, sessionId, modelDir, onSelectModel,
  localeRev
}) {
  const t = typeof tProp === 'function' ? tProp : fallbackT;
  const locales = typeof native.listLocales === 'function' ? native.listLocales() : [];
  const [localeId, setLocaleId] = React.useState(() => (typeof native.readLocale === 'function' ? native.readLocale() : ''));
  React.useEffect(() => {
    if (typeof native.readLocale !== 'function') return undefined;
    setLocaleId(native.readLocale() || '');
    return undefined;
  }, [native, localeRev]);
  const presets = typeof native.listPresets === 'function' ? native.listPresets() : DEFAULT_PRESETS.slice();
  const currentPreset = String(presetLabel || '').toLowerCase();
  const permOptions = permState && Array.isArray(permState.options)
    ? permState.options.filter((item) => item && item.value && item.value !== 'custom')
    : [];
  const currentPerm = permState && permState.currentValue;
  const choices = flattenModelChoices(modelDir);
  const selectedModel = currentModelId(modelDir, choices);
  const localeValue = locales.some((item) => item.id === localeId)
    ? localeId
    : (locales.find((item) => localeId && (item.id === localeId.split('-')[0] || String(item.label).toLowerCase() === String(localeId).toLowerCase())) || {}).id;
  return h('div', { className: 'dsh-ex-index' },
    h('div', { className: 'dsh-ex-stuff', id: 'dsh-ex-outer' },
      h('h2', null, t('host.title')),
      h('div', { className: 'dsh-ex-optouter' },
        h('p', null, t('host.desc')),
        h('p', null,
          h('input', { type: 'button', value: t('host.open'), onClick: onHostSettings })
        )
      ),
      h('h2', null, t('gallery.title')),
      h('div', { className: 'dsh-ex-optouter' },
        h('p', null, t('gallery.desc')),
        h(OptRadios, {
          name: 'dsh-ex-skin',
          value: enabled ? 'skin' : 'system',
          options: [
            { id: 'skin', label: t('skin.enable') },
            { id: 'system', label: t('skin.system') }
          ],
          onChange: (id) => { if (setEnabled) setEnabled(id === 'skin'); }
        })
      ),
      h('div', { className: 'dsh-ex-optouter' },
        h('p', null, t('chips.hint')),
        h('p', null,
          h('label', { className: 'dsh-ex-lc' },
            h('input', { type: 'checkbox', checked: chips, onChange: () => setChips(!chips) }),
            h('span', null),
            t('chips.enable')
          )
        )
      ),
      h('div', { className: 'dsh-ex-optouter' },
        h('p', null, t('sidebar.hint')),
        h(OptRadios, {
          name: 'dsh-ex-sidebar',
          value: nativeSidebar ? 'show' : 'hide',
          options: [
            { id: 'show', label: t('sidebar.show') },
            { id: 'hide', label: t('sidebar.hide') }
          ],
          onChange: (id) => setNativeSidebar(id === 'show')
        })
      ),
      h('div', { className: 'dsh-ex-optouter' },
        h('p', null, t('composer.hint')),
        h(OptRadios, {
          name: 'dsh-ex-composer',
          value: composerMode,
          options: [
            { id: 'skin', label: t('composer.skin') },
            { id: 'native', label: t('composer.native') }
          ],
          onChange: setComposerMode
        })
      ),
      h('h2', null, t('display.title')),
      h('div', { className: 'dsh-ex-optouter' },
        h('p', null, t('mode.prompt')),
        h(ModeRadios, { name: 'dsh-ex-settings-mode', mode, t, onChange: setMode })
      ),
      h('h2', null, t('preset.title')),
      h('div', { className: 'dsh-ex-optouter' },
        h('p', null, t('preset.desc')),
        h('div', { className: 'dsh-ex-optinner' },
          presets.map((item) => h('p', { key: item.id },
            h('label', { className: 'dsh-ex-lr' },
              h('input', {
                type: 'radio',
                name: 'dsh-ex-settings-preset',
                checked: currentPreset === String(item.label || '').toLowerCase()
                  || currentPreset.includes(item.id)
                  || currentPreset.startsWith(String(item.label || '').toLowerCase().replace(/\s+mode$/, '')),
                onChange: () => native.selectPreset(item.label)
              }),
              h('span', null),
              item.label
            )
          ))
        )
      ),
      h('h2', null, t('perm.title')),
      h('div', { className: 'dsh-ex-optouter' },
        h('p', null, t('perm.desc')),
        !sessionId
          ? h('p', { className: 'dsh-ex-dim' }, t('perm.needSession'))
          : permOptions.length === 0
            ? h('p', { className: 'dsh-ex-dim' }, t('perm.unavailable'))
            : h('div', { className: 'dsh-ex-optinner' },
              permOptions.map((item) => h('p', { key: item.value },
                h('label', { className: 'dsh-ex-lr' },
                  h('input', {
                    type: 'radio',
                    name: 'dsh-ex-settings-perm',
                    checked: currentPerm === item.value,
                    onChange: () => onSelectPerm(item.value)
                  }),
                  h('span', null),
                  permissionLabel(item)
                )
              ))
            )
      ),
      h('h2', null, t('appearance.title')),
      h('div', { className: 'dsh-ex-optouter' },
        h('p', null, t('appearance.desc')),
        h(OptRadios, {
          name: 'dsh-ex-appearance',
          value: appearance,
          options: settingsAppearanceOptions(t),
          onChange: setAppearance
        })
      ),
      locales.length ? h('h2', null, t('language.title')) : null,
      locales.length ? h('div', { className: 'dsh-ex-optouter' },
        h('p', null, t('language.desc')),
        h(OptRadios, {
          name: 'dsh-ex-locale',
          value: localeValue || locales[0].id,
          options: locales,
          onChange: (id) => {
            if (typeof native.setLocale === 'function' && native.setLocale(id)) setLocaleId(id);
          }
        })
      ) : null,
      h('h2', null, t('models.title')),
      h('div', { className: 'dsh-ex-optouter' },
        h('p', null, t('models.desc')),
        !sessionId
          ? h('p', { className: 'dsh-ex-dim' }, t('perm.needSession'))
          : h('div', { className: 'dsh-ex-optinner' },
            modelDir && modelDir.status === 'loading' ? h('p', { className: 'dsh-ex-dim' }, t('models.loading')) : null,
            modelDir && modelDir.error ? h('p', { className: 'dsh-ex-error' }, modelDir.error) : null,
            choices.length === 0 && (!modelDir || modelDir.status !== 'loading')
              ? h('p', { className: 'dsh-ex-dim' }, t('models.empty'))
              : choices.map((item) => h('p', { key: item.id },
                h('label', { className: 'dsh-ex-lr', title: `${item.group} / ${item.label}` },
                  h('input', {
                    type: 'radio',
                    name: 'dsh-ex-settings-model',
                    checked: selectedModel === item.id,
                    onChange: () => onSelectModel(item.selection)
                  }),
                  h('span', null),
                  item.group && item.group !== item.label ? `${item.group} — ${item.label}` : item.label
                )
              ))
          )
      )
    )
  );
}

function ComposerDock({
  title, modelLabel, meter, query, setQuery,
  openOpt, setOpenOpt, native, sessionId, onSent,
  modelDir, onSelectModel, onSelectEffort, permState, onSelectPerm,
  fileNote, onFileNote, draftFiles, onDraftFiles, presetLabel
}) {
  const send = () => {
    if (native.sendPrompt(query, sessionId)) {
      setQuery('');
      if (onSent) onSent();
    }
  };
  const toggle = (id) => setOpenOpt(openOpt === id ? null : id);
  const permLabel = permissionLabel({
    value: permState && permState.currentValue,
    name: permState && permState.currentValue
  });
  const effort = currentEffortValue(modelDir);
  const groups = Array.isArray(meter) ? meter : [];
  const meterNodes = [];
  groups.forEach((group, index) => {
    if (index) meterNodes.push(h('span', { key: `sep-${index}`, className: 'dsh-ex-gsep' }, '|'));
    meterNodes.push(h('span', { key: `g-${index}` }, group));
  });
  return h('div', { className: 'dsh-ex-composer' },
    h('div', { className: 'dsh-ex-gm' },
      h('div', { className: 'dsh-ex-gn' }, title || 'Untitled gallery'),
      h('div', { className: 'dsh-ex-gj' }, modelLabel || 'Select model'),
      groups.length ? h('div', { className: 'dsh-ex-gmeta', 'aria-label': 'Session stats' }, ...meterNodes) : null
    ),
    h('div', { className: 'dsh-ex-idi' },
      h('div', { className: 'dsh-ex-search-row' },
        h('textarea', {
          value: query,
          placeholder: 'Search Keywords',
          maxLength: 8000,
          rows: 3,
          'aria-label': 'Prompt',
          onChange: (event) => setQuery(event.target.value),
          onKeyDown: (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } },
          onDragOver: (event) => event.preventDefault(),
          onDrop: (event) => {
            event.preventDefault();
            if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
              native.attachFiles(event.dataTransfer.files, sessionId);
            }
          }
        }),
        h('input', { type: 'button', value: 'Search', onClick: send }),
        h('input', { type: 'button', value: 'Clear', onClick: () => setQuery('') })
      ),
      h(OptionLinks, {
        items: [
          { id: 'model', label: optionLinkLabel(openOpt, 'model', 'Model', modelLabel), onClick: () => toggle('model') },
          { id: 'access', label: optionLinkLabel(openOpt, 'access', 'Access', permLabel), onClick: () => toggle('access') },
          { id: 'files', label: optionLinkLabel(openOpt, 'files', 'Files', (draftFiles || []).length ? `${draftFiles.length} queued` : ''), onClick: () => toggle('files') },
          { id: 'agent', label: optionLinkLabel(openOpt, 'agent', 'Agent', presetLabel), onClick: () => toggle('agent') },
          { id: 'effort', label: optionLinkLabel(openOpt, 'effort', 'Effort', effort), onClick: () => toggle('effort') },
          { id: 'commands', label: optionLinkLabel(openOpt, 'commands', 'Commands', ''), onClick: () => toggle('commands') }
        ]
      })
    ),
    h(OpenOptionPanel, {
      openOpt, setOpenOpt, native, sessionId, modelDir, onSelectModel, onSelectEffort,
      permState, onSelectPerm, presetLabel,
      note: fileNote, onNote: onFileNote, draftFiles, onDraftFiles
    })
  );
}

function StatusFooter() {
  return h('footer', { className: 'dsh-ex-dp' },
    h('div', { className: 'dsh-ex-status' },
      h('a', {
        href: 'https://github.com/lisongxuan/ds-hentai',
        target: '_blank',
        rel: 'noopener noreferrer'
      }, 'ds-hentai')
    )
  );
}

function ChromeShell(props) {
  const host = hostProps(props);
  const native = host.native || {
    readConnection: () => ({ state: 'unknown', label: 'idle' }),
    selectSession: () => false,
    startSession: () => false,
    openSettings: () => false,
    closeSettings: () => false,
    listLocales: () => [],
    readLocale: () => '',
    setLocale: () => false,
    openConfigFile: () => false,
    openWorkspace: () => false,
    sendPrompt: () => false,
    attachFiles: () => false,
    openModelPicker: () => false,
    openSearch: () => false,
    openCommands: () => false,
    listSessions: readDomSessions,
    renameSession: async () => false,
    forkSession: async () => null,
    archiveSession: async () => false,
    listWorkspaces: () => ({ items: [], archivedSessionIds: [] }),
    listModels: async () => ({ current: null, groups: [], status: 'idle', error: null }),
    selectModel: async () => false,
    readPermissions: () => null,
    setPermission: async () => false,
    listDraftFiles: () => [],
    runCommand: () => false,
    openSessionLog: () => false,
    readPreset: () => '',
    listPresets: () => DEFAULT_PRESETS.slice(),
    selectPreset: () => false,
    readSessionStats: () => ({ stats: null, tokens: null })
  };

  const sessionSnap = typeof props.useSessions === 'function'
    ? props.useSessions((state) => state)
    : null;
  const workspaceSnap = typeof props.useWorkspaces === 'function'
    ? props.useWorkspaces((state) => state)
    : (typeof native.listWorkspaces === 'function' ? native.listWorkspaces() : null);

  const active = useStore(host.getActive, host.subscribeActive, true);
  const mode = useStore(host.getMode, host.subscribeMode, 'compact');
  const favs = useStore(host.getFavs, host.subscribeFavs, []);
  const chipsEnabled = useStore(host.getChips, host.subscribeChips, true);
  const cats = useStore(host.getCats, host.subscribeCats, CATEGORIES.map((item) => item.id));
  const nativeSidebar = useStore(host.getNativeSidebar, host.subscribeNativeSidebar, false);
  const composerMode = useStore(host.getComposerMode, host.subscribeComposerMode, 'skin');
  const appearance = useStore(host.getAppearance, host.subscribeAppearance, 'system');
  const localeRev = useStore(host.getLocaleRev, host.subscribeLocale, 0);
  const t = typeof host.t === 'function' ? host.t : fallbackT;
  const setMode = host.setMode || (() => {});
  const setFavs = host.setFavs || (() => {});
  const setChips = host.setChips || (() => {});
  const setModel = host.setModel || (() => {});
  const setCats = host.setCats || (() => {});
  const setNativeSidebar = host.setNativeSidebar || (() => {});
  const setComposerMode = host.setComposerMode || (() => {});
  const setEnabled = host.setEnabled || (() => {});
  const setAppearance = host.setAppearance || (() => {});

  const [view, setView] = React.useState('session');
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [prompt, setPrompt] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [openOpt, setOpenOpt] = React.useState(null);
  const [presetLabel, setPresetLabel] = React.useState('');
  const [fileNote, setFileNote] = React.useState('');
  const [draftFiles, setDraftFiles] = React.useState([]);
  const [sessions, setSessions] = React.useState([]);
  const [meter, setMeter] = React.useState([]);
  const [modelDir, setModelDir] = React.useState({ current: null, groups: [], status: 'idle', error: null });
  const [permState, setPermState] = React.useState(null);
  const [renameState, setRenameState] = React.useState(null);
  const [portalEl] = React.useState(() => {
    const el = document.createElement('div');
    el.setAttribute('data-dsh-ex-portal', 'true');
    return el;
  });

  React.useLayoutEffect(() => {
    document.body.appendChild(portalEl);
    return () => { if (portalEl.parentNode) portalEl.parentNode.removeChild(portalEl); };
  }, [portalEl]);

  const currentId = (sessions.find((item) => item.selected) || {}).id || null;

  React.useLayoutEffect(() => {
    const surface = view === 'session' ? 'session' : view === 'settings' ? 'settings' : 'index';
    if (document.body) {
      document.body.setAttribute('data-dsh-exhentai-view', surface);
      markChromeFlags(nativeSidebar, composerMode);
    }
  }, [view, nativeSidebar, composerMode]);

  React.useEffect(() => {
    if (view === 'settings') return undefined;
    if (typeof native.closeSettings === 'function') native.closeSettings();
    return undefined;
  }, [view]);

  React.useEffect(() => {
    let scheduled = null;
    const tick = () => {
      const hooked = pickSessions(sessionSnap);
      const raw = hooked.length
        ? mergeDomPosted(hooked)
        : (typeof native.listSessions === 'function' ? native.listSessions() : readDomSessions());
      const snap = workspaceSnap || (typeof native.listWorkspaces === 'function' ? native.listWorkspaces() : null);
      setSessions(decorateSessions(Array.isArray(raw) ? raw : [], snap));
      const current = (Array.isArray(raw) ? raw : []).find((item) => item.selected);
      if (typeof native.readPermissions === 'function') {
        if (current) setPermState(native.readPermissions(current.id) || null);
        if (current && typeof native.listDraftFiles === 'function') {
          setDraftFiles(native.listDraftFiles(current.id) || []);
        }
      }
      const pv = current && current.projectionValues || {};
      const live = current && typeof native.readSessionStats === 'function'
        ? native.readSessionStats(current.id)
        : null;
      setMeter(formatSessionMeter(
        (live && live.stats) || pv.sessionStats,
        (live && live.tokens) || pv.tokenUsage
      ));
      if (typeof native.readPreset === 'function') setPresetLabel(native.readPreset() || '');
    };
    const schedule = () => {
      if (scheduled !== null) return;
      scheduled = window.setTimeout(() => { scheduled = null; tick(); }, 200);
    };
    tick();
    const obs = new MutationObserver(schedule);
    obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-selected', 'disabled'] });
    const timer = window.setInterval(tick, 2500);
    return () => {
      obs.disconnect();
      window.clearInterval(timer);
      if (scheduled !== null) window.clearTimeout(scheduled);
    };
  }, [native, sessionSnap, workspaceSnap]);

  React.useEffect(() => {
    if (!currentId || typeof native.listModels !== 'function') return undefined;
    let cancelled = false;
    setModelDir((prev) => Object.assign({}, prev, { status: 'loading', error: null }));
    native.listModels(currentId).then((directory) => {
      if (!cancelled) setModelDir(directory || { current: null, groups: [], status: 'ready', error: null });
    }).catch((err) => {
      if (!cancelled) setModelDir({ current: null, groups: [], status: 'error', error: String(err && err.message || err) });
    });
    return () => { cancelled = true; };
  }, [currentId, native]);

  React.useEffect(() => {
    if (!currentId || !modelDir || !modelDir.current) return;
    const label = currentModelLabel(modelDir, flattenModelChoices(modelDir));
    if (label) setModel(label);
  }, [currentId, modelDir, setModel]);

  const labeledSessions = React.useMemo(() => {
    const label = currentModelLabel(modelDir, flattenModelChoices(modelDir));
    if (!currentId || !label) return sessions;
    return sessions.map((session) => (
      session.id === currentId && session.model !== label
        ? Object.assign({}, session, { model: label })
        : session
    ));
  }, [sessions, currentId, modelDir]);

  const chipItems = React.useMemo(() => galleryButtons(labeledSessions), [labeledSessions]);
  const chipIds = chipItems.map((item) => item.id);
  const storedCats = Array.isArray(cats) ? cats : [];
  const catList = storedCats.filter((id) => chipIds.includes(id));
  const enabledCats = catList.length ? catList : chipIds;
  const favList = Array.isArray(favs) ? favs : [];

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = labeledSessions.filter((session) => {
      const ids = sessionTagItems(session).map((item) => item.id);
      if (enabledCats.length && !ids.some((id) => enabledCats.includes(id))) return false;
      if (q && !(String(session.title) + ' ' + String(session.subtitle || '') + ' ' + sessionTags(session).join(' ')).toLowerCase().includes(q)) return false;
      if (filter === 'favorites' && !favList.includes(session.id)) return false;
      return true;
    });
    if (filter === 'popular') {
      rows = rows.slice().sort((a, b) => (b.pages || 0) - (a.pages || 0) || postedMs(b) - postedMs(a));
    }
    return rows;
  }, [labeledSessions, enabledCats, query, filter, favList]);

  const modelChoices = flattenModelChoices(modelDir);
  const modelLabel = currentModelLabel(modelDir, modelChoices)
    || (labeledSessions.find((item) => item.id === currentId) || {}).model
    || '';

  const openSession = (session) => {
    native.selectSession(session, props);
    setView('session');
    setFilter('all');
  };
  const onNav = (id) => {
    if (id === 'index') { setView('index'); setFilter('all'); setPage(0); return; }
    if (id === 'popular') { setView('index'); setFilter('popular'); setPage(0); return; }
    if (id === 'favorites') { setView('index'); setFilter('favorites'); setPage(0); return; }
    if (id === 'files') {
      setView('session');
      if (typeof native.openWorkspace === 'function') native.openWorkspace();
      return;
    }
    if (id === 'settings') { setView('settings'); return; }
    if (id === 'new') {
      native.startSession();
      setView('session');
    }
  };
  const toggleCat = (id) => {
    const next = enabledCats.includes(id) ? enabledCats.filter((item) => item !== id) : enabledCats.concat(id);
    setCats(next.length ? next : [id]);
  };
  const toggleFav = (id) => {
    setFavs(favList.includes(id) ? favList.filter((item) => item !== id) : favList.concat(id));
  };
  const onRename = (session) => {
    setRenameState({ id: session.id, draft: session.title || '', error: null });
  };
  const onFork = (session) => {
    Promise.resolve(native.forkSession(session.id)).then(() => {
      setView('session');
      setFilter('all');
    }).catch(() => {});
  };
  const onArchive = (session) => {
    Promise.resolve(native.archiveSession(session.id)).then(() => {
      setFavs(favList.filter((id) => id !== session.id));
      if (session.id === currentId) setView('session');
    }).catch(() => {});
  };
  const onSelectModel = (selection) => {
    if (!currentId) return;
    Promise.resolve(native.selectModel(currentId, selection)).then((ok) => {
      if (ok !== false) native.listModels(currentId).then(setModelDir).catch(() => {});
    }).catch(() => {});
  };
  const onSelectEffort = (effort) => {
    if (!currentId || !modelDir || !modelDir.current) return;
    const current = modelDir.current;
    const apply = (selection) => Promise.resolve(native.selectModel(currentId, selection));
    const refresh = () => native.listModels(currentId).then(setModelDir).catch(() => {});
    apply({
      provider: current.provider,
      model: current.model,
      reasoningEffort: effort
    }).then((ok) => {
      if (ok !== false) return refresh();
      const hit = eachNamedModel(modelDir, (_group, model) => {
        const reasoning = model.reasoning;
        const efforts = reasoning && (reasoning.efforts || reasoning.options || reasoning.levels);
        const base = modelBaseId(current.model);
        return !!(efforts && efforts.length && (model.id === base || modelBaseId(model.id) === base));
      });
      if (!hit) return refresh();
      return apply({
        provider: hit.group.id,
        model: hit.model.id,
        reasoningEffort: effort
      }).then(refresh);
    }).catch(() => refresh());
  };
  const onSelectPerm = (preset) => {
    if (!currentId) return;
    if (preset === FULL_ACCESS && !window.confirm('Enable Full access for this session?')) return;
    setPermState((prev) => {
      const snap = typeof native.readPermissions === 'function' ? native.readPermissions(currentId) : null;
      const options = (prev && prev.options) || (snap && snap.options) || [];
      return Object.assign({}, snap || {}, prev || {}, { currentValue: preset, options });
    });
    Promise.resolve(native.setPermission(currentId, preset)).then(() => {
      window.setTimeout(() => {
        setPermState(native.readPermissions(currentId) || permState);
      }, 80);
    }).catch(() => {
      setPermState(native.readPermissions(currentId) || permState);
    });
  };
  const confirmRename = () => {
    if (!renameState) return;
    const title = String(renameState.draft || '').trim();
    if (!title) return;
    Promise.resolve(native.renameSession(renameState.id, title)).then(() => {
      setRenameState(null);
    }).catch((err) => {
      setRenameState(Object.assign({}, renameState, { error: String(err && err.message || err) }));
    });
  };

  if (!active) return null;

  const navView = view === 'index' ? (filter === 'all' ? 'index' : filter) : view;
  const currentSession = labeledSessions.find((item) => item.id === currentId) || labeledSessions.find((item) => item.selected) || null;
  const tree = h('div', { className: 'dsh-ex-chrome', 'data-dsh-ex-chrome': 'true' },
    h(NavBar, { view: navView, onNav }),
    view === 'index' ? h(IndexPane, {
      sessions: filtered,
      currentId,
      mode,
      setMode,
      query,
      setQuery,
      chips: chipItems,
      cats: enabledCats,
      toggleCat,
      page,
      setPage,
      pageSize: 25,
      onOpen: openSession,
      onFav: toggleFav,
      favs: favList,
      onClear: () => { setQuery(''); setPage(0); },
      onRename,
      onFork,
      onArchive
    }) : null,
    view === 'settings' ? h(SettingsPane, {
      t,
      enabled: active,
      setEnabled,
      chips: chipsEnabled,
      setChips,
      mode,
      setMode,
      nativeSidebar,
      setNativeSidebar,
      composerMode,
      setComposerMode,
      appearance,
      setAppearance,
      native,
      onHostSettings: () => { if (typeof native.openSettings === 'function') native.openSettings(); },
      presetLabel,
      permState,
      onSelectPerm,
      sessionId: currentId,
      modelDir,
      onSelectModel,
      localeRev
    }) : null,
    view === 'session' && composerMode === 'skin' ? h(ComposerDock, {
      title: currentSession && currentSession.title,
      modelLabel,
      meter,
      query: prompt,
      setQuery: setPrompt,
      openOpt,
      setOpenOpt,
      native,
      sessionId: currentId,
      modelDir,
      onSelectModel,
      onSelectEffort,
      permState,
      onSelectPerm,
      fileNote,
      onFileNote: setFileNote,
      draftFiles,
      onDraftFiles: setDraftFiles,
      presetLabel
    }) : null,
    renameState ? h(RenameDialog, {
      draft: renameState.draft,
      setDraft: (draft) => setRenameState(Object.assign({}, renameState, { draft, error: null })),
      error: renameState.error,
      onCancel: () => setRenameState(null),
      onConfirm: confirmRename
    }) : null,
    h(StatusFooter)
  );
  return createPortalNode(tree, portalEl);
}


class ChromeOverlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err: err };
  }
  render() {
    if (this.state.err) {
      return h('div', { className: 'dsh-ex-chrome', 'data-dsh-ex-chrome': 'true' },
        h('footer', { className: 'dsh-ex-dp' }, 'ds-hentai overlay: ', String(this.state.err.message || this.state.err))
      );
    }
    return h(ChromeShell, this.props);
  }
}

function apply(ctx) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const subscribers = new Set();
  const chipsSubscribers = new Set();
  const modeSubscribers = new Set();
  const favsSubscribers = new Set();
  const modelSubscribers = new Set();
  const regionSubscribers = new Set();
  const catsSubscribers = new Set();
  const sidebarSubscribers = new Set();
  const composerSubscribers = new Set();
  const appearanceSubscribers = new Set();
  const localeSubscribers = new Set();
  const restoreOnBoot = readEnabled();
  let active = false;
  let chipsEnabled = readChipsEnabled();
  let mode = readMode();
  let favs = readFavs();
  let model = readModel();
  let region = readRegion();
  let cats = readCats();
  let nativeSidebar = readNativeSidebar();
  let composerMode = readComposerMode();
  let previousTheme = readPreviousTheme();
  let wantEnabled = restoreOnBoot;
  let bootRestorePending = restoreOnBoot;
  let retryTimer = null;
  let settleTimer = null;
  let reassertTimer = null;
  let disposed = false;
  let localeRev = 0;
  const native = createNativeBridge(ctx);
  try { registerSettingsLocales(ctx); } catch {}
  const hostT = bindSettingsT(ctx);

  const clearBootTimers = () => {
    if (retryTimer !== null) window.clearTimeout(retryTimer);
    if (settleTimer !== null) window.clearTimeout(settleTimer);
    if (reassertTimer !== null) window.clearTimeout(reassertTimer);
    retryTimer = null;
    settleTimer = null;
    reassertTimer = null;
  };
  const notify = (set, value) => { for (const subscriber of set) subscriber(value); };
  const markActive = (next, persist = true) => {
    active = next === true;
    if (active) {
      document.body.setAttribute('data-dsh-exhentai-active', 'true');
      markChromeFlags(nativeSidebar, composerMode);
    } else {
      document.body.removeAttribute('data-dsh-exhentai-active');
      document.body.removeAttribute('data-dsh-exhentai-view');
      document.body.removeAttribute('data-dsh-exhentai-sidebar');
      document.body.removeAttribute('data-dsh-exhentai-composer');
    }
    if (persist) writeEnabled(active);
    notify(subscribers, active);
  };
  const setChipsEnabled = (next) => {
    chipsEnabled = next === true;
    writeChipsEnabled(chipsEnabled);
    if (document.body) document.body.setAttribute('data-dsh-exhentai-chips', chipsEnabled ? 'on' : 'off');
    notify(chipsSubscribers, chipsEnabled);
  };
  const setModeValue = (next) => {
    mode = MODES.includes(next) ? next : 'compact';
    writeMode(mode);
    notify(modeSubscribers, mode);
  };
  const setFavsValue = (next) => {
    favs = Array.isArray(next) ? next.map(String) : [];
    writeFavs(favs);
    notify(favsSubscribers, favs);
  };
  const setModelValue = (next) => {
    model = String(next || '');
    writeModel(model);
    notify(modelSubscribers, model);
  };
  const setRegionValue = (next) => {
    region = REGIONS.some((item) => item.id === next) ? next : 'auto';
    writeRegion(region);
    notify(regionSubscribers, region);
  };
  const setCatsValue = (next) => {
    cats = Array.isArray(next) && next.length ? next.map(String) : CATEGORIES.map((item) => item.id);
    writeCats(cats);
    notify(catsSubscribers, cats);
  };
  const setNativeSidebarValue = (next) => {
    nativeSidebar = next === true;
    writeNativeSidebar(nativeSidebar);
    markChromeFlags(nativeSidebar, composerMode);
    notify(sidebarSubscribers, nativeSidebar);
  };
  const setComposerModeValue = (next) => {
    composerMode = COMPOSER_MODES.includes(next) ? next : 'skin';
    writeComposerMode(composerMode);
    markChromeFlags(nativeSidebar, composerMode);
    notify(composerSubscribers, composerMode);
  };
  const setAppearanceValue = (next) => {
    if (!BUILTIN_THEMES.has(next)) return;
    previousTheme = next;
    writePreviousTheme(previousTheme);
    try { ctx.theme.setTheme(next); } catch {}
    notify(appearanceSubscribers, previousTheme);
  };
  const setEnabled = (next) => {
    wantEnabled = next === true;
    writeEnabled(wantEnabled);
    if (next) {
      const snapshot = ctx.theme.getTheme();
      if (BUILTIN_THEMES.has(snapshot.preference)) {
        previousTheme = snapshot.preference;
        writePreviousTheme(previousTheme);
      }
      if (snapshot.active.id !== THEME_ID) ctx.theme.setTheme(THEME_ID);
      else markActive(true, false);
    } else {
      bootRestorePending = false;
      clearBootTimers();
      const snapshot = ctx.theme.getTheme();
      if (snapshot.active.id === THEME_ID) ctx.theme.setTheme(previousTheme);
      else markActive(false, false);
    }
  };

  ctx.effect(() => ctx.theme.register(THEME), 'ds-hentai: theme registration');
  try {
    ctx.effect(() => {
      const dispose = registerSettingsLocales(ctx);
      return typeof dispose === 'function' ? dispose : undefined;
    }, 'ds-hentai: settings dictionaries');
  } catch {
    try { registerSettingsLocales(ctx); } catch {}
  }
  try {
    ctx.on('locale/change', () => {
      localeRev += 1;
      notify(localeSubscribers, localeRev);
    });
  } catch {}
  ctx.effect(() => () => {
    disposed = true;
    clearBootTimers();
  }, 'ds-hentai: startup synchronization cleanup');

  ctx.on('theme/change', (snapshot) => {
    const isRetro = snapshot.active.id === THEME_ID;
    if (isRetro) {
      markActive(true, false);
      if (bootRestorePending) {
        if (settleTimer !== null) window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => {
          settleTimer = null;
          bootRestorePending = false;
        }, 2500);
      }
      return;
    }

    if (bootRestorePending) {
      markActive(false, false);
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      settleTimer = null;
      if (retryTimer !== null) window.clearTimeout(retryTimer);
      retryTimer = window.setTimeout(() => {
        retryTimer = null;
        if (!disposed && bootRestorePending) setEnabled(true);
      }, 0);
      return;
    }

    if (wantEnabled) {
      if (reassertTimer !== null) window.clearTimeout(reassertTimer);
      reassertTimer = window.setTimeout(() => {
        reassertTimer = null;
        if (!disposed && wantEnabled) {
          const live = ctx.theme.getTheme();
          if (live.active.id !== THEME_ID) ctx.theme.setTheme(THEME_ID);
        }
      }, 0);
      return;
    }

    if (BUILTIN_THEMES.has(snapshot.preference)) {
      previousTheme = snapshot.preference;
      writePreviousTheme(previousTheme);
      notify(appearanceSubscribers, previousTheme);
    }
    markActive(false, false);
  });

  ctx.effect(() => {
    const previousStyle = document.querySelector('style[data-plugin="ds-hentai"]');
    if (previousStyle) previousStyle.remove();

    const style = document.createElement('style');
    style.dataset.plugin = 'ds-hentai';
    style.textContent = CSS;
    document.head.appendChild(style);

    document.documentElement.setAttribute('data-dsh-exhentai-installed', 'true');
    document.body.setAttribute('data-dsh-exhentai-chips', chipsEnabled ? 'on' : 'off');
    markChromeFlags(nativeSidebar, composerMode);

    return () => {
      style.remove();
      document.body.removeAttribute('data-dsh-exhentai-active');
      document.body.removeAttribute('data-dsh-exhentai-chips');
      document.body.removeAttribute('data-dsh-exhentai-view');
      document.body.removeAttribute('data-dsh-exhentai-sidebar');
      document.body.removeAttribute('data-dsh-exhentai-composer');
      document.documentElement.removeAttribute('data-dsh-exhentai-installed');
      subscribers.clear();
      chipsSubscribers.clear();
      modeSubscribers.clear();
      favsSubscribers.clear();
      modelSubscribers.clear();
      regionSubscribers.clear();
      catsSubscribers.clear();
      sidebarSubscribers.clear();
      composerSubscribers.clear();
      appearanceSubscribers.clear();
      localeSubscribers.clear();
    };
  }, 'ds-hentai: scoped stylesheet');

  const bind = (set, get) => (subscriber) => {
    set.add(subscriber);
    subscriber(get());
    return () => set.delete(subscriber);
  };

  chromeHost = {
    getActive: () => active,
    subscribeActive: bind(subscribers, () => active),
    getMode: () => mode,
    setMode: setModeValue,
    subscribeMode: bind(modeSubscribers, () => mode),
    getFavs: () => favs,
    setFavs: setFavsValue,
    subscribeFavs: bind(favsSubscribers, () => favs),
    getChips: () => chipsEnabled,
    setChips: setChipsEnabled,
    subscribeChips: bind(chipsSubscribers, () => chipsEnabled),
    getModel: () => model,
    setModel: setModelValue,
    subscribeModel: bind(modelSubscribers, () => model),
    getRegion: () => region,
    setRegion: setRegionValue,
    subscribeRegion: bind(regionSubscribers, () => region),
    getCats: () => cats,
    setCats: setCatsValue,
    subscribeCats: bind(catsSubscribers, () => cats),
    getNativeSidebar: () => nativeSidebar,
    setNativeSidebar: setNativeSidebarValue,
    subscribeNativeSidebar: bind(sidebarSubscribers, () => nativeSidebar),
    getComposerMode: () => composerMode,
    setComposerMode: setComposerModeValue,
    subscribeComposerMode: bind(composerSubscribers, () => composerMode),
    getAppearance: () => previousTheme,
    setAppearance: setAppearanceValue,
    subscribeAppearance: bind(appearanceSubscribers, () => previousTheme),
    t: hostT,
    getLocaleRev: () => localeRev,
    subscribeLocale: bind(localeSubscribers, () => localeRev),
    setEnabled,
    native
  };

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'ds-hentai',
    order: 35,
    inject: () => ({
      getEnabled: () => active,
      setEnabled,
      subscribe: bind(subscribers, () => active),
      getChips: () => chipsEnabled,
      setChips: setChipsEnabled,
      subscribeChips: bind(chipsSubscribers, () => chipsEnabled),
      getMode: () => mode,
      setMode: setModeValue,
      subscribeMode: bind(modeSubscribers, () => mode),
      getNativeSidebar: () => nativeSidebar,
      setNativeSidebar: setNativeSidebarValue,
      subscribeNativeSidebar: bind(sidebarSubscribers, () => nativeSidebar),
      getComposerMode: () => composerMode,
      setComposerMode: setComposerModeValue,
      subscribeComposerMode: bind(composerSubscribers, () => composerMode),
      t: hostT,
      getLocaleRev: () => localeRev,
      subscribeLocale: bind(localeSubscribers, () => localeRev)
    })
  }, SettingsRow));

  try {
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({
      name: 'shell.overlay',
      id: 'ds-hentai-chrome',
      key: 'ds-hentai-chrome',
      order: 20,
      inject: () => ({
        getActive: () => active,
        subscribeActive: bind(subscribers, () => active),
        getMode: () => mode,
        setMode: setModeValue,
        subscribeMode: bind(modeSubscribers, () => mode),
        getFavs: () => favs,
        setFavs: setFavsValue,
        subscribeFavs: bind(favsSubscribers, () => favs),
        getChips: () => chipsEnabled,
        setChips: setChipsEnabled,
        subscribeChips: bind(chipsSubscribers, () => chipsEnabled),
        getModel: () => model,
        setModel: setModelValue,
        subscribeModel: bind(modelSubscribers, () => model),
        getRegion: () => region,
        setRegion: setRegionValue,
        subscribeRegion: bind(regionSubscribers, () => region),
        getCats: () => cats,
        setCats: setCatsValue,
        subscribeCats: bind(catsSubscribers, () => cats),
        getNativeSidebar: () => nativeSidebar,
        setNativeSidebar: setNativeSidebarValue,
        subscribeNativeSidebar: bind(sidebarSubscribers, () => nativeSidebar),
        getComposerMode: () => composerMode,
        setComposerMode: setComposerModeValue,
        subscribeComposerMode: bind(composerSubscribers, () => composerMode),
        getAppearance: () => previousTheme,
        setAppearance: setAppearanceValue,
        subscribeAppearance: bind(appearanceSubscribers, () => previousTheme),
        t: hostT,
        getLocaleRev: () => localeRev,
        subscribeLocale: bind(localeSubscribers, () => localeRev),
        setEnabled,
        native
      })
    }, ChromeOverlay));
  } catch {
    // ui-layout may not declare shell.overlay on older baselines; CSS + settings remain.
  }

  if (restoreOnBoot) setEnabled(true);
  else markActive(false);
}

exports.THEME = THEME;
exports.THEME_ID = THEME_ID;
exports.apply = apply;
exports.inject = ['theme', 'slots', 'locale'];
