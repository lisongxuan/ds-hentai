const React = require('react');

const THEME_ID = 'dsh-exhentai';
const STORAGE_KEY = 'ds-hentai:enabled';
const PREVIOUS_THEME_KEY = 'ds-hentai:previous-theme';
const CHIPS_KEY = 'ds-hentai:chips';
const BUILTIN_THEMES = new Set(['light', 'dark', 'system']);
const CSS = __EXHENTAI_CSS__;

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
    '--dsw-alias-label-primary-inverted': '#f1f1f1',
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

function readEnabled() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

function writeEnabled(enabled) {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {}
}

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
  try {
    window.localStorage.setItem(PREVIOUS_THEME_KEY, themeId);
  } catch {}
}

function readChipsEnabled() {
  try {
    return window.localStorage.getItem(CHIPS_KEY) !== 'off';
  } catch {
    return true;
  }
}

function writeChipsEnabled(enabled) {
  try {
    window.localStorage.setItem(CHIPS_KEY, enabled ? 'on' : 'off');
  } catch {}
}

function SettingsRow({ getEnabled, setEnabled, subscribe, getChips, setChips, subscribeChips }) {
  const [enabled, setLocalEnabled] = React.useState(getEnabled());
  const [chips, setLocalChips] = React.useState(getChips());
  React.useEffect(() => subscribe(setLocalEnabled), [subscribe]);
  React.useEffect(() => subscribeChips(setLocalChips), [subscribeChips]);

  const chooseEnabled = (value) => {
    setEnabled(value);
    setLocalEnabled(value);
  };
  const chooseChips = (value) => {
    setChips(value);
    setLocalChips(value);
  };
  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    padding: '14px 0',
    borderBottom: '1px solid var(--dsw-alias-border-l1)'
  };
  const baseButton = {
    minWidth: '92px',
    height: '30px',
    border: '1px solid var(--dsw-alias-border-l3)',
    borderRadius: '4px',
    padding: '0 12px',
    cursor: 'pointer',
    font: 'inherit'
  };
  const buttonStyle = (selected) => Object.assign({}, baseButton, selected
    ? { color: '#f1f1f1', background: 'linear-gradient(180deg, #5a5f66, #43464e)' }
    : { color: 'var(--dsw-alias-label-primary)', background: 'var(--dsw-alias-button-elevated-fill)' });
  const copyStyle = { marginTop: '4px', color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px', lineHeight: 1.5 };

  return React.createElement('div', null,
    React.createElement('div', { style: rowStyle },
      React.createElement('div', { style: { minWidth: 0 } },
        React.createElement('div', { style: { color: 'var(--dsw-alias-label-primary)', fontWeight: 600 } }, 'ExHentai 深色画廊皮肤'),
        React.createElement('div', { style: copyStyle }, '灰阶配色、灰色实线边框、表格化排版与红/绿状态色；关闭后恢复切换前的系统外观。')
      ),
      React.createElement('div', { style: { display: 'flex', gap: '8px', flexShrink: 0 } },
        React.createElement('button', {
          type: 'button',
          style: buttonStyle(enabled),
          'aria-pressed': enabled,
          onClick: () => chooseEnabled(true)
        }, '启用皮肤'),
        React.createElement('button', {
          type: 'button',
          style: buttonStyle(!enabled),
          'aria-pressed': !enabled,
          onClick: () => chooseEnabled(false)
        }, '系统外观')
      )
    ),
    React.createElement('div', { style: rowStyle },
      React.createElement('div', { style: { minWidth: 0 } },
        React.createElement('div', { style: { color: 'var(--dsw-alias-label-primary)', fontWeight: 600 } }, '分类彩色标签'),
        React.createElement('div', { style: copyStyle }, 'ExHentai 式类别 chip 彩条（红/橙/金/绿/蓝/紫）；关闭后统一改用中性灰。')
      ),
      React.createElement('button', {
        type: 'button',
        style: Object.assign({}, buttonStyle(chips), { minWidth: '112px' }),
        'aria-pressed': chips,
        onClick: () => chooseChips(!chips)
      }, chips ? '彩色标签：开启' : '彩色标签：关闭')
    )
  );
}

