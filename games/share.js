// ===== Puzzle Arcade - Share Module =====
// Provides screenshot card generation & social sharing for all games.
// No external dependencies - uses native Canvas API only.
// Usage: PuzzleShare.showShareModal({ title, score, stars, message, lang, gameName })

(function () {
  'use strict';

  // ── i18n for share UI ──
  const SHARE_I18N = {
    ko: {
      shareTitle: '결과 공유',
      saveImage: '이미지 저장',
      share: '공유하기',
      close: '닫기',
      instagramHint: '저장 후 Instagram Stories에 공유하세요!',
      copied: '링크가 복사되었습니다!',
      shareText: '🎮 Puzzle Arcade에서 {game} 플레이! {result}',
      motivational: '도전을 이어가세요!',
      result: '결과',
      stars_label: '★',
      score_label: '점',
      playNow: '지금 플레이 →',
    },
    en: {
      shareTitle: 'Share Result',
      saveImage: 'Save Image',
      share: 'Share',
      close: 'Close',
      instagramHint: 'Save & share on Instagram Stories!',
      copied: 'Link copied!',
      shareText: '🎮 Played {game} on Puzzle Arcade! {result}',
      motivational: 'Keep the streak going!',
      result: 'Result',
      stars_label: '★',
      score_label: 'pts',
      playNow: 'Play Now →',
    },
    ja: {
      shareTitle: '結果をシェア',
      saveImage: '画像を保存',
      share: 'シェア',
      close: '閉じる',
      instagramHint: '保存してInstagram Storiesでシェア！',
      copied: 'リンクをコピーしました！',
      shareText: '🎮 Puzzle Arcadeで{game}をプレイ！{result}',
      motivational: '挑戦を続けよう！',
      result: '結果',
      stars_label: '★',
      score_label: '点',
      playNow: '今すぐプレイ →',
    },
    zh: {
      shareTitle: '分享结果',
      saveImage: '保存图片',
      share: '分享',
      close: '关闭',
      instagramHint: '保存后分享到 Instagram Stories！',
      copied: '链接已复制！',
      shareText: '🎮 在 Puzzle Arcade 玩了 {game}！{result}',
      motivational: '继续挑战吧！',
      result: '结果',
      stars_label: '★',
      score_label: '分',
      playNow: '立即游玩 →',
    },
    es: {
      shareTitle: 'Compartir resultado',
      saveImage: 'Guardar imagen',
      share: 'Compartir',
      close: 'Cerrar',
      instagramHint: '¡Guarda y comparte en Instagram Stories!',
      copied: '¡Enlace copiado!',
      shareText: '🎮 ¡Jugué {game} en Puzzle Arcade! {result}',
      motivational: '¡Sigue jugando!',
      result: 'Resultado',
      stars_label: '★',
      score_label: 'pts',
      playNow: 'Jugar ahora →',
    },
  };

  function getLang() {
    if (typeof getGameLang === 'function') return getGameLang();
    var params = new URLSearchParams(window.location.search);
    return params.get('lang') || localStorage.getItem('puzzleArcadeLang') || 'ko';
  }

  function t(lang) {
    return SHARE_I18N[lang] || SHARE_I18N.ko;
  }

  // ── Inject CSS ──
  function injectStyles() {
    if (document.getElementById('puzzle-share-styles')) return;
    var style = document.createElement('style');
    style.id = 'puzzle-share-styles';
    style.textContent = [
      '.ps-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s ease;padding:20px}',
      '.ps-overlay.ps-visible{opacity:1}',
      '.ps-modal{background:linear-gradient(145deg,#111128,#0e0e24);border:1px solid rgba(168,85,247,.25);border-radius:20px;padding:28px 24px;max-width:400px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,.6),0 0 40px rgba(168,85,247,.12);position:relative;transform:translateY(24px) scale(.96);transition:transform .35s cubic-bezier(.22,1,.36,1);font-family:"Outfit",sans-serif;color:#fff}',
      '.ps-overlay.ps-visible .ps-modal{transform:translateY(0) scale(1)}',
      '.ps-close{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#999;font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;line-height:1}',
      '.ps-close:hover{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.2)}',
      '.ps-title{font-size:1.15rem;font-weight:700;margin-bottom:18px;text-align:center;background:linear-gradient(135deg,#667eea,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
      '.ps-preview{width:100%;border-radius:12px;overflow:hidden;margin-bottom:16px;border:1px solid rgba(255,255,255,.06)}',
      '.ps-preview canvas,.ps-preview img{width:100%;display:block}',
      '.ps-actions{display:flex;gap:10px;margin-bottom:14px}',
      '.ps-btn{flex:1;padding:12px 0;border-radius:12px;border:none;font-family:"Outfit",sans-serif;font-size:.92rem;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px}',
      '.ps-btn-save{background:linear-gradient(135deg,#667eea,#a855f7);color:#fff}',
      '.ps-btn-save:hover{filter:brightness(1.12);transform:translateY(-1px)}',
      '.ps-btn-share{background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff}',
      '.ps-btn-share:hover{filter:brightness(1.12);transform:translateY(-1px)}',
      '.ps-ig-hint{text-align:center;font-size:.8rem;color:#888;line-height:1.5}',
      '.ps-ig-hint span{color:#e1306c;font-weight:600}',
      '.ps-toast{position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(20px);background:rgba(168,85,247,.92);color:#fff;padding:10px 22px;border-radius:10px;font-family:"Outfit",sans-serif;font-size:.88rem;font-weight:600;opacity:0;transition:all .3s ease;z-index:100000;pointer-events:none}',
      '.ps-toast.ps-show{opacity:1;transform:translateX(-50%) translateY(0)}',
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Canvas card generation ──
  function generateCard(options) {
    var W = 720;
    var H = 960;
    var dpr = 2;
    var canvas = document.createElement('canvas');
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    var lang = options.lang || getLang();
    var tr = t(lang);

    // ── Background gradient ──
    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0d0d2b');
    bg.addColorStop(0.5, '#14103a');
    bg.addColorStop(1, '#1a0e30');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Decorative circles
    ctx.save();
    ctx.globalAlpha = 0.07;
    var r1 = ctx.createRadialGradient(120, 180, 0, 120, 180, 260);
    r1.addColorStop(0, '#667eea');
    r1.addColorStop(1, 'transparent');
    ctx.fillStyle = r1;
    ctx.fillRect(0, 0, W, H);
    var r2 = ctx.createRadialGradient(580, 700, 0, 580, 700, 300);
    r2.addColorStop(0, '#ec4899');
    r2.addColorStop(1, 'transparent');
    ctx.fillStyle = r2;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Subtle grid pattern
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.5;
    for (var gx = 0; gx < W; gx += 40) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (var gy = 0; gy < H; gy += 40) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }
    ctx.restore();

    // ── Top accent line ──
    var accent = ctx.createLinearGradient(60, 0, W - 60, 0);
    accent.addColorStop(0, '#667eea');
    accent.addColorStop(0.5, '#a855f7');
    accent.addColorStop(1, '#ec4899');
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 60);
    ctx.lineTo(W - 60, 60);
    ctx.stroke();
    ctx.restore();

    // ── Header: Puzzle Arcade ──
    ctx.save();
    ctx.font = '700 22px "Outfit", "Segoe UI", sans-serif';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.fillText('PUZZLE ARCADE', W / 2, 102);
    ctx.restore();

    // ── Game name ──
    ctx.save();
    ctx.font = '800 52px "Outfit", "Segoe UI", sans-serif';
    var nameGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
    nameGrad.addColorStop(0, '#667eea');
    nameGrad.addColorStop(0.5, '#a855f7');
    nameGrad.addColorStop(1, '#ec4899');
    ctx.fillStyle = nameGrad;
    ctx.textAlign = 'center';
    ctx.fillText(options.gameName || options.title || 'Game', W / 2, 180);
    ctx.restore();

    // ── Divider ──
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(100, 220);
    ctx.lineTo(W - 100, 220);
    ctx.stroke();
    ctx.restore();

    // ── Stars ──
    var centerY = 340;
    if (options.stars !== undefined && options.stars !== null) {
      var totalStars = 3;
      var starSize = 36;
      var starGap = 22;
      var starsWidth = totalStars * starSize * 2 + (totalStars - 1) * starGap;
      var startX = (W - starsWidth) / 2 + starSize;
      centerY = 290;

      for (var i = 0; i < totalStars; i++) {
        var sx = startX + i * (starSize * 2 + starGap);
        var filled = i < options.stars;
        drawStar(ctx, sx, centerY, starSize, filled);
      }
      centerY += 70;
    }

    // ── Score / Message ──
    if (options.score !== undefined && options.score !== null) {
      ctx.save();
      ctx.font = '900 80px "Outfit", "Segoe UI", sans-serif';
      var scoreGrad = ctx.createLinearGradient(W / 2 - 100, centerY - 30, W / 2 + 100, centerY + 30);
      scoreGrad.addColorStop(0, '#f9d423');
      scoreGrad.addColorStop(1, '#ff4e50');
      ctx.fillStyle = scoreGrad;
      ctx.textAlign = 'center';
      ctx.fillText(String(options.score), W / 2, centerY + 20);
      ctx.restore();

      ctx.save();
      ctx.font = '600 22px "Outfit", "Segoe UI", sans-serif';
      ctx.fillStyle = '#999';
      ctx.textAlign = 'center';
      ctx.fillText(tr.score_label, W / 2, centerY + 54);
      ctx.restore();

      centerY += 100;
    }

    if (options.message) {
      ctx.save();
      ctx.font = '700 32px "Outfit", "Segoe UI", sans-serif';
      ctx.fillStyle = '#e0e0e0';
      ctx.textAlign = 'center';
      wrapText(ctx, options.message, W / 2, centerY + 20, W - 140, 42);
      ctx.restore();
      centerY += 70;
    }

    // ── Motivational quote ──
    ctx.save();
    ctx.font = '500 20px "Outfit", "Segoe UI", sans-serif';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText(tr.motivational, W / 2, Math.max(centerY + 50, 560));
    ctx.restore();

    // ── Bottom section: QR-like pattern + URL ──
    var bottomY = H - 160;

    // Decorative QR-like block pattern
    drawQRPattern(ctx, W / 2 - 50, bottomY - 20, 100, 100);

    // URL text
    ctx.save();
    ctx.font = '600 18px "Outfit", "Segoe UI", sans-serif';
    ctx.fillStyle = '#777';
    ctx.textAlign = 'center';
    ctx.fillText('puzzlearcade.app', W / 2, bottomY + 100);
    ctx.restore();

    // Play Now CTA
    ctx.save();
    ctx.font = '600 16px "Outfit", "Segoe UI", sans-serif';
    ctx.fillStyle = '#a855f7';
    ctx.textAlign = 'center';
    ctx.fillText(tr.playNow, W / 2, bottomY + 126);
    ctx.restore();

    // ── Bottom accent line ──
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, H - 30);
    ctx.lineTo(W - 60, H - 30);
    ctx.stroke();
    ctx.restore();

    return canvas;
  }

  function drawStar(ctx, cx, cy, r, filled) {
    ctx.save();
    var spikes = 5;
    var outerR = r;
    var innerR = r * 0.45;
    ctx.beginPath();
    for (var i = 0; i < spikes * 2; i++) {
      var radius = i % 2 === 0 ? outerR : innerR;
      var angle = (Math.PI * i) / spikes - Math.PI / 2;
      var x = cx + Math.cos(angle) * radius;
      var y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (filled) {
      var grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      grad.addColorStop(0, '#f9d423');
      grad.addColorStop(1, '#f7971e');
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(249,212,35,.4)';
      ctx.shadowBlur = 18;
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawQRPattern(ctx, x, y, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    var cellSize = 8;
    var cols = Math.floor(w / cellSize);
    var rows = Math.floor(h / cellSize);
    // Seeded pseudo-random for consistent pattern
    var seed = 42;
    function rand() {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    }
    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        // Corner squares (QR-like anchors)
        var isCorner =
          (row < 3 && col < 3) ||
          (row < 3 && col >= cols - 3) ||
          (row >= rows - 3 && col < 3);
        if (isCorner || rand() > 0.55) {
          ctx.fillStyle = isCorner ? '#a855f7' : '#667eea';
          ctx.fillRect(
            x + col * cellSize,
            y + row * cellSize,
            cellSize - 1,
            cellSize - 1
          );
        }
      }
    }
    ctx.restore();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    var lines = [];
    for (var i = 0; i < words.length; i++) {
      var testLine = line + words[i] + ' ';
      if (ctx.measureText(testLine).width > maxWidth && line !== '') {
        lines.push(line.trim());
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    for (var j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], x, y + j * lineHeight);
    }
  }

  // ── Toast notification ──
  function showToast(msg) {
    var existing = document.querySelector('.ps-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'ps-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('ps-show');
    });
    setTimeout(function () {
      toast.classList.remove('ps-show');
      setTimeout(function () { toast.remove(); }, 300);
    }, 2200);
  }

  // ── Main: show share modal ──
  function showShareModal(options) {
    options = options || {};
    injectStyles();

    var lang = options.lang || getLang();
    var tr = t(lang);

    // Generate card
    var card = generateCard(options);

    // Convert to blob for saving/sharing
    var dataURL = card.toDataURL('image/png');

    // Build modal DOM
    var overlay = document.createElement('div');
    overlay.className = 'ps-overlay';
    overlay.innerHTML = [
      '<div class="ps-modal">',
      '  <button class="ps-close" aria-label="' + tr.close + '">&times;</button>',
      '  <div class="ps-title">' + tr.shareTitle + '</div>',
      '  <div class="ps-preview"><img alt="share card"></div>',
      '  <div class="ps-actions">',
      '    <button class="ps-btn ps-btn-save">&#128190; ' + tr.saveImage + '</button>',
      '    <button class="ps-btn ps-btn-share">&#128279; ' + tr.share + '</button>',
      '  </div>',
      '  <div class="ps-ig-hint"><span>Instagram</span> ' + tr.instagramHint + '</div>',
      '</div>',
    ].join('\n');

    var img = overlay.querySelector('.ps-preview img');
    img.src = dataURL;

    // Close handlers
    var closeModal = function () {
      overlay.classList.remove('ps-visible');
      setTimeout(function () { overlay.remove(); }, 300);
    };
    overlay.querySelector('.ps-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    // Save image
    overlay.querySelector('.ps-btn-save').addEventListener('click', function () {
      var link = document.createElement('a');
      link.download = 'puzzle-arcade-' + (options.gameName || 'result').toLowerCase().replace(/\s+/g, '-') + '.png';
      link.href = dataURL;
      link.click();
    });

    // Share button
    overlay.querySelector('.ps-btn-share').addEventListener('click', function () {
      var resultStr = '';
      if (options.score !== undefined && options.score !== null) resultStr += options.score + ' ' + tr.score_label;
      if (options.stars !== undefined && options.stars !== null) resultStr += (resultStr ? ' | ' : '') + tr.stars_label.repeat(options.stars);
      if (options.message) resultStr += (resultStr ? ' - ' : '') + options.message;

      var text = tr.shareText
        .replace('{game}', options.gameName || options.title || 'Game')
        .replace('{result}', resultStr);

      var url = window.location.href;

      if (navigator.share) {
        // Convert data URL to blob for native sharing
        fetch(dataURL)
          .then(function (res) { return res.blob(); })
          .then(function (blob) {
            var file = new File([blob], 'puzzle-arcade.png', { type: 'image/png' });
            return navigator.share({
              title: 'Puzzle Arcade',
              text: text,
              url: url,
              files: [file],
            }).catch(function () {
              // If file sharing not supported, share without file
              return navigator.share({ title: 'Puzzle Arcade', text: text, url: url });
            });
          })
          .catch(function () {
            // Final fallback: copy to clipboard
            copyFallback(text + '\n' + url, tr);
          });
      } else {
        copyFallback(text + '\n' + url, tr);
      }
    });

    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      overlay.classList.add('ps-visible');
    });
  }

  function copyFallback(text, tr) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(tr.copied);
      });
    } else {
      // Very old browser fallback
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast(tr.copied);
    }
  }

  // ── Export globally ──
  window.PuzzleShare = {
    showShareModal: showShareModal,
  };
})();
