// ===== Puzzle Arcade - Centralized Ad Management Module =====
// Self-contained IIFE exposing window.PuzzleAds
// Production-ready for AdSense approval

(function () {
  'use strict';

  // ─── i18n ───────────────────────────────────────────────
  const I18N = {
    ko: {
      ad_label: '광고',
      cookie_title: '쿠키 및 광고 동의',
      cookie_message: '이 사이트는 쿠키와 개인 맞춤 광고를 사용합니다. 계속하면 이에 동의하는 것으로 간주됩니다.',
      cookie_accept: '동의',
      cookie_decline: '거절',
      rewarded_title: '힌트를 받으시겠습니까?',
      rewarded_message: '짧은 광고를 시청하고 보상을 받으세요!',
      rewarded_watch: '광고 보기',
      rewarded_cancel: '취소',
      rewarded_countdown: '초 후 닫기',
      rewarded_done: '보상이 지급되었습니다!',
    },
    en: {
      ad_label: 'Advertisement',
      cookie_title: 'Cookie & Ad Consent',
      cookie_message: 'This site uses cookies and personalized ads. By continuing, you agree to our use of cookies.',
      cookie_accept: 'Accept',
      cookie_decline: 'Decline',
      rewarded_title: 'Need a hint?',
      rewarded_message: 'Watch a short ad to receive your reward!',
      rewarded_watch: 'Watch Ad',
      rewarded_cancel: 'Cancel',
      rewarded_countdown: 's to close',
      rewarded_done: 'Reward granted!',
    },
    ja: {
      ad_label: '広告',
      cookie_title: 'クッキーと広告の同意',
      cookie_message: 'このサイトはCookieとパーソナライズ広告を使用しています。続行すると、同意したものとみなされます。',
      cookie_accept: '同意する',
      cookie_decline: '拒否',
      rewarded_title: 'ヒントが必要ですか？',
      rewarded_message: '短い広告を見て報酬を受け取りましょう！',
      rewarded_watch: '広告を見る',
      rewarded_cancel: 'キャンセル',
      rewarded_countdown: '秒後に閉じる',
      rewarded_done: '報酬が付与されました！',
    },
    zh: {
      ad_label: '广告',
      cookie_title: 'Cookie和广告同意',
      cookie_message: '本网站使用Cookie和个性化广告。继续即表示您同意我们使用Cookie。',
      cookie_accept: '同意',
      cookie_decline: '拒绝',
      rewarded_title: '需要提示吗？',
      rewarded_message: '观看短视频广告即可获得奖励！',
      rewarded_watch: '观看广告',
      rewarded_cancel: '取消',
      rewarded_countdown: '秒后关闭',
      rewarded_done: '奖励已发放！',
    },
    es: {
      ad_label: 'Publicidad',
      cookie_title: 'Consentimiento de cookies y anuncios',
      cookie_message: 'Este sitio usa cookies y anuncios personalizados. Al continuar, acepta el uso de cookies.',
      cookie_accept: 'Aceptar',
      cookie_decline: 'Rechazar',
      rewarded_title: '¿Necesitas una pista?',
      rewarded_message: '¡Mira un breve anuncio para recibir tu recompensa!',
      rewarded_watch: 'Ver anuncio',
      rewarded_cancel: 'Cancelar',
      rewarded_countdown: 's para cerrar',
      rewarded_done: '¡Recompensa otorgada!',
    },
  };

  // ─── State ──────────────────────────────────────────────
  var _config = {
    adsenseClient: 'ca-pub-9533955857777562',
    bannerSlot: 'auto',
    rectangleSlot: 'auto',
    nativeSlot: 'auto',
    maxVisibleAds: 5,
    interstitialCooldownMs: 3 * 60 * 1000, // 3 minutes
    devMode: false, // false = use real AdSense
  };

  var _state = {
    initialized: false,
    consentGiven: false,
    consentDeclined: false,
    visibleAdCount: 0,
    lastInterstitialTime: 0,
    gameCompletions: 0,
    observers: [],
    activeSlots: new Set(),
    lang: 'en',
    styleInjected: false,
  };

  // ─── Helpers ────────────────────────────────────────────
  function _detectLang() {
    var stored = localStorage.getItem('puzzle-lang');
    if (stored && I18N[stored]) return stored;
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return I18N[nav] ? nav : 'en';
  }

  function _t(key) {
    var bundle = I18N[_state.lang] || I18N.en;
    return bundle[key] || I18N.en[key] || key;
  }

  function _isAdSenseReady() {
    return !!_config.adsenseClient && typeof window.adsbygoogle !== 'undefined';
  }

  function _isMobile() {
    return window.innerWidth < 768;
  }

  function _trackEvent(category, action, label, value) {
    // Google Analytics 4 integration
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value || 0,
      });
    }
    // Console log in dev mode
    if (_config.devMode) {
      console.log('[PuzzleAds]', category, action, label, value);
    }
  }

  // ─── CSS Injection ─────────────────────────────────────
  function _injectStyles() {
    if (_state.styleInjected) return;
    _state.styleInjected = true;

    var css = '\n' +
      '/* PuzzleAds - Injected Styles */\n' +
      '.pa-ad-unit {\n' +
      '  position: relative;\n' +
      '  display: flex;\n' +
      '  flex-direction: column;\n' +
      '  align-items: center;\n' +
      '  justify-content: center;\n' +
      '  background: linear-gradient(135deg, rgba(15,15,35,0.95), rgba(20,20,45,0.95));\n' +
      '  border: 1px solid rgba(255,255,255,0.06);\n' +
      '  border-radius: 12px;\n' +
      '  overflow: hidden;\n' +
      '  margin: 12px auto;\n' +
      '  box-sizing: border-box;\n' +
      '}\n' +
      '.pa-ad-unit--banner {\n' +
      '  width: 100%;\n' +
      '  max-width: 728px;\n' +
      '  height: 90px;\n' +
      '}\n' +
      '@media (max-width: 767px) {\n' +
      '  .pa-ad-unit--banner {\n' +
      '    max-width: 320px;\n' +
      '    height: 50px;\n' +
      '  }\n' +
      '}\n' +
      '.pa-ad-unit--rectangle {\n' +
      '  width: 300px;\n' +
      '  height: 250px;\n' +
      '}\n' +
      '.pa-ad-unit--native {\n' +
      '  width: 100%;\n' +
      '  max-width: 400px;\n' +
      '  min-height: 120px;\n' +
      '  padding: 16px;\n' +
      '}\n' +
      '.pa-ad-label {\n' +
      '  position: absolute;\n' +
      '  top: 4px;\n' +
      '  left: 8px;\n' +
      '  font-size: 9px;\n' +
      '  text-transform: uppercase;\n' +
      '  letter-spacing: 1px;\n' +
      '  color: rgba(255,255,255,0.3);\n' +
      '  font-family: "Outfit", sans-serif;\n' +
      '  pointer-events: none;\n' +
      '  z-index: 2;\n' +
      '}\n' +
      '.pa-ad-placeholder {\n' +
      '  display: flex;\n' +
      '  align-items: center;\n' +
      '  justify-content: center;\n' +
      '  width: 100%;\n' +
      '  height: 100%;\n' +
      '  color: rgba(255,255,255,0.15);\n' +
      '  font-size: 13px;\n' +
      '  font-family: "Outfit", sans-serif;\n' +
      '  user-select: none;\n' +
      '}\n' +
      '.pa-ad-unit--loading .pa-ad-placeholder::after {\n' +
      '  content: "";\n' +
      '  width: 18px;\n' +
      '  height: 18px;\n' +
      '  border: 2px solid rgba(255,255,255,0.1);\n' +
      '  border-top-color: rgba(102,126,234,0.5);\n' +
      '  border-radius: 50%;\n' +
      '  animation: pa-spin 0.8s linear infinite;\n' +
      '  margin-left: 8px;\n' +
      '}\n' +
      '@keyframes pa-spin { to { transform: rotate(360deg); } }\n' +
      '\n' +
      '/* Interstitial */\n' +
      '.pa-interstitial-overlay {\n' +
      '  position: fixed;\n' +
      '  inset: 0;\n' +
      '  background: rgba(0,0,0,0.92);\n' +
      '  z-index: 99999;\n' +
      '  display: flex;\n' +
      '  align-items: center;\n' +
      '  justify-content: center;\n' +
      '  animation: pa-fadeIn 0.3s ease;\n' +
      '}\n' +
      '@keyframes pa-fadeIn { from { opacity: 0; } to { opacity: 1; } }\n' +
      '.pa-interstitial-container {\n' +
      '  position: relative;\n' +
      '  background: linear-gradient(135deg, #0f0f23, #14142d);\n' +
      '  border: 1px solid rgba(255,255,255,0.08);\n' +
      '  border-radius: 16px;\n' +
      '  padding: 24px;\n' +
      '  max-width: 90vw;\n' +
      '  max-height: 90vh;\n' +
      '  display: flex;\n' +
      '  flex-direction: column;\n' +
      '  align-items: center;\n' +
      '  justify-content: center;\n' +
      '  min-width: 300px;\n' +
      '  min-height: 300px;\n' +
      '}\n' +
      '.pa-interstitial-close {\n' +
      '  position: absolute;\n' +
      '  top: 12px;\n' +
      '  right: 12px;\n' +
      '  width: 32px;\n' +
      '  height: 32px;\n' +
      '  border-radius: 50%;\n' +
      '  border: 1px solid rgba(255,255,255,0.15);\n' +
      '  background: rgba(255,255,255,0.05);\n' +
      '  color: rgba(255,255,255,0.6);\n' +
      '  font-size: 16px;\n' +
      '  cursor: pointer;\n' +
      '  display: flex;\n' +
      '  align-items: center;\n' +
      '  justify-content: center;\n' +
      '  transition: all 0.2s;\n' +
      '}\n' +
      '.pa-interstitial-close:hover {\n' +
      '  background: rgba(255,255,255,0.12);\n' +
      '  color: #fff;\n' +
      '}\n' +
      '.pa-interstitial-close:disabled {\n' +
      '  opacity: 0.3;\n' +
      '  cursor: not-allowed;\n' +
      '}\n' +
      '\n' +
      '/* Rewarded Ad */\n' +
      '.pa-rewarded-overlay {\n' +
      '  position: fixed;\n' +
      '  inset: 0;\n' +
      '  background: rgba(0,0,0,0.92);\n' +
      '  z-index: 99999;\n' +
      '  display: flex;\n' +
      '  align-items: center;\n' +
      '  justify-content: center;\n' +
      '  animation: pa-fadeIn 0.3s ease;\n' +
      '}\n' +
      '.pa-rewarded-dialog {\n' +
      '  background: linear-gradient(135deg, #0f0f23, #14142d);\n' +
      '  border: 1px solid rgba(102,126,234,0.3);\n' +
      '  border-radius: 16px;\n' +
      '  padding: 32px;\n' +
      '  max-width: 360px;\n' +
      '  width: 90vw;\n' +
      '  text-align: center;\n' +
      '  font-family: "Outfit", sans-serif;\n' +
      '  color: #fff;\n' +
      '}\n' +
      '.pa-rewarded-dialog h3 {\n' +
      '  font-size: 20px;\n' +
      '  margin-bottom: 10px;\n' +
      '}\n' +
      '.pa-rewarded-dialog p {\n' +
      '  font-size: 14px;\n' +
      '  color: rgba(255,255,255,0.6);\n' +
      '  margin-bottom: 24px;\n' +
      '}\n' +
      '.pa-rewarded-btn {\n' +
      '  display: inline-block;\n' +
      '  padding: 12px 28px;\n' +
      '  border-radius: 10px;\n' +
      '  border: none;\n' +
      '  font-size: 15px;\n' +
      '  font-weight: 600;\n' +
      '  font-family: "Outfit", sans-serif;\n' +
      '  cursor: pointer;\n' +
      '  margin: 0 6px;\n' +
      '  transition: all 0.2s;\n' +
      '}\n' +
      '.pa-rewarded-btn--primary {\n' +
      '  background: linear-gradient(135deg, #667eea, #764ba2);\n' +
      '  color: #fff;\n' +
      '}\n' +
      '.pa-rewarded-btn--primary:hover {\n' +
      '  transform: translateY(-1px);\n' +
      '  box-shadow: 0 4px 20px rgba(102,126,234,0.4);\n' +
      '}\n' +
      '.pa-rewarded-btn--secondary {\n' +
      '  background: rgba(255,255,255,0.06);\n' +
      '  color: rgba(255,255,255,0.6);\n' +
      '  border: 1px solid rgba(255,255,255,0.1);\n' +
      '}\n' +
      '.pa-rewarded-btn--secondary:hover {\n' +
      '  background: rgba(255,255,255,0.1);\n' +
      '}\n' +
      '.pa-rewarded-countdown {\n' +
      '  font-size: 48px;\n' +
      '  font-weight: 800;\n' +
      '  color: rgba(102,126,234,0.8);\n' +
      '  margin: 20px 0;\n' +
      '}\n' +
      '.pa-rewarded-progress {\n' +
      '  width: 100%;\n' +
      '  height: 4px;\n' +
      '  background: rgba(255,255,255,0.06);\n' +
      '  border-radius: 2px;\n' +
      '  margin: 16px 0;\n' +
      '  overflow: hidden;\n' +
      '}\n' +
      '.pa-rewarded-progress-bar {\n' +
      '  height: 100%;\n' +
      '  background: linear-gradient(90deg, #667eea, #764ba2);\n' +
      '  border-radius: 2px;\n' +
      '  transition: width 1s linear;\n' +
      '}\n' +
      '\n' +
      '/* Cookie Consent */\n' +
      '.pa-consent-banner {\n' +
      '  position: fixed;\n' +
      '  bottom: 0;\n' +
      '  left: 0;\n' +
      '  right: 0;\n' +
      '  z-index: 100000;\n' +
      '  background: linear-gradient(180deg, rgba(15,15,35,0.98), rgba(10,10,26,0.99));\n' +
      '  border-top: 1px solid rgba(102,126,234,0.2);\n' +
      '  padding: 20px 24px;\n' +
      '  font-family: "Outfit", sans-serif;\n' +
      '  color: #fff;\n' +
      '  backdrop-filter: blur(20px);\n' +
      '  animation: pa-slideUp 0.4s ease;\n' +
      '}\n' +
      '@keyframes pa-slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }\n' +
      '.pa-consent-inner {\n' +
      '  max-width: 800px;\n' +
      '  margin: 0 auto;\n' +
      '  display: flex;\n' +
      '  align-items: center;\n' +
      '  gap: 20px;\n' +
      '  flex-wrap: wrap;\n' +
      '}\n' +
      '.pa-consent-text {\n' +
      '  flex: 1;\n' +
      '  min-width: 240px;\n' +
      '}\n' +
      '.pa-consent-text h4 {\n' +
      '  font-size: 15px;\n' +
      '  font-weight: 700;\n' +
      '  margin-bottom: 4px;\n' +
      '}\n' +
      '.pa-consent-text p {\n' +
      '  font-size: 13px;\n' +
      '  color: rgba(255,255,255,0.55);\n' +
      '  line-height: 1.5;\n' +
      '}\n' +
      '.pa-consent-buttons {\n' +
      '  display: flex;\n' +
      '  gap: 8px;\n' +
      '}\n' +
      '.pa-consent-btn {\n' +
      '  padding: 10px 24px;\n' +
      '  border-radius: 8px;\n' +
      '  border: none;\n' +
      '  font-size: 14px;\n' +
      '  font-weight: 600;\n' +
      '  font-family: "Outfit", sans-serif;\n' +
      '  cursor: pointer;\n' +
      '  transition: all 0.2s;\n' +
      '}\n' +
      '.pa-consent-btn--accept {\n' +
      '  background: linear-gradient(135deg, #667eea, #764ba2);\n' +
      '  color: #fff;\n' +
      '}\n' +
      '.pa-consent-btn--accept:hover {\n' +
      '  transform: translateY(-1px);\n' +
      '  box-shadow: 0 4px 16px rgba(102,126,234,0.4);\n' +
      '}\n' +
      '.pa-consent-btn--decline {\n' +
      '  background: rgba(255,255,255,0.06);\n' +
      '  color: rgba(255,255,255,0.5);\n' +
      '  border: 1px solid rgba(255,255,255,0.1);\n' +
      '}\n' +
      '.pa-consent-btn--decline:hover {\n' +
      '  background: rgba(255,255,255,0.1);\n' +
      '}\n';

    var style = document.createElement('style');
    style.id = 'pa-ads-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─── Cookie Consent ────────────────────────────────────
  function _checkConsent() {
    var stored = localStorage.getItem('pa-ad-consent');
    if (stored === 'accepted') {
      _state.consentGiven = true;
      return true;
    }
    if (stored === 'declined') {
      _state.consentDeclined = true;
      return true; // consent resolved (declined)
    }
    return false;
  }

  function _showConsentBanner() {
    if (_checkConsent()) return;

    var banner = document.createElement('div');
    banner.className = 'pa-consent-banner';
    banner.id = 'pa-consent-banner';
    banner.innerHTML =
      '<div class="pa-consent-inner">' +
        '<div class="pa-consent-text">' +
          '<h4>' + _t('cookie_title') + '</h4>' +
          '<p>' + _t('cookie_message') + '</p>' +
        '</div>' +
        '<div class="pa-consent-buttons">' +
          '<button class="pa-consent-btn pa-consent-btn--decline" id="pa-consent-decline">' +
            _t('cookie_decline') +
          '</button>' +
          '<button class="pa-consent-btn pa-consent-btn--accept" id="pa-consent-accept">' +
            _t('cookie_accept') +
          '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);

    document.getElementById('pa-consent-accept').addEventListener('click', function () {
      localStorage.setItem('pa-ad-consent', 'accepted');
      _state.consentGiven = true;
      banner.remove();
      _loadAdSenseScript();
      _trackEvent('consent', 'accepted', 'cookie_banner');
    });

    document.getElementById('pa-consent-decline').addEventListener('click', function () {
      localStorage.setItem('pa-ad-consent', 'declined');
      _state.consentDeclined = true;
      banner.remove();
      _trackEvent('consent', 'declined', 'cookie_banner');
    });
  }

  // ─── AdSense Script Loader ────────────────────────────
  function _loadAdSenseScript() {
    if (!_config.adsenseClient || _isAdSenseReady()) return;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + _config.adsenseClient;
    script.crossOrigin = 'anonymous';
    script.onerror = function () {
      _config.devMode = true; // fall back to placeholders
      if (_config.devMode) {
        console.warn('[PuzzleAds] AdSense failed to load, using placeholders.');
      }
    };
    document.head.appendChild(script);
  }

  // ─── Placeholder Creator ──────────────────────────────
  function _createPlaceholder(type, width, height) {
    var unit = document.createElement('div');
    unit.className = 'pa-ad-unit pa-ad-unit--' + type;

    var label = document.createElement('div');
    label.className = 'pa-ad-label';
    label.textContent = _t('ad_label');

    var inner = document.createElement('div');
    inner.className = 'pa-ad-placeholder';
    inner.textContent = width + ' × ' + height;

    unit.appendChild(label);
    unit.appendChild(inner);

    return unit;
  }

  // ─── AdSense Unit Creator ─────────────────────────────
  function _createAdSenseUnit(slotId, format, responsive) {
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', _config.adsenseClient);
    ins.setAttribute('data-ad-slot', slotId);
    if (format) ins.setAttribute('data-ad-format', format);
    if (responsive) ins.setAttribute('data-full-width-responsive', 'true');

    var wrapper = document.createElement('div');
    wrapper.className = 'pa-ad-unit';
    wrapper.style.border = 'none';
    wrapper.style.background = 'transparent';

    var label = document.createElement('div');
    label.className = 'pa-ad-label';
    label.textContent = _t('ad_label');

    wrapper.appendChild(label);
    wrapper.appendChild(ins);

    return { wrapper: wrapper, ins: ins };
  }

  // ─── Lazy Load with IntersectionObserver ───────────────
  function _observeAdSlot(container, loadFn) {
    if (!('IntersectionObserver' in window)) {
      loadFn();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          loadFn();
        }
      });
    }, { rootMargin: '200px' });

    observer.observe(container);
    _state.observers.push(observer);
  }

  // ─── Visible Ad Counter ───────────────────────────────
  function _canShowAd() {
    return _state.visibleAdCount < _config.maxVisibleAds;
  }

  function _registerVisibleAd(element) {
    if (!('IntersectionObserver' in window)) {
      _state.visibleAdCount++;
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          _state.visibleAdCount++;
        } else {
          _state.visibleAdCount = Math.max(0, _state.visibleAdCount - 1);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(element);
    _state.observers.push(observer);
  }

  // ─── Replace Existing Ad Placeholders ─────────────────
  function _replaceExistingPlaceholders() {
    // Find all existing ad placeholder divs and replace them
    var selectors = [
      '.ad-placeholder',
      '[class*="ad-slot"]',
      '[data-ad-slot]',
    ];

    selectors.forEach(function (sel) {
      var elements = document.querySelectorAll(sel);
      elements.forEach(function (el) {
        if (el.dataset.paReplaced) return;
        el.dataset.paReplaced = 'true';

        var type = el.dataset.adType || 'banner';
        switch (type) {
          case 'rectangle':
            PuzzleAds.showRectangle(el);
            break;
          case 'native':
            _showNative(el);
            break;
          default:
            PuzzleAds.showBanner(el);
        }
      });
    });
  }

  // ─── Show Banner ──────────────────────────────────────
  function _showBanner(container) {
    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) return;
    if (!_canShowAd()) return;
    if (_state.activeSlots.has(container)) return;
    _state.activeSlots.add(container);

    var slotId = container.id || 'pa-banner-' + Date.now();

    _observeAdSlot(container, function () {
      container.innerHTML = '';

      if (_isAdSenseReady() && _config.bannerSlot && _state.consentGiven) {
        var ad = _createAdSenseUnit(_config.bannerSlot, 'horizontal', true);
        container.appendChild(ad.wrapper);
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          // fallback to placeholder
          container.innerHTML = '';
          var w = _isMobile() ? 320 : 728;
          var h = _isMobile() ? 50 : 90;
          container.appendChild(_createPlaceholder('banner', w, h));
        }
      } else {
        var w = _isMobile() ? 320 : 728;
        var h = _isMobile() ? 50 : 90;
        container.appendChild(_createPlaceholder('banner', w, h));
      }

      _registerVisibleAd(container);
      _trackEvent('ads', 'impression', 'banner', 0);
    });
  }

  // ─── Show Rectangle ───────────────────────────────────
  function _showRectangle(container) {
    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) return;
    if (!_canShowAd()) return;
    if (_state.activeSlots.has(container)) return;
    _state.activeSlots.add(container);

    _observeAdSlot(container, function () {
      container.innerHTML = '';

      if (_isAdSenseReady() && _config.rectangleSlot && _state.consentGiven) {
        var ad = _createAdSenseUnit(_config.rectangleSlot, 'rectangle', false);
        container.appendChild(ad.wrapper);
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          container.innerHTML = '';
          container.appendChild(_createPlaceholder('rectangle', 300, 250));
        }
      } else {
        container.appendChild(_createPlaceholder('rectangle', 300, 250));
      }

      _registerVisibleAd(container);
      _trackEvent('ads', 'impression', 'rectangle', 0);
    });
  }

  // ─── Show Native In-Feed ──────────────────────────────
  function _showNative(container) {
    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) return;
    if (!_canShowAd()) return;
    if (_state.activeSlots.has(container)) return;
    _state.activeSlots.add(container);

    _observeAdSlot(container, function () {
      container.innerHTML = '';

      if (_isAdSenseReady() && _config.nativeSlot && _state.consentGiven) {
        var ad = _createAdSenseUnit(_config.nativeSlot, 'fluid', true);
        ad.ins.setAttribute('data-ad-layout-key', '-fb+5w+4e-db+86');
        container.appendChild(ad.wrapper);
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          container.innerHTML = '';
          container.appendChild(_createPlaceholder('native', 'fluid', 'auto'));
        }
      } else {
        container.appendChild(_createPlaceholder('native', 'fluid', 'auto'));
      }

      _registerVisibleAd(container);
      _trackEvent('ads', 'impression', 'native', 0);
    });
  }

  // ─── Interstitial ─────────────────────────────────────
  function _showInterstitial() {
    var now = Date.now();
    if (now - _state.lastInterstitialTime < _config.interstitialCooldownMs) {
      if (_config.devMode) {
        console.log('[PuzzleAds] Interstitial skipped: cooldown active (' +
          Math.ceil((_config.interstitialCooldownMs - (now - _state.lastInterstitialTime)) / 1000) + 's remaining)');
      }
      return false;
    }

    if (!_state.consentGiven && !_state.consentDeclined) return false;

    _state.lastInterstitialTime = now;

    var overlay = document.createElement('div');
    overlay.className = 'pa-interstitial-overlay';
    overlay.id = 'pa-interstitial';

    var container = document.createElement('div');
    container.className = 'pa-interstitial-container';

    var label = document.createElement('div');
    label.className = 'pa-ad-label';
    label.textContent = _t('ad_label');

    var closeBtn = document.createElement('button');
    closeBtn.className = 'pa-interstitial-close';
    closeBtn.disabled = true;
    closeBtn.innerHTML = '&times;';

    var content = document.createElement('div');
    content.className = 'pa-ad-placeholder';
    content.style.fontSize = '16px';

    // 5-second countdown before close is enabled
    var countdown = 5;
    content.textContent = countdown + _t('rewarded_countdown');

    var timer = setInterval(function () {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        closeBtn.disabled = false;
        content.textContent = '';
      } else {
        content.textContent = countdown + _t('rewarded_countdown');
      }
    }, 1000);

    closeBtn.addEventListener('click', function () {
      if (!closeBtn.disabled) {
        clearInterval(timer);
        overlay.remove();
        _trackEvent('ads', 'close', 'interstitial', 0);
      }
    });

    container.appendChild(label);
    container.appendChild(closeBtn);
    container.appendChild(content);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    _trackEvent('ads', 'impression', 'interstitial', 0);
    return true;
  }

  // ─── Rewarded Ad ──────────────────────────────────────
  function _showRewardedPrompt(callback) {
    if (typeof callback !== 'function') return;

    var overlay = document.createElement('div');
    overlay.className = 'pa-rewarded-overlay';
    overlay.id = 'pa-rewarded';

    var dialog = document.createElement('div');
    dialog.className = 'pa-rewarded-dialog';
    dialog.innerHTML =
      '<h3>' + _t('rewarded_title') + '</h3>' +
      '<p>' + _t('rewarded_message') + '</p>' +
      '<div>' +
        '<button class="pa-rewarded-btn pa-rewarded-btn--secondary" id="pa-rewarded-cancel">' +
          _t('rewarded_cancel') +
        '</button>' +
        '<button class="pa-rewarded-btn pa-rewarded-btn--primary" id="pa-rewarded-watch">' +
          _t('rewarded_watch') +
        '</button>' +
      '</div>';

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    document.getElementById('pa-rewarded-cancel').addEventListener('click', function () {
      overlay.remove();
      _trackEvent('ads', 'cancel', 'rewarded_prompt', 0);
    });

    document.getElementById('pa-rewarded-watch').addEventListener('click', function () {
      _trackEvent('ads', 'start', 'rewarded_watch', 0);
      _playRewardedAd(overlay, callback);
    });
  }

  function _playRewardedAd(overlay, callback) {
    var duration = 5; // seconds in dev mode
    var dialog = overlay.querySelector('.pa-rewarded-dialog');

    dialog.innerHTML =
      '<div class="pa-ad-label">' + _t('ad_label') + '</div>' +
      '<div class="pa-rewarded-countdown" id="pa-reward-timer">' + duration + '</div>' +
      '<div class="pa-rewarded-progress">' +
        '<div class="pa-rewarded-progress-bar" id="pa-reward-bar" style="width:0%"></div>' +
      '</div>' +
      '<p style="margin-top:12px;margin-bottom:0">' + duration + _t('rewarded_countdown') + '</p>';

    var remaining = duration;
    var timerEl = document.getElementById('pa-reward-timer');
    var barEl = document.getElementById('pa-reward-bar');
    var textEl = dialog.querySelector('p');

    var interval = setInterval(function () {
      remaining--;
      var pct = ((duration - remaining) / duration) * 100;
      timerEl.textContent = remaining;
      barEl.style.width = pct + '%';
      textEl.textContent = remaining + _t('rewarded_countdown');

      if (remaining <= 0) {
        clearInterval(interval);
        dialog.innerHTML =
          '<h3 style="color:#667eea;margin-bottom:16px">&#10003;</h3>' +
          '<p style="color:rgba(255,255,255,0.8);margin-bottom:0">' + _t('rewarded_done') + '</p>';

        _trackEvent('ads', 'complete', 'rewarded_watch', 1);

        setTimeout(function () {
          overlay.remove();
          callback(true);
        }, 1200);
      }
    }, 1000);

    // Start progress bar animation
    setTimeout(function () {
      barEl.style.width = '100%';
    }, 50);
    barEl.style.transition = 'width ' + duration + 's linear';
  }

  // ─── Game Event Handlers ──────────────────────────────
  function _onGameEnd(gameId) {
    _state.gameCompletions++;
    _trackEvent('game', 'end', gameId, _state.gameCompletions);

    // Show interstitial every 3rd game completion
    if (_state.gameCompletions % 3 === 0) {
      setTimeout(function () {
        _showInterstitial();
      }, 800);
    }
  }

  function _onLevelComplete(gameId, level) {
    _trackEvent('game', 'level_complete', gameId, level);

    // Show interstitial every 5 levels
    if (level > 0 && level % 5 === 0) {
      setTimeout(function () {
        _showInterstitial();
      }, 1200);
    }
  }

  // ─── Init ─────────────────────────────────────────────
  function _init(userConfig) {
    if (_state.initialized) {
      if (_config.devMode) console.warn('[PuzzleAds] Already initialized.');
      return;
    }

    // Merge config
    if (userConfig) {
      Object.keys(userConfig).forEach(function (key) {
        if (_config.hasOwnProperty(key)) {
          _config[key] = userConfig[key];
        }
      });
    }

    // Auto-detect dev mode
    if (_config.adsenseClient) {
      _config.devMode = false;
    }

    _state.lang = _detectLang();
    _state.initialized = true;

    // Inject styles
    _injectStyles();

    // Check / show consent
    _checkConsent();
    if (_state.consentGiven && _config.adsenseClient) {
      _loadAdSenseScript();
    } else if (!_state.consentGiven && !_state.consentDeclined) {
      _showConsentBanner();
    }

    // Replace existing ad placeholders in the DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _replaceExistingPlaceholders);
    } else {
      _replaceExistingPlaceholders();
    }

    // Listen for language changes
    window.addEventListener('storage', function (e) {
      if (e.key === 'puzzle-lang' && I18N[e.newValue]) {
        _state.lang = e.newValue;
      }
    });

    if (_config.devMode) {
      console.log('[PuzzleAds] Initialized (dev mode). Consent:', _state.consentGiven ? 'granted' : 'pending');
    }
  }

  // ─── Cleanup ──────────────────────────────────────────
  function _destroy() {
    _state.observers.forEach(function (obs) {
      obs.disconnect();
    });
    _state.observers = [];
    _state.activeSlots.clear();
    _state.visibleAdCount = 0;
    _state.initialized = false;

    var styleEl = document.getElementById('pa-ads-styles');
    if (styleEl) styleEl.remove();

    var consent = document.getElementById('pa-consent-banner');
    if (consent) consent.remove();

    var interstitial = document.getElementById('pa-interstitial');
    if (interstitial) interstitial.remove();

    var rewarded = document.getElementById('pa-rewarded');
    if (rewarded) rewarded.remove();
  }

  // ─── Public API ───────────────────────────────────────
  var PuzzleAds = {
    init: _init,
    showBanner: _showBanner,
    showRectangle: _showRectangle,
    showNative: _showNative,
    showInterstitial: _showInterstitial,
    showRewardedPrompt: _showRewardedPrompt,
    onGameEnd: _onGameEnd,
    onLevelComplete: _onLevelComplete,
    destroy: _destroy,

    // Utility: check if ads are consented
    hasConsent: function () { return _state.consentGiven; },
    isReady: function () { return _state.initialized; },
  };

  window.PuzzleAds = PuzzleAds;
})();
