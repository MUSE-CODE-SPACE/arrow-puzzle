// ===== Puzzle Arcade - User System Module =====
// Comprehensive user system: Firebase auth, rankings, badges, profile.
// No build tools required - Firebase SDK loaded dynamically via CDN.
// Usage: PuzzleUser.recordGame('snake', { score: 45 });
//        PuzzleUser.showRankings('snake');
//        PuzzleUser.showBadges();
//        PuzzleUser.showProfile();

(function () {
  'use strict';

  // ── Firebase Configuration ──
  // Replace these values with your own Firebase project config.
  // Go to https://console.firebase.google.com → Project Settings → General
  // Scroll to "Your apps" → Web app → Config
  var FIREBASE_CONFIG = {
    apiKey: 'YOUR_API_KEY_HERE',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:0000000000000000000000',
  };

  var FIREBASE_SDK_VERSION = '10.12.0';
  var STORAGE_PREFIX = 'puzzleArcade_';

  // ── State ──
  var firebaseReady = false;
  var firebaseLoading = false;
  var firebaseLoadCallbacks = [];
  var currentUser = null; // { uid, displayName, photoURL }
  var db = null; // Firestore reference
  var auth = null; // Auth reference

  // ──────────────────────────────────────────
  //  i18n - Badge Names & Descriptions (5 langs)
  // ──────────────────────────────────────────

  var BADGE_I18N = {
    ko: {
      // UI
      login: '로그인',
      logout: '로그아웃',
      profile: '프로필',
      rankings: '랭킹',
      badges: '배지',
      guest: '게스트',
      loginWith: 'Google로 로그인',
      loginRequired: '로그인이 필요합니다',
      rank: '순위',
      player: '플레이어',
      scoreLabel: '점수',
      noScores: '아직 기록이 없습니다',
      yourRank: '나의 순위',
      badgeProgress: '배지 진행도',
      earned: '획득!',
      locked: '???',
      totalGames: '총 게임 수',
      totalScore: '총 점수',
      recentActivity: '최근 활동',
      noActivity: '아직 활동이 없습니다',
      badgeEarned: '배지 획득!',
      close: '닫기',
      // Badge names
      badge_first_game: '첫 게임',
      badge_explorer: '탐험가',
      badge_star_collector: '별 수집가',
      badge_perfect: '퍼펙트',
      badge_consistent: '꾸준함',
      badge_genius: '천재',
      badge_lightning: '번개',
      badge_sharpshooter: '명사수',
      badge_typist: '타이피스트',
      badge_math_genius: '수학 천재',
      badge_color_master: '색채 달인',
      badge_wordmaster: '단어 달인',
      badge_world_traveler: '세계 여행가',
      badge_snake_king: '스네이크 왕',
      badge_bomb_defuser: '폭탄 해체반',
      badge_puzzle_master: '퍼즐 마스터',
      badge_on_fire: '불타오르네',
      badge_arcade_legend: '아케이드 전설',
      badge_diamond: '다이아몬드',
      badge_rank_one: '1등',
      // Badge descriptions
      desc_first_game: '첫 번째 게임을 플레이하세요',
      desc_explorer: '10가지 다른 게임을 플레이하세요',
      desc_star_collector: '별을 총 50개 모으세요',
      desc_perfect: '레벨에서 별 3개를 획득하세요',
      desc_consistent: '3일 연속 로그인하세요',
      desc_genius: 'IQ 테스트에서 130점 이상 받으세요',
      desc_lightning: '반응속도 200ms 이하를 달성하세요',
      desc_sharpshooter: '에임 트레이너에서 95% 이상 정확도를 달성하세요',
      desc_typist: '타이핑 속도 70 WPM 이상을 달성하세요',
      desc_math_genius: '수학 퀴즈에서 30문제 이상 맞추세요',
      desc_color_master: '컬러 브레인에서 S등급을 받으세요',
      desc_wordmaster: '단어 맞추기를 2번 만에 맞추세요',
      desc_world_traveler: '국기 퀴즈에서 만점을 받으세요',
      desc_snake_king: '스네이크에서 50점 이상 받으세요',
      desc_bomb_defuser: '단어 폭탄에서 20라운드 이상 생존하세요',
      desc_puzzle_master: '총 100개의 레벨을 클리어하세요',
      desc_on_fire: '20연속 정답을 달성하세요',
      desc_arcade_legend: '배지를 15개 이상 모으세요',
      desc_diamond: '총 100번 게임을 플레이하세요',
      desc_rank_one: '어떤 게임에서든 1위를 달성하세요',
    },
    en: {
      login: 'Login',
      logout: 'Logout',
      profile: 'Profile',
      rankings: 'Rankings',
      badges: 'Badges',
      guest: 'Guest',
      loginWith: 'Sign in with Google',
      loginRequired: 'Login required',
      rank: 'Rank',
      player: 'Player',
      scoreLabel: 'Score',
      noScores: 'No scores yet',
      yourRank: 'Your Rank',
      badgeProgress: 'Badge Progress',
      earned: 'Earned!',
      locked: '???',
      totalGames: 'Total Games',
      totalScore: 'Total Score',
      recentActivity: 'Recent Activity',
      noActivity: 'No activity yet',
      badgeEarned: 'Badge Earned!',
      close: 'Close',
      badge_first_game: 'First Game',
      badge_explorer: 'Explorer',
      badge_star_collector: 'Star Collector',
      badge_perfect: 'Perfectionist',
      badge_consistent: 'Consistent',
      badge_genius: 'Genius',
      badge_lightning: 'Lightning',
      badge_sharpshooter: 'Sharpshooter',
      badge_typist: 'Speed Typist',
      badge_math_genius: 'Math Genius',
      badge_color_master: 'Color Master',
      badge_wordmaster: 'Word Master',
      badge_world_traveler: 'World Traveler',
      badge_snake_king: 'Snake King',
      badge_bomb_defuser: 'Bomb Defuser',
      badge_puzzle_master: 'Puzzle Master',
      badge_on_fire: 'On Fire',
      badge_arcade_legend: 'Arcade Legend',
      badge_diamond: 'Diamond',
      badge_rank_one: 'Rank One',
      desc_first_game: 'Play your first game',
      desc_explorer: 'Play 10 different games',
      desc_star_collector: 'Collect 50 stars in total',
      desc_perfect: 'Get 3 stars on any level',
      desc_consistent: 'Log in 3 days in a row',
      desc_genius: 'Score 130+ on the IQ test',
      desc_lightning: 'Achieve a reaction time under 200ms',
      desc_sharpshooter: 'Achieve 95%+ accuracy in Aim Trainer',
      desc_typist: 'Type at 70+ WPM',
      desc_math_genius: 'Answer 30+ correctly in Math Quiz',
      desc_color_master: 'Get S grade in Color Brain',
      desc_wordmaster: 'Guess the word in 2 tries',
      desc_world_traveler: 'Get a perfect score on Flag Quiz',
      desc_snake_king: 'Score 50+ in Snake',
      desc_bomb_defuser: 'Survive 20+ rounds in Word Bomb',
      desc_puzzle_master: 'Clear 100 levels total',
      desc_on_fire: 'Get a 20-streak',
      desc_arcade_legend: 'Earn 15+ badges',
      desc_diamond: 'Play 100 games total',
      desc_rank_one: 'Reach rank 1 in any game',
    },
    ja: {
      login: 'ログイン',
      logout: 'ログアウト',
      profile: 'プロフィール',
      rankings: 'ランキング',
      badges: 'バッジ',
      guest: 'ゲスト',
      loginWith: 'Googleでログイン',
      loginRequired: 'ログインが必要です',
      rank: '順位',
      player: 'プレイヤー',
      scoreLabel: 'スコア',
      noScores: 'まだ記録がありません',
      yourRank: 'あなたの順位',
      badgeProgress: 'バッジ進捗',
      earned: '獲得！',
      locked: '???',
      totalGames: '総ゲーム数',
      totalScore: '総スコア',
      recentActivity: '最近の活動',
      noActivity: 'まだ活動がありません',
      badgeEarned: 'バッジ獲得！',
      close: '閉じる',
      badge_first_game: '初ゲーム',
      badge_explorer: '冒険家',
      badge_star_collector: 'スターコレクター',
      badge_perfect: 'パーフェクト',
      badge_consistent: '継続は力',
      badge_genius: '天才',
      badge_lightning: '稲妻',
      badge_sharpshooter: '名射手',
      badge_typist: 'タイピスト',
      badge_math_genius: '数学の天才',
      badge_color_master: 'カラーマスター',
      badge_wordmaster: 'ワードマスター',
      badge_world_traveler: '世界旅行者',
      badge_snake_king: 'スネークキング',
      badge_bomb_defuser: '爆弾処理班',
      badge_puzzle_master: 'パズルマスター',
      badge_on_fire: '絶好調',
      badge_arcade_legend: 'アーケードレジェンド',
      badge_diamond: 'ダイヤモンド',
      badge_rank_one: '1位',
      desc_first_game: '最初のゲームをプレイしよう',
      desc_explorer: '10種類のゲームをプレイしよう',
      desc_star_collector: 'スターを合計50個集めよう',
      desc_perfect: 'レベルで星3つを獲得しよう',
      desc_consistent: '3日連続ログインしよう',
      desc_genius: 'IQテストで130点以上を取ろう',
      desc_lightning: '反応速度200ms以下を達成しよう',
      desc_sharpshooter: 'エイムトレーナーで95%以上の精度を達成しよう',
      desc_typist: 'タイピング速度70WPM以上を達成しよう',
      desc_math_genius: '数学クイズで30問以上正解しよう',
      desc_color_master: 'カラーブレインでS評価を取ろう',
      desc_wordmaster: '単語当てを2回以内で当てよう',
      desc_world_traveler: '国旗クイズで満点を取ろう',
      desc_snake_king: 'スネークで50点以上を取ろう',
      desc_bomb_defuser: 'ワードボムで20ラウンド以上生き残ろう',
      desc_puzzle_master: '合計100レベルをクリアしよう',
      desc_on_fire: '20連続正解を達成しよう',
      desc_arcade_legend: 'バッジを15個以上集めよう',
      desc_diamond: '合計100回ゲームをプレイしよう',
      desc_rank_one: 'いずれかのゲームで1位になろう',
    },
    zh: {
      login: '登录',
      logout: '退出登录',
      profile: '个人资料',
      rankings: '排行榜',
      badges: '徽章',
      guest: '游客',
      loginWith: '使用Google登录',
      loginRequired: '需要登录',
      rank: '排名',
      player: '玩家',
      scoreLabel: '分数',
      noScores: '暂无记录',
      yourRank: '你的排名',
      badgeProgress: '徽章进度',
      earned: '已获得！',
      locked: '???',
      totalGames: '总游戏数',
      totalScore: '总分数',
      recentActivity: '最近活动',
      noActivity: '暂无活动',
      badgeEarned: '获得徽章！',
      close: '关闭',
      badge_first_game: '第一局',
      badge_explorer: '探险家',
      badge_star_collector: '星星收集家',
      badge_perfect: '完美主义者',
      badge_consistent: '坚持不懈',
      badge_genius: '天才',
      badge_lightning: '闪电',
      badge_sharpshooter: '神枪手',
      badge_typist: '打字高手',
      badge_math_genius: '数学天才',
      badge_color_master: '色彩大师',
      badge_wordmaster: '文字大师',
      badge_world_traveler: '环球旅行家',
      badge_snake_king: '贪吃蛇之王',
      badge_bomb_defuser: '拆弹专家',
      badge_puzzle_master: '拼图大师',
      badge_on_fire: '势不可挡',
      badge_arcade_legend: '街机传奇',
      badge_diamond: '钻石',
      badge_rank_one: '第一名',
      desc_first_game: '玩第一局游戏',
      desc_explorer: '玩10种不同的游戏',
      desc_star_collector: '总共收集50颗星星',
      desc_perfect: '在任意关卡获得3颗星',
      desc_consistent: '连续3天登录',
      desc_genius: 'IQ测试得分130+',
      desc_lightning: '反应时间低于200ms',
      desc_sharpshooter: '瞄准训练达到95%以上准确率',
      desc_typist: '打字速度达到70WPM以上',
      desc_math_genius: '数学测验答对30题以上',
      desc_color_master: '色彩大脑获得S评级',
      desc_wordmaster: '2次以内猜中单词',
      desc_world_traveler: '国旗测验获得满分',
      desc_snake_king: '贪吃蛇得分50+',
      desc_bomb_defuser: '单词炸弹生存20轮以上',
      desc_puzzle_master: '总共通过100个关卡',
      desc_on_fire: '达成20连胜',
      desc_arcade_legend: '获得15个以上徽章',
      desc_diamond: '总共玩100局游戏',
      desc_rank_one: '在任何游戏中达到第一名',
    },
    es: {
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      profile: 'Perfil',
      rankings: 'Clasificación',
      badges: 'Insignias',
      guest: 'Invitado',
      loginWith: 'Iniciar sesión con Google',
      loginRequired: 'Inicio de sesión requerido',
      rank: 'Puesto',
      player: 'Jugador',
      scoreLabel: 'Puntos',
      noScores: 'Sin registros aún',
      yourRank: 'Tu puesto',
      badgeProgress: 'Progreso de insignias',
      earned: '¡Obtenida!',
      locked: '???',
      totalGames: 'Total de juegos',
      totalScore: 'Puntuación total',
      recentActivity: 'Actividad reciente',
      noActivity: 'Sin actividad aún',
      badgeEarned: '¡Insignia obtenida!',
      close: 'Cerrar',
      badge_first_game: 'Primer juego',
      badge_explorer: 'Explorador',
      badge_star_collector: 'Coleccionista',
      badge_perfect: 'Perfeccionista',
      badge_consistent: 'Constante',
      badge_genius: 'Genio',
      badge_lightning: 'Relámpago',
      badge_sharpshooter: 'Tirador',
      badge_typist: 'Mecanógrafo',
      badge_math_genius: 'Genio matemático',
      badge_color_master: 'Maestro del color',
      badge_wordmaster: 'Maestro de palabras',
      badge_world_traveler: 'Viajero mundial',
      badge_snake_king: 'Rey serpiente',
      badge_bomb_defuser: 'Desactivador',
      badge_puzzle_master: 'Maestro puzle',
      badge_on_fire: 'En llamas',
      badge_arcade_legend: 'Leyenda arcade',
      badge_diamond: 'Diamante',
      badge_rank_one: 'Número uno',
      desc_first_game: 'Juega tu primer juego',
      desc_explorer: 'Juega 10 juegos diferentes',
      desc_star_collector: 'Recolecta 50 estrellas en total',
      desc_perfect: 'Obtén 3 estrellas en un nivel',
      desc_consistent: 'Inicia sesión 3 días seguidos',
      desc_genius: 'Obtén 130+ en el test de IQ',
      desc_lightning: 'Logra un tiempo de reacción menor a 200ms',
      desc_sharpshooter: 'Logra 95%+ de precisión en Aim Trainer',
      desc_typist: 'Escribe a 70+ WPM',
      desc_math_genius: 'Acierta 30+ en el quiz de matemáticas',
      desc_color_master: 'Obtén grado S en Color Brain',
      desc_wordmaster: 'Adivina la palabra en 2 intentos',
      desc_world_traveler: 'Obtén puntuación perfecta en el quiz de banderas',
      desc_snake_king: 'Obtén 50+ puntos en Snake',
      desc_bomb_defuser: 'Sobrevive 20+ rondas en Word Bomb',
      desc_puzzle_master: 'Completa 100 niveles en total',
      desc_on_fire: 'Logra una racha de 20',
      desc_arcade_legend: 'Obtén 15+ insignias',
      desc_diamond: 'Juega 100 juegos en total',
      desc_rank_one: 'Alcanza el puesto 1 en cualquier juego',
    },
  };

  // ── Game name mappings for UI ──
  var GAME_NAMES = {
    ko: {
      snake: '스네이크', 'iq-test': 'IQ 테스트', 'reaction-test': '반응속도 테스트',
      'typing-speed': '타이핑 속도', 'math-quiz': '수학 퀴즈', 'color-brain': '컬러 브레인',
      'word-guess': '단어 맞추기', 'flag-quiz': '국기 퀴즈', 'word-bomb': '단어 폭탄',
      'aim-trainer': '에임 트레이너', '2048': '2048', 'arrow-puzzle': '화살표 퍼즐',
      'memory-card': '메모리 카드', 'bubble-pop': '버블 팝', minesweeper: '지뢰찾기',
      'sliding-puzzle': '슬라이딩 퍼즐', maze: '미로', 'connect4': '커넥트4',
      'block-stack': '블록 쌓기', flappy: '플래피', 'color-match': '컬러 매치',
      'color-fill': '컬러 채우기', 'lights-out': '라이트 아웃', 'number-chain': '숫자 체인',
      'number-find': '숫자 찾기', 'one-line': '한붓그리기', 'parking-jam': '주차 탈출',
      'pattern-lock': '패턴 잠금', 'rps-battle': '가위바위보', 'sequence-memory': '순서 기억',
      'spot-diff': '틀린그림찾기', 'tile-match': '타일 매치', trivia: '상식 퀴즈',
      'water-sort': '물 정렬', 'whack-mole': '두더지 잡기', merge: '머지',
      'emoji-puzzle': '이모지 퍼즐',
    },
    en: {
      snake: 'Snake', 'iq-test': 'IQ Test', 'reaction-test': 'Reaction Test',
      'typing-speed': 'Typing Speed', 'math-quiz': 'Math Quiz', 'color-brain': 'Color Brain',
      'word-guess': 'Word Guess', 'flag-quiz': 'Flag Quiz', 'word-bomb': 'Word Bomb',
      'aim-trainer': 'Aim Trainer', '2048': '2048', 'arrow-puzzle': 'Arrow Puzzle',
      'memory-card': 'Memory Card', 'bubble-pop': 'Bubble Pop', minesweeper: 'Minesweeper',
      'sliding-puzzle': 'Sliding Puzzle', maze: 'Maze', 'connect4': 'Connect 4',
      'block-stack': 'Block Stack', flappy: 'Flappy', 'color-match': 'Color Match',
      'color-fill': 'Color Fill', 'lights-out': 'Lights Out', 'number-chain': 'Number Chain',
      'number-find': 'Number Find', 'one-line': 'One Line', 'parking-jam': 'Parking Jam',
      'pattern-lock': 'Pattern Lock', 'rps-battle': 'RPS Battle', 'sequence-memory': 'Sequence Memory',
      'spot-diff': 'Spot Difference', 'tile-match': 'Tile Match', trivia: 'Trivia',
      'water-sort': 'Water Sort', 'whack-mole': 'Whack-a-Mole', merge: 'Merge',
      'emoji-puzzle': 'Emoji Puzzle',
    },
  };

  // ── Badge Definitions ──
  var BADGES = [
    // Beginner (5)
    { id: 'first_game', emoji: '\uD83C\uDFAE', conditions: { gamesPlayed: 1 } },
    { id: 'explorer', emoji: '\uD83C\uDFEA', conditions: { uniqueGames: 10 } },
    { id: 'star_collector', emoji: '\uD83C\uDF1F', conditions: { totalStars: 50 } },
    { id: 'perfect', emoji: '\uD83C\uDFC6', conditions: { threeStarLevels: 1 } },
    { id: 'consistent', emoji: '\uD83D\uDCC5', conditions: { loginStreak: 3 } },
    // Skill (10)
    { id: 'genius', emoji: '\uD83E\uDDE0', conditions: { iqScore: 130 } },
    { id: 'lightning', emoji: '\u26A1', conditions: { reactionMs: 200, comparison: 'less' } },
    { id: 'sharpshooter', emoji: '\uD83C\uDFAF', conditions: { aimAccuracy: 95 } },
    { id: 'typist', emoji: '\u2328\uFE0F', conditions: { typingWpm: 70 } },
    { id: 'math_genius', emoji: '\uD83D\uDD22', conditions: { mathCorrect: 30 } },
    { id: 'color_master', emoji: '\uD83C\uDFA8', conditions: { colorBrainGrade: 'S' } },
    { id: 'wordmaster', emoji: '\uD83D\uDCDD', conditions: { wordGuessIn2: true } },
    { id: 'world_traveler', emoji: '\uD83C\uDF0D', conditions: { flagQuizPerfect: true } },
    { id: 'snake_king', emoji: '\uD83D\uDC0D', conditions: { snakeScore: 50 } },
    { id: 'bomb_defuser', emoji: '\uD83D\uDCA3', conditions: { wordBombRounds: 20 } },
    // Master (5)
    { id: 'puzzle_master', emoji: '\uD83E\uDDE9', conditions: { totalLevels: 100 } },
    { id: 'on_fire', emoji: '\uD83D\uDD25', conditions: { streak: 20 } },
    { id: 'arcade_legend', emoji: '\uD83D\uDC51', conditions: { totalBadges: 15 } },
    { id: 'diamond', emoji: '\uD83D\uDC8E', conditions: { totalGamesPlayed: 100 } },
    { id: 'rank_one', emoji: '\uD83C\uDFC5', conditions: { isRankOne: true } },
  ];

  // ──────────────────────────────────────────
  //  Utility Helpers
  // ──────────────────────────────────────────

  function getLang() {
    if (typeof getGameLang === 'function') return getGameLang();
    var params = new URLSearchParams(window.location.search);
    return params.get('lang') || localStorage.getItem('puzzleArcadeLang') || 'ko';
  }

  function tr(key) {
    var lang = getLang();
    var dict = BADGE_I18N[lang] || BADGE_I18N.ko;
    return dict[key] || (BADGE_I18N.en[key]) || key;
  }

  function getGameName(gameId) {
    var lang = getLang();
    var names = GAME_NAMES[lang] || GAME_NAMES.en;
    return names[gameId] || gameId;
  }

  function isFirebaseConfigured() {
    return FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY_HERE';
  }

  // ──────────────────────────────────────────
  //  Local Storage Helpers
  // ──────────────────────────────────────────

  function loadLocal(key, fallback) {
    try {
      var raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveLocal(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      // Storage full or disabled - silently fail
    }
  }

  // ──────────────────────────────────────────
  //  Stats System (localStorage + optional Firestore sync)
  // ──────────────────────────────────────────

  function getStats() {
    return loadLocal('stats', {
      gamesPlayed: 0,
      uniqueGames: 0,
      uniqueGamesList: [],
      totalStars: 0,
      threeStarLevels: 0,
      loginStreak: 0,
      lastLoginDate: null,
      iqScore: 0,
      reactionMs: 9999,
      aimAccuracy: 0,
      typingWpm: 0,
      mathCorrect: 0,
      colorBrainGrade: '',
      wordGuessIn2: false,
      flagQuizPerfect: false,
      snakeScore: 0,
      wordBombRounds: 0,
      totalLevels: 0,
      streak: 0,
      totalBadges: 0,
      totalGamesPlayed: 0,
      isRankOne: false,
      totalScore: 0,
      recentGames: [],
    });
  }

  function saveStats(stats) {
    saveLocal('stats', stats);
    syncStatsToFirestore(stats);
  }

  function syncStatsToFirestore(stats) {
    if (!firebaseReady || !currentUser || !db) return;
    try {
      db.collection('users').doc(currentUser.uid).set({
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        stats: stats,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      // Silently fail
    }
  }

  function recordStat(statName, value) {
    var stats = getStats();
    if (typeof value === 'number') {
      // For "less is better" stats (like reaction time)
      if (statName === 'reactionMs') {
        stats[statName] = Math.min(stats[statName] || 9999, value);
      } else {
        stats[statName] = Math.max(stats[statName] || 0, value);
      }
    } else if (typeof value === 'boolean') {
      stats[statName] = stats[statName] || value;
    } else if (typeof value === 'string') {
      // For grades, keep the best (only 'S' is tracked)
      stats[statName] = value;
    }
    saveStats(stats);
    checkBadges();
  }

  // ──────────────────────────────────────────
  //  Login Streak Tracking
  // ──────────────────────────────────────────

  function updateLoginStreak() {
    var stats = getStats();
    var today = new Date().toISOString().slice(0, 10);
    if (stats.lastLoginDate === today) return; // Already counted today

    var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (stats.lastLoginDate === yesterday) {
      stats.loginStreak = (stats.loginStreak || 0) + 1;
    } else if (stats.lastLoginDate !== today) {
      stats.loginStreak = 1;
    }
    stats.lastLoginDate = today;
    saveStats(stats);
  }

  // ──────────────────────────────────────────
  //  Firebase Loading (Lazy)
  // ──────────────────────────────────────────

  function loadFirebase(callback) {
    if (firebaseReady) {
      callback(null);
      return;
    }
    if (!isFirebaseConfigured()) {
      callback(new Error('Firebase not configured'));
      return;
    }
    if (firebaseLoading) {
      firebaseLoadCallbacks.push(callback);
      return;
    }
    firebaseLoading = true;
    firebaseLoadCallbacks.push(callback);

    var scripts = [
      'https://www.gstatic.com/firebasejs/' + FIREBASE_SDK_VERSION + '/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/' + FIREBASE_SDK_VERSION + '/firebase-auth-compat.js',
      'https://www.gstatic.com/firebasejs/' + FIREBASE_SDK_VERSION + '/firebase-firestore-compat.js',
    ];

    var loaded = 0;
    function onLoad() {
      loaded++;
      if (loaded < scripts.length) return;
      initFirebase();
    }
    function onError() {
      firebaseLoading = false;
      var cbs = firebaseLoadCallbacks.splice(0);
      cbs.forEach(function (cb) { cb(new Error('Failed to load Firebase SDK')); });
    }

    scripts.forEach(function (src) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = onLoad;
      script.onerror = onError;
      document.head.appendChild(script);
    });
  }

  function initFirebase() {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      auth = firebase.auth();
      db = firebase.firestore();
      firebaseReady = true;

      // Listen for auth state changes
      auth.onAuthStateChanged(function (user) {
        if (user) {
          currentUser = {
            uid: user.uid,
            displayName: user.displayName || tr('guest'),
            photoURL: user.photoURL || '',
          };
          updateLoginStreak();
          syncStatsToFirestore(getStats());
        } else {
          currentUser = null;
        }
        updateLoginButton();
      });

      var cbs = firebaseLoadCallbacks.splice(0);
      cbs.forEach(function (cb) { cb(null); });
    } catch (e) {
      firebaseLoading = false;
      var cbs = firebaseLoadCallbacks.splice(0);
      cbs.forEach(function (cb) { cb(e); });
    }
  }

  // ──────────────────────────────────────────
  //  Authentication
  // ──────────────────────────────────────────

  function login(callback) {
    loadFirebase(function (err) {
      if (err) {
        if (callback) callback(err);
        return;
      }
      var provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .then(function (result) {
          if (callback) callback(null, result.user);
        })
        .catch(function (error) {
          if (callback) callback(error);
        });
    });
  }

  function logout() {
    if (auth) {
      auth.signOut();
    }
    currentUser = null;
    updateLoginButton();
  }

  function isLoggedIn() {
    return currentUser !== null;
  }

  // ──────────────────────────────────────────
  //  Ranking System
  // ──────────────────────────────────────────

  function submitScore(gameId, score, metadata) {
    if (!isLoggedIn()) return Promise.reject(new Error('Not logged in'));
    if (!firebaseReady || !db) return Promise.reject(new Error('Firebase not ready'));

    var docData = {
      userId: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL || '',
      score: score,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (metadata) docData.metadata = metadata;

    return db.collection('rankings').doc(gameId)
      .collection('scores').doc(currentUser.uid)
      .set(docData, { merge: true })
      .then(function () {
        // Check if user is rank 1
        return getLeaderboard(gameId, 1);
      })
      .then(function (top) {
        if (top.length > 0 && top[0].userId === currentUser.uid) {
          recordStat('isRankOne', true);
        }
      })
      .catch(function () {
        // Silently fail on rank check
      });
  }

  function getLeaderboard(gameId, limit) {
    if (!firebaseReady || !db) return Promise.resolve([]);
    limit = limit || 100;

    return db.collection('rankings').doc(gameId)
      .collection('scores')
      .orderBy('score', 'desc')
      .limit(limit)
      .get()
      .then(function (snapshot) {
        var results = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.id = doc.id;
          results.push(data);
        });
        return results;
      })
      .catch(function () {
        return [];
      });
  }

  function getUserRank(gameId) {
    if (!isLoggedIn() || !firebaseReady || !db) return Promise.resolve(null);

    return db.collection('rankings').doc(gameId)
      .collection('scores')
      .orderBy('score', 'desc')
      .get()
      .then(function (snapshot) {
        var rank = 0;
        var found = false;
        snapshot.forEach(function (doc) {
          rank++;
          if (doc.id === currentUser.uid) found = true;
          if (found && rank) return;
        });
        // Re-iterate to find the actual rank
        rank = 0;
        snapshot.forEach(function (doc) {
          rank++;
          if (doc.id === currentUser.uid) {
            found = true;
          }
        });
        // Find rank properly
        var entries = [];
        snapshot.forEach(function (doc) {
          entries.push(doc.id);
        });
        var idx = entries.indexOf(currentUser.uid);
        return idx >= 0 ? idx + 1 : null;
      })
      .catch(function () {
        return null;
      });
  }

  // ──────────────────────────────────────────
  //  Badge System
  // ──────────────────────────────────────────

  function getEarnedBadgeIds() {
    return loadLocal('earnedBadges', []);
  }

  function saveEarnedBadges(ids) {
    saveLocal('earnedBadges', ids);
  }

  function checkBadges() {
    var stats = getStats();
    var earned = getEarnedBadgeIds();
    var newBadges = [];

    BADGES.forEach(function (badge) {
      if (earned.indexOf(badge.id) !== -1) return; // Already earned

      var conds = badge.conditions;
      var met = true;

      Object.keys(conds).forEach(function (key) {
        if (key === 'comparison') return; // Skip comparison flag
        var target = conds[key];
        var actual = stats[key];

        if (typeof target === 'boolean') {
          if (!actual) met = false;
        } else if (typeof target === 'string') {
          if (actual !== target) met = false;
        } else if (typeof target === 'number') {
          if (conds.comparison === 'less') {
            if (!actual || actual > target) met = false;
          } else {
            if (!actual || actual < target) met = false;
          }
        }
      });

      if (met) {
        newBadges.push(badge);
        earned.push(badge.id);
      }
    });

    if (newBadges.length > 0) {
      saveEarnedBadges(earned);
      // Update totalBadges stat
      var stats2 = getStats();
      stats2.totalBadges = earned.length;
      saveStats(stats2);

      // Show toast for each new badge
      newBadges.forEach(function (badge, idx) {
        setTimeout(function () {
          showBadgeToast(badge);
        }, idx * 1500);
      });

      // Re-check in case totalBadges triggered arcade_legend
      if (earned.length >= 15 && earned.indexOf('arcade_legend') === -1) {
        var stats3 = getStats();
        stats3.totalBadges = earned.length;
        saveStats(stats3);
        // Manual check for arcade_legend
        earned.push('arcade_legend');
        saveEarnedBadges(earned);
        setTimeout(function () {
          var legendBadge = BADGES.find(function (b) { return b.id === 'arcade_legend'; });
          if (legendBadge) showBadgeToast(legendBadge);
        }, newBadges.length * 1500);
      }
    }

    return earned;
  }

  function getBadges() {
    var earned = getEarnedBadgeIds();
    return BADGES.map(function (badge) {
      return {
        id: badge.id,
        emoji: badge.emoji,
        name: tr('badge_' + badge.id),
        description: tr('desc_' + badge.id),
        earned: earned.indexOf(badge.id) !== -1,
        conditions: badge.conditions,
      };
    });
  }

  // ──────────────────────────────────────────
  //  Game Recording (Integration API)
  // ──────────────────────────────────────────

  function recordGame(gameId, data) {
    data = data || {};
    var stats = getStats();

    // Increment total games played
    stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
    stats.totalGamesPlayed = (stats.totalGamesPlayed || 0) + 1;

    // Track unique games
    if (!stats.uniqueGamesList) stats.uniqueGamesList = [];
    if (stats.uniqueGamesList.indexOf(gameId) === -1) {
      stats.uniqueGamesList.push(gameId);
    }
    stats.uniqueGames = stats.uniqueGamesList.length;

    // Track total score
    if (data.score !== undefined) {
      stats.totalScore = (stats.totalScore || 0) + data.score;
    }

    // Track stars
    if (data.stars !== undefined) {
      stats.totalStars = (stats.totalStars || 0) + data.stars;
      if (data.stars >= 3) {
        stats.threeStarLevels = (stats.threeStarLevels || 0) + 1;
      }
    }

    // Track levels
    if (data.levelCleared) {
      stats.totalLevels = (stats.totalLevels || 0) + 1;
    }

    // Track streak
    if (data.correct !== undefined && data.streak !== undefined) {
      stats.streak = Math.max(stats.streak || 0, data.streak);
    }

    // Game-specific stats
    if (gameId === 'iq-test' && data.iqScore !== undefined) {
      stats.iqScore = Math.max(stats.iqScore || 0, data.iqScore);
    }
    if (gameId === 'reaction-test' && data.avgMs !== undefined) {
      stats.reactionMs = Math.min(stats.reactionMs || 9999, data.avgMs);
    }
    if (gameId === 'aim-trainer' && data.accuracy !== undefined) {
      stats.aimAccuracy = Math.max(stats.aimAccuracy || 0, data.accuracy);
    }
    if (gameId === 'typing-speed' && data.wpm !== undefined) {
      stats.typingWpm = Math.max(stats.typingWpm || 0, data.wpm);
    }
    if (gameId === 'math-quiz' && data.correct !== undefined) {
      stats.mathCorrect = Math.max(stats.mathCorrect || 0, data.correct);
    }
    if (gameId === 'color-brain' && data.grade !== undefined) {
      if (data.grade === 'S') stats.colorBrainGrade = 'S';
    }
    if (gameId === 'word-guess' && data.guesses !== undefined && data.won) {
      if (data.guesses <= 2) stats.wordGuessIn2 = true;
    }
    if (gameId === 'flag-quiz' && data.correct !== undefined && data.total !== undefined) {
      if (data.correct === data.total) stats.flagQuizPerfect = true;
    }
    if (gameId === 'snake' && data.score !== undefined) {
      stats.snakeScore = Math.max(stats.snakeScore || 0, data.score);
    }
    if (gameId === 'word-bomb' && data.rounds !== undefined) {
      stats.wordBombRounds = Math.max(stats.wordBombRounds || 0, data.rounds);
    }

    // Recent games log
    if (!stats.recentGames) stats.recentGames = [];
    stats.recentGames.unshift({
      gameId: gameId,
      score: data.score || 0,
      timestamp: Date.now(),
    });
    if (stats.recentGames.length > 20) stats.recentGames = stats.recentGames.slice(0, 20);

    saveStats(stats);

    // Submit to leaderboard if logged in and has a score
    if (data.score !== undefined && isLoggedIn()) {
      submitScore(gameId, data.score, data).catch(function () {});
    }

    // Check badges
    checkBadges();
  }

  // ──────────────────────────────────────────
  //  CSS Injection
  // ──────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('puzzle-user-styles')) return;
    var style = document.createElement('style');
    style.id = 'puzzle-user-styles';
    style.textContent = '\n\
/* ── Login Button ── */\n\
.pu-login-btn{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:12px;border:1px solid rgba(168,85,247,.3);background:rgba(168,85,247,.1);color:#e0e0e0;font-family:"Outfit",sans-serif;font-size:.88rem;font-weight:600;cursor:pointer;transition:all .25s ease;position:relative;white-space:nowrap}\n\
.pu-login-btn:hover{background:rgba(168,85,247,.2);border-color:rgba(168,85,247,.5);transform:translateY(-1px)}\n\
.pu-login-btn img{width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid rgba(168,85,247,.4)}\n\
.pu-login-btn .pu-name{max-width:100px;overflow:hidden;text-overflow:ellipsis}\n\
\n\
/* ── Dropdown ── */\n\
.pu-dropdown{position:absolute;top:calc(100% + 8px);right:0;min-width:180px;background:#111128;border:1px solid rgba(168,85,247,.25);border-radius:14px;padding:6px;box-shadow:0 16px 48px rgba(0,0,0,.6);opacity:0;transform:translateY(-8px) scale(.96);pointer-events:none;transition:all .2s ease;z-index:100001;font-family:"Outfit",sans-serif}\n\
.pu-dropdown.pu-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}\n\
.pu-dropdown-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;color:#ccc;font-size:.88rem;font-weight:500;cursor:pointer;transition:all .15s;border:none;background:none;width:100%;text-align:left;font-family:inherit}\n\
.pu-dropdown-item:hover{background:rgba(168,85,247,.12);color:#fff}\n\
.pu-dropdown-item .pu-icon{font-size:1.1rem;width:22px;text-align:center}\n\
.pu-dropdown-divider{height:1px;background:rgba(255,255,255,.06);margin:4px 8px}\n\
\n\
/* ── Overlay / Modal ── */\n\
.pu-overlay{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.7);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s ease;padding:16px}\n\
.pu-overlay.pu-visible{opacity:1}\n\
.pu-modal{background:linear-gradient(145deg,#111128,#0e0e24);border:1px solid rgba(168,85,247,.2);border-radius:20px;padding:28px 24px;max-width:520px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.6),0 0 40px rgba(168,85,247,.1);position:relative;transform:translateY(20px) scale(.96);transition:transform .35s cubic-bezier(.22,1,.36,1);font-family:"Outfit",sans-serif;color:#fff}\n\
.pu-overlay.pu-visible .pu-modal{transform:translateY(0) scale(1)}\n\
.pu-modal::-webkit-scrollbar{width:6px}\n\
.pu-modal::-webkit-scrollbar-track{background:transparent}\n\
.pu-modal::-webkit-scrollbar-thumb{background:rgba(168,85,247,.3);border-radius:3px}\n\
.pu-modal-close{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#999;font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;line-height:1}\n\
.pu-modal-close:hover{background:rgba(255,255,255,.12);color:#fff}\n\
.pu-modal-title{font-size:1.25rem;font-weight:700;margin-bottom:20px;text-align:center;background:linear-gradient(135deg,#667eea,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}\n\
\n\
/* ── Tabs ── */\n\
.pu-tabs{display:flex;gap:4px;margin-bottom:16px;overflow-x:auto;padding-bottom:4px;-ms-overflow-style:none;scrollbar-width:none}\n\
.pu-tabs::-webkit-scrollbar{display:none}\n\
.pu-tab{padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);color:#888;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:"Outfit",sans-serif;flex-shrink:0}\n\
.pu-tab:hover{color:#bbb;background:rgba(255,255,255,.06)}\n\
.pu-tab.pu-active{background:rgba(168,85,247,.15);border-color:rgba(168,85,247,.3);color:#c084fc}\n\
\n\
/* ── Rankings Table ── */\n\
.pu-table{width:100%;border-collapse:collapse}\n\
.pu-table th{font-size:.75rem;font-weight:600;color:#666;text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-transform:uppercase;letter-spacing:.5px}\n\
.pu-table td{padding:10px;border-bottom:1px solid rgba(255,255,255,.03);font-size:.88rem;color:#ccc}\n\
.pu-table tr:hover td{background:rgba(168,85,247,.04)}\n\
.pu-table .pu-rank{font-weight:700;color:#a855f7;width:36px;text-align:center}\n\
.pu-table .pu-rank-1{color:#f9d423}\n\
.pu-table .pu-rank-2{color:#c0c0c0}\n\
.pu-table .pu-rank-3{color:#cd7f32}\n\
.pu-table .pu-player{display:flex;align-items:center;gap:10px}\n\
.pu-table .pu-avatar{width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.08)}\n\
.pu-table .pu-score{font-weight:700;color:#e0e0e0;text-align:right}\n\
.pu-table .pu-highlight td{background:rgba(168,85,247,.08);border-radius:8px}\n\
.pu-no-data{text-align:center;color:#666;padding:32px 0;font-size:.9rem}\n\
.pu-your-rank{margin-top:12px;padding:12px;border-radius:12px;background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);text-align:center;font-size:.9rem;color:#c084fc;font-weight:600}\n\
\n\
/* ── Badge Grid ── */\n\
.pu-badge-progress{margin-bottom:20px;text-align:center}\n\
.pu-badge-progress-text{font-size:.85rem;color:#999;margin-bottom:8px;font-weight:500}\n\
.pu-badge-bar{height:8px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden}\n\
.pu-badge-bar-fill{height:100%;background:linear-gradient(90deg,#667eea,#a855f7,#ec4899);border-radius:4px;transition:width .6s cubic-bezier(.22,1,.36,1)}\n\
.pu-badge-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}\n\
.pu-badge-card{padding:16px 10px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);text-align:center;transition:all .2s}\n\
.pu-badge-card:hover{transform:translateY(-2px);border-color:rgba(168,85,247,.2)}\n\
.pu-badge-card.pu-earned{border-color:rgba(168,85,247,.3);background:rgba(168,85,247,.06)}\n\
.pu-badge-card.pu-locked{opacity:.5;filter:grayscale(.8)}\n\
.pu-badge-emoji{font-size:2rem;margin-bottom:6px;display:block}\n\
.pu-badge-name{font-size:.78rem;font-weight:600;color:#e0e0e0;margin-bottom:4px}\n\
.pu-badge-desc{font-size:.68rem;color:#888;line-height:1.3}\n\
.pu-badge-card.pu-locked .pu-badge-name{color:#666}\n\
.pu-badge-card.pu-locked .pu-badge-desc{color:#555}\n\
.pu-badge-card.pu-locked .pu-badge-emoji{filter:grayscale(1);opacity:.4}\n\
\n\
/* ── Profile ── */\n\
.pu-profile-header{display:flex;align-items:center;gap:16px;margin-bottom:20px}\n\
.pu-profile-photo{width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid rgba(168,85,247,.4);flex-shrink:0}\n\
.pu-profile-photo-placeholder{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#667eea,#a855f7);display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:#fff;flex-shrink:0}\n\
.pu-profile-info h3{margin:0 0 4px;font-size:1.1rem;font-weight:700;color:#fff}\n\
.pu-profile-info p{margin:0;font-size:.82rem;color:#888}\n\
.pu-profile-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}\n\
.pu-stat-card{padding:14px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);text-align:center}\n\
.pu-stat-value{font-size:1.4rem;font-weight:800;background:linear-gradient(135deg,#667eea,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}\n\
.pu-stat-label{font-size:.72rem;color:#888;margin-top:2px;font-weight:500;text-transform:uppercase;letter-spacing:.5px}\n\
.pu-section-title{font-size:.85rem;font-weight:700;color:#999;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px}\n\
.pu-badge-showcase{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px}\n\
.pu-badge-mini{width:36px;height:36px;border-radius:10px;background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.2);display:flex;align-items:center;justify-content:center;font-size:1.1rem;cursor:default;transition:transform .15s}\n\
.pu-badge-mini:hover{transform:scale(1.15)}\n\
.pu-activity-list{list-style:none;padding:0;margin:0}\n\
.pu-activity-item{padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04);display:flex;justify-content:space-between;align-items:center;font-size:.84rem}\n\
.pu-activity-item:last-child{border-bottom:none}\n\
.pu-activity-game{color:#ccc;font-weight:600}\n\
.pu-activity-score{color:#a855f7;font-weight:700}\n\
.pu-activity-time{color:#666;font-size:.72rem}\n\
\n\
/* ── Toast ── */\n\
.pu-toast{position:fixed;top:-80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#111128,#1a1040);border:1px solid rgba(168,85,247,.3);color:#fff;padding:14px 24px;border-radius:14px;font-family:"Outfit",sans-serif;font-size:.92rem;font-weight:600;transition:top .5s cubic-bezier(.22,1,.36,1);z-index:100002;pointer-events:none;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,.5),0 0 20px rgba(168,85,247,.15);max-width:90vw}\n\
.pu-toast.pu-show{top:20px}\n\
.pu-toast-emoji{font-size:1.5rem}\n\
.pu-toast-text{display:flex;flex-direction:column;gap:2px}\n\
.pu-toast-label{font-size:.7rem;color:#a855f7;text-transform:uppercase;letter-spacing:.5px}\n\
.pu-toast-name{font-size:.95rem;color:#fff}\n\
\n\
/* ── Google Login Button ── */\n\
.pu-google-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px 0;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#fff;font-family:"Outfit",sans-serif;font-size:.95rem;font-weight:600;cursor:pointer;transition:all .2s}\n\
.pu-google-btn:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);transform:translateY(-1px)}\n\
.pu-google-btn svg{width:20px;height:20px}\n\
.pu-login-prompt{text-align:center;padding:24px 0}\n\
.pu-login-prompt p{color:#888;font-size:.88rem;margin-bottom:16px}\n\
\n\
/* ── Responsive ── */\n\
@media(max-width:480px){\n\
  .pu-modal{padding:20px 16px;border-radius:16px;max-height:90vh}\n\
  .pu-badge-grid{grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px}\n\
  .pu-badge-card{padding:12px 8px}\n\
  .pu-badge-emoji{font-size:1.6rem}\n\
  .pu-badge-name{font-size:.72rem}\n\
  .pu-profile-header{flex-direction:column;text-align:center}\n\
  .pu-table td,.pu-table th{padding:8px 6px;font-size:.8rem}\n\
  .pu-login-btn .pu-name{max-width:70px}\n\
}\n\
';
    document.head.appendChild(style);
  }

  // ──────────────────────────────────────────
  //  Toast Notification
  // ──────────────────────────────────────────

  function showBadgeToast(badge) {
    var existing = document.querySelector('.pu-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'pu-toast';
    toast.innerHTML =
      '<span class="pu-toast-emoji">' + badge.emoji + '</span>' +
      '<span class="pu-toast-text">' +
        '<span class="pu-toast-label">' + tr('badgeEarned') + '</span>' +
        '<span class="pu-toast-name">' + tr('badge_' + badge.id) + '</span>' +
      '</span>';
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('pu-show');
      });
    });

    setTimeout(function () {
      toast.classList.remove('pu-show');
      setTimeout(function () { toast.remove(); }, 500);
    }, 3500);
  }

  // ──────────────────────────────────────────
  //  UI: Login Button
  // ──────────────────────────────────────────

  var loginButtonEl = null;
  var dropdownEl = null;
  var dropdownOpen = false;

  function createLoginButton() {
    injectStyles();

    if (loginButtonEl) return loginButtonEl;

    loginButtonEl = document.createElement('button');
    loginButtonEl.className = 'pu-login-btn';
    loginButtonEl.type = 'button';

    // Dropdown
    dropdownEl = document.createElement('div');
    dropdownEl.className = 'pu-dropdown';
    loginButtonEl.appendChild(dropdownEl);

    loginButtonEl.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!isLoggedIn()) {
        login();
        return;
      }
      dropdownOpen = !dropdownOpen;
      dropdownEl.classList.toggle('pu-open', dropdownOpen);
    });

    // Close dropdown when clicking elsewhere
    document.addEventListener('click', function () {
      dropdownOpen = false;
      if (dropdownEl) dropdownEl.classList.remove('pu-open');
    });

    updateLoginButton();
    return loginButtonEl;
  }

  function updateLoginButton() {
    if (!loginButtonEl) return;

    if (isLoggedIn()) {
      var photoHtml = currentUser.photoURL
        ? '<img src="' + escHtml(currentUser.photoURL) + '" alt="" />'
        : '<span style="font-size:1.1rem">\uD83D\uDC64</span>';
      loginButtonEl.innerHTML =
        photoHtml +
        '<span class="pu-name">' + escHtml(currentUser.displayName) + '</span>';

      // Rebuild dropdown
      dropdownEl = document.createElement('div');
      dropdownEl.className = 'pu-dropdown';
      dropdownEl.innerHTML =
        '<button class="pu-dropdown-item" data-action="profile"><span class="pu-icon">\uD83D\uDC64</span>' + tr('profile') + '</button>' +
        '<button class="pu-dropdown-item" data-action="rankings"><span class="pu-icon">\uD83C\uDFC6</span>' + tr('rankings') + '</button>' +
        '<button class="pu-dropdown-item" data-action="badges"><span class="pu-icon">\uD83C\uDFC5</span>' + tr('badges') + '</button>' +
        '<div class="pu-dropdown-divider"></div>' +
        '<button class="pu-dropdown-item" data-action="logout"><span class="pu-icon">\uD83D\uDEAA</span>' + tr('logout') + '</button>';

      loginButtonEl.appendChild(dropdownEl);

      // Dropdown item events
      dropdownEl.querySelectorAll('.pu-dropdown-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
          e.stopPropagation();
          dropdownOpen = false;
          dropdownEl.classList.remove('pu-open');
          var action = item.getAttribute('data-action');
          if (action === 'profile') showProfile();
          else if (action === 'rankings') showRankings();
          else if (action === 'badges') showBadges();
          else if (action === 'logout') logout();
        });
      });
    } else {
      loginButtonEl.innerHTML = '<span style="font-size:1rem">\uD83D\uDC64</span>' + tr('login');
      // Remove old dropdown
      var oldDd = loginButtonEl.querySelector('.pu-dropdown');
      if (oldDd) oldDd.remove();
      dropdownEl = document.createElement('div');
      dropdownEl.className = 'pu-dropdown';
      loginButtonEl.appendChild(dropdownEl);
    }
  }

  function escHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ''));
    return div.innerHTML;
  }

  // ──────────────────────────────────────────
  //  UI: Modal Framework
  // ──────────────────────────────────────────

  function createModal(title, contentHtml) {
    injectStyles();

    var overlay = document.createElement('div');
    overlay.className = 'pu-overlay';
    overlay.innerHTML =
      '<div class="pu-modal">' +
        '<button class="pu-modal-close" aria-label="' + tr('close') + '">&times;</button>' +
        '<div class="pu-modal-title">' + escHtml(title) + '</div>' +
        '<div class="pu-modal-body">' + contentHtml + '</div>' +
      '</div>';

    var closeModal = function () {
      overlay.classList.remove('pu-visible');
      setTimeout(function () { overlay.remove(); }, 300);
    };

    overlay.querySelector('.pu-modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      overlay.classList.add('pu-visible');
    });

    return { overlay: overlay, close: closeModal };
  }

  // ──────────────────────────────────────────
  //  UI: Rankings Modal
  // ──────────────────────────────────────────

  var RANKED_GAMES = [
    'snake', 'iq-test', 'reaction-test', 'typing-speed', 'math-quiz',
    'color-brain', 'word-guess', 'flag-quiz', 'word-bomb', 'aim-trainer',
    '2048', 'memory-card', 'minesweeper', 'flappy', 'whack-mole',
  ];

  function showRankings(initialGameId) {
    var activeGame = initialGameId || RANKED_GAMES[0];

    // Build tabs
    var tabsHtml = '<div class="pu-tabs">';
    RANKED_GAMES.forEach(function (gid) {
      var cls = gid === activeGame ? 'pu-tab pu-active' : 'pu-tab';
      tabsHtml += '<button class="' + cls + '" data-game="' + gid + '">' + escHtml(getGameName(gid)) + '</button>';
    });
    tabsHtml += '</div>';

    var contentHtml = tabsHtml + '<div class="pu-rankings-body"><div class="pu-no-data">' + tr('noScores') + '</div></div>';

    var modal = createModal(tr('rankings'), contentHtml);
    var body = modal.overlay.querySelector('.pu-rankings-body');

    // Tab switching
    modal.overlay.querySelectorAll('.pu-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        modal.overlay.querySelectorAll('.pu-tab').forEach(function (t) { t.classList.remove('pu-active'); });
        tab.classList.add('pu-active');
        activeGame = tab.getAttribute('data-game');
        loadRankingsForGame(body, activeGame);
      });
    });

    // Load initial game
    loadRankingsForGame(body, activeGame);
  }

  function loadRankingsForGame(container, gameId) {
    container.innerHTML = '<div class="pu-no-data" style="color:#666">...</div>';

    if (!firebaseReady || !db) {
      // Show local-only message
      container.innerHTML = '<div class="pu-no-data">' + tr('loginRequired') + '</div>';
      if (!isLoggedIn()) {
        container.innerHTML += renderLoginPrompt();
        var googleBtn = container.querySelector('.pu-google-btn');
        if (googleBtn) {
          googleBtn.addEventListener('click', function () {
            login(function (err) {
              if (!err) loadRankingsForGame(container, gameId);
            });
          });
        }
      }
      return;
    }

    getLeaderboard(gameId, 20).then(function (scores) {
      if (scores.length === 0) {
        container.innerHTML = '<div class="pu-no-data">' + tr('noScores') + '</div>';
        return;
      }

      var html = '<table class="pu-table"><thead><tr>';
      html += '<th>' + tr('rank') + '</th>';
      html += '<th>' + tr('player') + '</th>';
      html += '<th style="text-align:right">' + tr('scoreLabel') + '</th>';
      html += '</tr></thead><tbody>';

      scores.forEach(function (entry, idx) {
        var rankNum = idx + 1;
        var rankClass = 'pu-rank';
        if (rankNum === 1) rankClass += ' pu-rank-1';
        else if (rankNum === 2) rankClass += ' pu-rank-2';
        else if (rankNum === 3) rankClass += ' pu-rank-3';

        var isMe = currentUser && entry.userId === currentUser.uid;
        var rowClass = isMe ? 'pu-highlight' : '';
        var medalEmoji = rankNum === 1 ? '\uD83E\uDD47' : rankNum === 2 ? '\uD83E\uDD48' : rankNum === 3 ? '\uD83E\uDD49' : '';

        var avatarHtml = entry.photoURL
          ? '<img class="pu-avatar" src="' + escHtml(entry.photoURL) + '" alt="" />'
          : '<div class="pu-avatar" style="background:linear-gradient(135deg,#667eea,#a855f7);display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#fff">\uD83D\uDC64</div>';

        html += '<tr class="' + rowClass + '">';
        html += '<td class="' + rankClass + '">' + medalEmoji + (medalEmoji ? '' : rankNum) + '</td>';
        html += '<td><span class="pu-player">' + avatarHtml + escHtml(entry.displayName || tr('guest')) + '</span></td>';
        html += '<td class="pu-score">' + (entry.score || 0).toLocaleString() + '</td>';
        html += '</tr>';
      });

      html += '</tbody></table>';

      // Show user's rank if logged in
      if (isLoggedIn()) {
        getUserRank(gameId).then(function (rank) {
          if (rank !== null) {
            var rankEl = document.createElement('div');
            rankEl.className = 'pu-your-rank';
            rankEl.textContent = tr('yourRank') + ': #' + rank;
            container.appendChild(rankEl);
          }
        });
      }

      container.innerHTML = html;
    });
  }

  function renderLoginPrompt() {
    return '<div class="pu-login-prompt">' +
      '<p>' + tr('loginRequired') + '</p>' +
      '<button class="pu-google-btn">' +
        '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>' +
        tr('loginWith') +
      '</button>' +
    '</div>';
  }

  // ──────────────────────────────────────────
  //  UI: Badges Modal
  // ──────────────────────────────────────────

  function showBadges() {
    var allBadges = getBadges();
    var earnedCount = allBadges.filter(function (b) { return b.earned; }).length;
    var totalCount = allBadges.length;
    var pct = Math.round((earnedCount / totalCount) * 100);

    var html = '';
    // Progress bar
    html += '<div class="pu-badge-progress">';
    html += '<div class="pu-badge-progress-text">' + tr('badgeProgress') + ': ' + earnedCount + ' / ' + totalCount + '</div>';
    html += '<div class="pu-badge-bar"><div class="pu-badge-bar-fill" style="width:' + pct + '%"></div></div>';
    html += '</div>';

    // Badge grid
    html += '<div class="pu-badge-grid">';
    allBadges.forEach(function (badge) {
      var cls = 'pu-badge-card ' + (badge.earned ? 'pu-earned' : 'pu-locked');
      html += '<div class="' + cls + '">';
      html += '<span class="pu-badge-emoji">' + badge.emoji + '</span>';
      html += '<div class="pu-badge-name">' + (badge.earned ? escHtml(badge.name) : tr('locked')) + '</div>';
      html += '<div class="pu-badge-desc">' + escHtml(badge.description) + '</div>';
      html += '</div>';
    });
    html += '</div>';

    createModal(tr('badges'), html);
  }

  // ──────────────────────────────────────────
  //  UI: Profile Panel
  // ──────────────────────────────────────────

  function showProfile() {
    var stats = getStats();
    var allBadges = getBadges();
    var earnedBadges = allBadges.filter(function (b) { return b.earned; });

    var html = '';

    // Header
    html += '<div class="pu-profile-header">';
    if (isLoggedIn() && currentUser.photoURL) {
      html += '<img class="pu-profile-photo" src="' + escHtml(currentUser.photoURL) + '" alt="" />';
    } else {
      html += '<div class="pu-profile-photo-placeholder">\uD83D\uDC64</div>';
    }
    html += '<div class="pu-profile-info">';
    html += '<h3>' + escHtml(isLoggedIn() ? currentUser.displayName : tr('guest')) + '</h3>';
    html += '<p>' + (isLoggedIn() ? '' : tr('loginRequired')) + '</p>';
    html += '</div></div>';

    // Stats cards
    html += '<div class="pu-profile-stats">';
    html += '<div class="pu-stat-card"><div class="pu-stat-value">' + (stats.totalGamesPlayed || 0) + '</div><div class="pu-stat-label">' + tr('totalGames') + '</div></div>';
    html += '<div class="pu-stat-card"><div class="pu-stat-value">' + (stats.totalScore || 0).toLocaleString() + '</div><div class="pu-stat-label">' + tr('totalScore') + '</div></div>';
    html += '</div>';

    // Badge showcase
    html += '<div class="pu-section-title">' + tr('badges') + ' (' + earnedBadges.length + '/' + allBadges.length + ')</div>';
    html += '<div class="pu-badge-showcase">';
    if (earnedBadges.length > 0) {
      earnedBadges.forEach(function (b) {
        html += '<div class="pu-badge-mini" title="' + escHtml(b.name) + '">' + b.emoji + '</div>';
      });
    } else {
      html += '<div style="color:#666;font-size:.82rem;padding:8px 0">' + tr('noActivity') + '</div>';
    }
    html += '</div>';

    // Recent activity
    html += '<div class="pu-section-title">' + tr('recentActivity') + '</div>';
    html += '<ul class="pu-activity-list">';
    if (stats.recentGames && stats.recentGames.length > 0) {
      stats.recentGames.slice(0, 10).forEach(function (game) {
        var ago = timeAgo(game.timestamp);
        html += '<li class="pu-activity-item">';
        html += '<span class="pu-activity-game">' + escHtml(getGameName(game.gameId)) + '</span>';
        html += '<span class="pu-activity-score">' + (game.score || 0).toLocaleString() + '</span>';
        html += '<span class="pu-activity-time">' + ago + '</span>';
        html += '</li>';
      });
    } else {
      html += '<li class="pu-activity-item" style="justify-content:center;color:#666">' + tr('noActivity') + '</li>';
    }
    html += '</ul>';

    // Login prompt if not logged in
    if (!isLoggedIn()) {
      html += renderLoginPrompt();
    }

    var modal = createModal(tr('profile'), html);

    // Attach login handler if present
    var googleBtn = modal.overlay.querySelector('.pu-google-btn');
    if (googleBtn) {
      googleBtn.addEventListener('click', function () {
        login(function (err) {
          if (!err) {
            modal.close();
            showProfile();
          }
        });
      });
    }
  }

  function timeAgo(timestamp) {
    var now = Date.now();
    var diff = now - timestamp;
    var mins = Math.floor(diff / 60000);
    var hours = Math.floor(diff / 3600000);
    var days = Math.floor(diff / 86400000);

    var lang = getLang();
    if (lang === 'ko') {
      if (mins < 1) return '방금 전';
      if (mins < 60) return mins + '분 전';
      if (hours < 24) return hours + '시간 전';
      return days + '일 전';
    }
    if (lang === 'ja') {
      if (mins < 1) return 'たった今';
      if (mins < 60) return mins + '分前';
      if (hours < 24) return hours + '時間前';
      return days + '日前';
    }
    if (lang === 'zh') {
      if (mins < 1) return '刚刚';
      if (mins < 60) return mins + '分钟前';
      if (hours < 24) return hours + '小时前';
      return days + '天前';
    }
    if (lang === 'es') {
      if (mins < 1) return 'ahora';
      if (mins < 60) return 'hace ' + mins + 'min';
      if (hours < 24) return 'hace ' + hours + 'h';
      return 'hace ' + days + 'd';
    }
    // en default
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    if (hours < 24) return hours + 'h ago';
    return days + 'd ago';
  }

  // ──────────────────────────────────────────
  //  Initialization
  // ──────────────────────────────────────────

  function init() {
    injectStyles();
    updateLoginStreak();

    // If Firebase is configured, try to initialize lazily to restore auth state
    if (isFirebaseConfigured()) {
      loadFirebase(function () {
        // Auth state listener handles the rest
      });
    }
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ──────────────────────────────────────────
  //  Public API
  // ──────────────────────────────────────────

  window.PuzzleUser = {
    // Auth
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getUser: function () { return currentUser; },

    // Stats & Badges
    recordGame: recordGame,
    recordStat: recordStat,
    getStats: getStats,
    checkBadges: checkBadges,
    getBadges: getBadges,

    // Rankings
    submitScore: submitScore,
    getLeaderboard: getLeaderboard,
    getUserRank: getUserRank,

    // UI
    createLoginButton: createLoginButton,
    showRankings: showRankings,
    showBadges: showBadges,
    showProfile: showProfile,
  };

})();