function apply(ctx) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const subscribers = new Set();
  const chipsSubscribers = new Set();
  const restoreOnBoot = readEnabled();
  let active = false;
  let chipsEnabled = readChipsEnabled();
  let previousTheme = readPreviousTheme();
  let bootRestorePending = restoreOnBoot;
  let retryTimer = null;
  let settleTimer = null;
  let disposed = false;

  const clearBootTimers = () => {
    if (retryTimer !== null) window.clearTimeout(retryTimer);
    if (settleTimer !== null) window.clearTimeout(settleTimer);
    retryTimer = null;
    settleTimer = null;
  };
  const notify = () => {
    for (const subscriber of subscribers) subscriber(active);
  };
  const notifyChips = () => {
    for (const subscriber of chipsSubscribers) subscriber(chipsEnabled);
  };

  const markActive = (next, persist = true) => {
    active = next === true;
    if (active) document.body.setAttribute('data-dsh-exhentai-active', 'true');
    else document.body.removeAttribute('data-dsh-exhentai-active');
    if (persist) writeEnabled(active);
    notify();
  };
  const setChipsEnabled = (next) => {
    chipsEnabled = next === true;
    writeChipsEnabled(chipsEnabled);
    if (document.body) document.body.setAttribute('data-dsh-exhentai-chips', chipsEnabled ? 'on' : 'off');
    notifyChips();
  };
  const setEnabled = (next) => {
    if (next) {
      const snapshot = ctx.theme.getTheme();
      if (BUILTIN_THEMES.has(snapshot.preference)) {
        previousTheme = snapshot.preference;
        writePreviousTheme(previousTheme);
      }
      if (snapshot.active.id !== THEME_ID) ctx.theme.setTheme(THEME_ID);
      else markActive(true);
    } else {
      bootRestorePending = false;
      clearBootTimers();
      const snapshot = ctx.theme.getTheme();
      if (snapshot.active.id === THEME_ID) ctx.theme.setTheme(previousTheme);
      else markActive(false);
    }
  };

  ctx.effect(() => ctx.theme.register(THEME), 'ds-hentai: theme registration');
  ctx.effect(() => () => {
    disposed = true;
    clearBootTimers();
  }, 'ds-hentai: startup synchronization cleanup');

  ctx.on('theme/change', (snapshot) => {
    const isRetro = snapshot.active.id === THEME_ID;
    if (isRetro) {
      markActive(true);
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
      // ThemeRuntime's Host settings scope can adopt the built-in preference
      // shortly after immediate client plugins run. Preserve first-run intent,
      // wait one task, and re-apply until the startup state remains stable.
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

    if (BUILTIN_THEMES.has(snapshot.preference)) {
      previousTheme = snapshot.preference;
      writePreviousTheme(previousTheme);
    }
    markActive(false);
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

    return () => {
      style.remove();
      document.body.removeAttribute('data-dsh-exhentai-active');
      document.body.removeAttribute('data-dsh-exhentai-chips');
      document.documentElement.removeAttribute('data-dsh-exhentai-installed');
      subscribers.clear();
      chipsSubscribers.clear();
    };
  }, 'ds-hentai: scoped stylesheet');

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'ds-hentai',
    order: 35,
    inject: () => ({
      getEnabled: () => active,
      setEnabled,
      subscribe: (subscriber) => {
        subscribers.add(subscriber);
        subscriber(active);
        return () => subscribers.delete(subscriber);
      },
      getChips: () => chipsEnabled,
      setChips: setChipsEnabled,
      subscribeChips: (subscriber) => {
        chipsSubscribers.add(subscriber);
        subscriber(chipsEnabled);
        return () => chipsSubscribers.delete(subscriber);
      }
    })
  }, SettingsRow));

  if (restoreOnBoot) setEnabled(true);
  else markActive(false);
}

exports.THEME = THEME;
exports.THEME_ID = THEME_ID;
exports.apply = apply;
exports.inject = ['theme', 'slots'];
