// ===== Puzzle Arcade - Recommendation & Retention System =====
// Maximizes user engagement and page views through smart recommendations,
// end-screen prompts, and return-user engagement features.
// Usage: PuzzleRecommend.showWidget()        - manual widget inject
//        PuzzleRecommend.showEndScreen(opts)  - show end-game bar
//        PuzzleRecommend.getRecommendations() - get recommended games

(function () {
  'use strict';

  // ── Storage Keys ──
  var STORAGE_PREFIX = 'puzzleArcade_';
  var PLAYED_KEY = STORAGE_PREFIX + 'playedGames';
  var STREAK_KEY = STORAGE_PREFIX + 'streak';
  var LAST_VISIT_KEY = STORAGE_PREFIX + 'lastVisit';
  var PLAY_COUNT_KEY = STORAGE_PREFIX + 'playCounts';

  // ── Game Registry (37 games) ──
  var GAMES = [
    { id: 'arrow-puzzle', emoji: '\u{1F3F9}', cat: ['logic','action'], file: 'arrow-puzzle.html' },
    { id: 'parking-jam', emoji: '\u{1F697}', cat: ['logic'], file: 'parking-jam.html' },
    { id: 'water-sort', emoji: '\u{1F9EA}', cat: ['sort','logic'], file: 'water-sort.html' },
    { id: '2048', emoji: '2048', cat: ['number','action'], file: '2048.html' },
    { id: 'one-line', emoji: '\u270F\uFE0F', cat: ['logic'], file: 'one-line.html' },
    { id: 'lights-out', emoji: '\u{1F4A1}', cat: ['logic'], file: 'lights-out.html' },
    { id: 'color-match', emoji: '\u{1F52E}', cat: ['sort','action'], file: 'color-match.html' },
    { id: 'merge', emoji: '\u{1F522}', cat: ['number','action'], file: 'merge.html' },
    { id: 'iq-test', emoji: '\u{1F9E0}', cat: ['quiz','logic'], file: 'iq-test.html' },
    { id: 'reaction-test', emoji: '\u26A1', cat: ['speed','action'], file: 'reaction-test.html' },
    { id: 'memory-card', emoji: '\u{1F0CF}', cat: ['logic'], file: 'memory-card.html' },
    { id: 'math-quiz', emoji: '\u{1F522}', cat: ['quiz','number','speed'], file: 'math-quiz.html' },
    { id: 'color-brain', emoji: '\u{1F3A8}', cat: ['quiz','logic'], file: 'color-brain.html' },
    { id: 'sequence-memory', emoji: '\u{1F534}', cat: ['logic'], file: 'sequence-memory.html' },
    { id: 'typing-speed', emoji: '\u2328\uFE0F', cat: ['speed','action'], file: 'typing-speed.html' },
    { id: 'word-bomb', emoji: '\u{1F4A3}', cat: ['quiz','speed'], file: 'word-bomb.html' },
    { id: 'flag-quiz', emoji: '\u{1F3F3}\uFE0F', cat: ['quiz'], file: 'flag-quiz.html' },
    { id: 'spot-diff', emoji: '\u{1F50D}', cat: ['logic'], file: 'spot-diff.html' },
    { id: 'number-chain', emoji: '\u{1F517}', cat: ['number','logic'], file: 'number-chain.html' },
    { id: 'emoji-puzzle', emoji: '\u{1F914}', cat: ['quiz'], file: 'emoji-puzzle.html' },
    { id: 'tile-match', emoji: '\u{1F004}', cat: ['logic'], file: 'tile-match.html' },
    { id: 'aim-trainer', emoji: '\u{1F3AF}', cat: ['speed','action'], file: 'aim-trainer.html' },
    { id: 'snake', emoji: '\u{1F40D}', cat: ['action'], file: 'snake.html' },
    { id: 'block-stack', emoji: '\u{1F9F1}', cat: ['action'], file: 'block-stack.html' },
    { id: 'whack-mole', emoji: '\u{1F439}', cat: ['action','speed'], file: 'whack-mole.html' },
    { id: 'maze', emoji: '\u{1F300}', cat: ['logic'], file: 'maze.html' },
    { id: 'rps-battle', emoji: '\u270A', cat: ['action','quiz'], file: 'rps-battle.html' },
    { id: 'flappy', emoji: '\u{1F680}', cat: ['action'], file: 'flappy.html' },
    { id: 'bubble-pop', emoji: '\u{1FAE7}', cat: ['action','sort'], file: 'bubble-pop.html' },
    { id: 'color-fill', emoji: '\u{1F3A8}', cat: ['logic','sort'], file: 'color-fill.html' },
    { id: 'sliding-puzzle', emoji: '\u{1F522}', cat: ['logic'], file: 'sliding-puzzle.html' },
    { id: 'connect4', emoji: '\u{1F534}', cat: ['logic'], file: 'connect4.html' },
    { id: 'word-guess', emoji: '\u{1F4DD}', cat: ['quiz'], file: 'word-guess.html' },
    { id: 'trivia', emoji: '\u2753', cat: ['quiz'], file: 'trivia.html' },
    { id: 'minesweeper', emoji: '\u{1F4A3}', cat: ['logic'], file: 'minesweeper.html' },
    { id: 'number-find', emoji: '\u{1F522}', cat: ['speed','quiz'], file: 'number-find.html' },
    { id: 'pattern-lock', emoji: '\u{1F510}', cat: ['logic'], file: 'pattern-lock.html' },
  ];

  // ── Game Names i18n (37 games x 5 languages) ──
  var GAME_NAMES = {
    ko: {
      'arrow-puzzle': '화살표 퍼즐', 'parking-jam': '주차장 탈출', 'water-sort': '물 정렬',
      '2048': '2048', 'one-line': '한붓그리기', 'lights-out': '라이트 아웃',
      'color-match': '컬러 매치', 'merge': '숫자 합치기', 'iq-test': 'IQ 테스트',
      'reaction-test': '반응속도 테스트', 'memory-card': '메모리 카드', 'math-quiz': '수학 퀴즈',
      'color-brain': '컬러 브레인', 'sequence-memory': '순서 기억', 'typing-speed': '타이핑 속도',
      'word-bomb': '단어 폭탄', 'flag-quiz': '국기 퀴즈', 'spot-diff': '다른 그림 찾기',
      'number-chain': '숫자 체인', 'emoji-puzzle': '이모지 퍼즐', 'tile-match': '타일 매치',
      'aim-trainer': '에임 트레이너', 'snake': '스네이크', 'block-stack': '블록 쌓기',
      'whack-mole': '두더지 잡기', 'maze': '미로 찾기', 'rps-battle': '가위바위보',
      'flappy': '플래피 로켓', 'bubble-pop': '버블 팝', 'color-fill': '컬러 채우기',
      'sliding-puzzle': '슬라이딩 퍼즐', 'connect4': '사목 게임', 'word-guess': '단어 맞추기',
      'trivia': '상식 퀴즈', 'minesweeper': '지뢰 찾기', 'number-find': '숫자 찾기',
      'pattern-lock': '패턴 잠금',
    },
    en: {
      'arrow-puzzle': 'Arrow Puzzle', 'parking-jam': 'Parking Jam', 'water-sort': 'Water Sort',
      '2048': '2048', 'one-line': 'One Line', 'lights-out': 'Lights Out',
      'color-match': 'Color Match', 'merge': 'Merge', 'iq-test': 'IQ Test',
      'reaction-test': 'Reaction Test', 'memory-card': 'Memory Card', 'math-quiz': 'Math Quiz',
      'color-brain': 'Color Brain', 'sequence-memory': 'Sequence Memory', 'typing-speed': 'Typing Speed',
      'word-bomb': 'Word Bomb', 'flag-quiz': 'Flag Quiz', 'spot-diff': 'Spot the Difference',
      'number-chain': 'Number Chain', 'emoji-puzzle': 'Emoji Puzzle', 'tile-match': 'Tile Match',
      'aim-trainer': 'Aim Trainer', 'snake': 'Snake', 'block-stack': 'Block Stack',
      'whack-mole': 'Whack-a-Mole', 'maze': 'Maze', 'rps-battle': 'RPS Battle',
      'flappy': 'Flappy Rocket', 'bubble-pop': 'Bubble Pop', 'color-fill': 'Color Fill',
      'sliding-puzzle': 'Sliding Puzzle', 'connect4': 'Connect 4', 'word-guess': 'Word Guess',
      'trivia': 'Trivia', 'minesweeper': 'Minesweeper', 'number-find': 'Number Find',
      'pattern-lock': 'Pattern Lock',
    },
    ja: {
      'arrow-puzzle': '矢印パズル', 'parking-jam': '駐車場脱出', 'water-sort': 'ウォーターソート',
      '2048': '2048', 'one-line': '一筆書き', 'lights-out': 'ライツアウト',
      'color-match': 'カラーマッチ', 'merge': 'マージ', 'iq-test': 'IQテスト',
      'reaction-test': '反応速度テスト', 'memory-card': '神経衰弱', 'math-quiz': '算数クイズ',
      'color-brain': 'カラーブレイン', 'sequence-memory': '順番記憶', 'typing-speed': 'タイピング速度',
      'word-bomb': 'ワードボム', 'flag-quiz': '国旗クイズ', 'spot-diff': '間違い探し',
      'number-chain': 'ナンバーチェーン', 'emoji-puzzle': '絵文字パズル', 'tile-match': 'タイルマッチ',
      'aim-trainer': 'エイムトレーナー', 'snake': 'スネーク', 'block-stack': 'ブロック積み',
      'whack-mole': 'もぐら叩き', 'maze': '迷路', 'rps-battle': 'じゃんけんバトル',
      'flappy': 'フラッピーロケット', 'bubble-pop': 'バブルポップ', 'color-fill': 'カラーフィル',
      'sliding-puzzle': 'スライドパズル', 'connect4': '四目並べ', 'word-guess': '単語当て',
      'trivia': 'トリビア', 'minesweeper': 'マインスイーパー', 'number-find': '数字探し',
      'pattern-lock': 'パターンロック',
    },
    zh: {
      'arrow-puzzle': '箭头拼图', 'parking-jam': '停车场逃脱', 'water-sort': '水排序',
      '2048': '2048', 'one-line': '一笔画', 'lights-out': '关灯游戏',
      'color-match': '颜色匹配', 'merge': '数字合并', 'iq-test': 'IQ测试',
      'reaction-test': '反应速度测试', 'memory-card': '记忆翻牌', 'math-quiz': '数学测验',
      'color-brain': '色彩大脑', 'sequence-memory': '顺序记忆', 'typing-speed': '打字速度',
      'word-bomb': '文字炸弹', 'flag-quiz': '国旗猜猜', 'spot-diff': '找不同',
      'number-chain': '数字链', 'emoji-puzzle': '表情包谜题', 'tile-match': '方块消除',
      'aim-trainer': '瞄准训练', 'snake': '贪吃蛇', 'block-stack': '方块堆叠',
      'whack-mole': '打地鼠', 'maze': '迷宫', 'rps-battle': '石头剪刀布',
      'flappy': '火箭飞行', 'bubble-pop': '泡泡消除', 'color-fill': '颜色填充',
      'sliding-puzzle': '滑块拼图', 'connect4': '四子连珠', 'word-guess': '猜单词',
      'trivia': '知识问答', 'minesweeper': '扫雷', 'number-find': '找数字',
      'pattern-lock': '图案锁',
    },
    es: {
      'arrow-puzzle': 'Puzzle de Flechas', 'parking-jam': 'Parking Jam', 'water-sort': 'Ordenar Agua',
      '2048': '2048', 'one-line': 'Una Linea', 'lights-out': 'Luces Fuera',
      'color-match': 'Color Match', 'merge': 'Fusionar', 'iq-test': 'Test de IQ',
      'reaction-test': 'Test de Reaccion', 'memory-card': 'Memoria', 'math-quiz': 'Quiz Matem.',
      'color-brain': 'Color Brain', 'sequence-memory': 'Secuencia', 'typing-speed': 'Velocidad Tipeo',
      'word-bomb': 'Bomba de Palabras', 'flag-quiz': 'Quiz Banderas', 'spot-diff': 'Diferencias',
      'number-chain': 'Cadena Numeros', 'emoji-puzzle': 'Puzzle Emoji', 'tile-match': 'Emparejar',
      'aim-trainer': 'Entrenador Punteria', 'snake': 'Serpiente', 'block-stack': 'Apilar Bloques',
      'whack-mole': 'Golpea al Topo', 'maze': 'Laberinto', 'rps-battle': 'Piedra Papel Tijera',
      'flappy': 'Cohete Volador', 'bubble-pop': 'Explota Burbujas', 'color-fill': 'Rellenar Color',
      'sliding-puzzle': 'Puzzle Deslizante', 'connect4': 'Conecta 4', 'word-guess': 'Adivina Palabra',
      'trivia': 'Trivia', 'minesweeper': 'Buscaminas', 'number-find': 'Busca Numeros',
      'pattern-lock': 'Patron de Bloqueo',
    },
  };

  // ── Game Short Descriptions i18n ──
  var GAME_DESCS = {
    ko: {
      'arrow-puzzle': '화살표를 돌려 퍼즐을 풀어보세요',
      'parking-jam': '차를 움직여 출구를 찾으세요',
      'water-sort': '같은 색 물을 모아보세요',
      '2048': '숫자를 합쳐 2048을 만드세요',
      'one-line': '한 번에 모든 선을 이으세요',
      'lights-out': '모든 불을 꺼보세요',
      'color-match': '같은 색을 빠르게 매치하세요',
      'merge': '숫자를 합쳐 높은 점수를!',
      'iq-test': '당신의 IQ를 테스트하세요',
      'reaction-test': '반응속도를 측정하세요',
      'memory-card': '짝을 맞춰보세요',
      'math-quiz': '빠르게 계산하세요',
      'color-brain': '색상 감각을 테스트하세요',
      'sequence-memory': '순서를 기억하세요',
      'typing-speed': '타이핑 실력을 겨루세요',
      'word-bomb': '시간 안에 단어를 맞추세요',
      'flag-quiz': '국기를 맞춰보세요',
      'spot-diff': '다른 부분을 찾으세요',
      'number-chain': '숫자를 순서대로 이으세요',
      'emoji-puzzle': '이모지로 문제를 풀어보세요',
      'tile-match': '같은 타일을 매치하세요',
      'aim-trainer': '조준 실력을 키우세요',
      'snake': '뱀을 키워보세요',
      'block-stack': '블록을 쌓아 올리세요',
      'whack-mole': '두더지를 잡으세요',
      'maze': '미로를 탈출하세요',
      'rps-battle': '가위바위보 대결!',
      'flappy': '장애물을 피해 날아가세요',
      'bubble-pop': '버블을 터뜨리세요',
      'color-fill': '보드를 한 색으로 채우세요',
      'sliding-puzzle': '타일을 밀어 맞추세요',
      'connect4': '4개를 연속으로 놓으세요',
      'word-guess': '숨겨진 단어를 찾으세요',
      'trivia': '상식을 테스트하세요',
      'minesweeper': '지뢰를 피해 칸을 여세요',
      'number-find': '숫자를 빠르게 찾으세요',
      'pattern-lock': '패턴을 기억하고 따라하세요',
    },
    en: {
      'arrow-puzzle': 'Rotate arrows to solve the puzzle',
      'parking-jam': 'Move cars to find the exit',
      'water-sort': 'Sort colored water into tubes',
      '2048': 'Merge numbers to reach 2048',
      'one-line': 'Draw all lines in one stroke',
      'lights-out': 'Turn off all the lights',
      'color-match': 'Match colors at lightning speed',
      'merge': 'Merge numbers for high scores',
      'iq-test': 'Test your IQ level',
      'reaction-test': 'Measure your reaction time',
      'memory-card': 'Find matching pairs',
      'math-quiz': 'Solve math problems fast',
      'color-brain': 'Test your color perception',
      'sequence-memory': 'Remember the sequence',
      'typing-speed': 'Test your typing speed',
      'word-bomb': 'Guess words before time runs out',
      'flag-quiz': 'Guess the country flag',
      'spot-diff': 'Find the differences',
      'number-chain': 'Connect numbers in order',
      'emoji-puzzle': 'Solve emoji riddles',
      'tile-match': 'Match identical tiles',
      'aim-trainer': 'Train your aim accuracy',
      'snake': 'Grow the longest snake',
      'block-stack': 'Stack blocks as high as you can',
      'whack-mole': 'Whack the moles!',
      'maze': 'Escape the maze',
      'rps-battle': 'Rock Paper Scissors battle!',
      'flappy': 'Dodge obstacles and fly far',
      'bubble-pop': 'Pop the bubbles',
      'color-fill': 'Fill the board with one color',
      'sliding-puzzle': 'Slide tiles into place',
      'connect4': 'Connect 4 in a row to win',
      'word-guess': 'Guess the hidden word',
      'trivia': 'Test your general knowledge',
      'minesweeper': 'Clear the board without hitting mines',
      'number-find': 'Find numbers as fast as you can',
      'pattern-lock': 'Remember and recreate the pattern',
    },
    ja: {
      'arrow-puzzle': '矢印を回してパズルを解こう',
      'parking-jam': '車を動かして脱出しよう',
      'water-sort': '同じ色の水をまとめよう',
      '2048': '数字を合わせて2048を目指せ',
      'one-line': '一筆で全ての線をつなごう',
      'lights-out': '全てのライトを消そう',
      'color-match': '素早く色をマッチさせよう',
      'merge': '数字を合体させてハイスコアを',
      'iq-test': 'あなたのIQをテストしよう',
      'reaction-test': '反応速度を測ろう',
      'memory-card': 'ペアを見つけよう',
      'math-quiz': '計算問題に挑戦しよう',
      'color-brain': '色彩感覚をテストしよう',
      'sequence-memory': '順番を覚えよう',
      'typing-speed': 'タイピング速度を競おう',
      'word-bomb': '時間内に単語を当てよう',
      'flag-quiz': '国旗を当てよう',
      'spot-diff': '間違いを探そう',
      'number-chain': '数字を順番につなごう',
      'emoji-puzzle': '絵文字の謎を解こう',
      'tile-match': '同じタイルをマッチしよう',
      'aim-trainer': 'エイム力を鍛えよう',
      'snake': 'ヘビを育てよう',
      'block-stack': 'ブロックを積み上げよう',
      'whack-mole': 'もぐらを叩こう',
      'maze': '迷路を脱出しよう',
      'rps-battle': 'じゃんけんバトル！',
      'flappy': '障害物を避けて飛ぼう',
      'bubble-pop': 'バブルを弾こう',
      'color-fill': 'ボードを一色に塗ろう',
      'sliding-puzzle': 'タイルをスライドさせよう',
      'connect4': '4つ並べて勝とう',
      'word-guess': '隠された単語を当てよう',
      'trivia': '雑学をテストしよう',
      'minesweeper': '地雷を避けてクリアしよう',
      'number-find': '数字を素早く見つけよう',
      'pattern-lock': 'パターンを覚えて再現しよう',
    },
    zh: {
      'arrow-puzzle': '旋转箭头解开谜题',
      'parking-jam': '移动车辆找到出口',
      'water-sort': '将同色水排到一起',
      '2048': '合并数字达到2048',
      'one-line': '一笔连接所有线',
      'lights-out': '关掉所有灯',
      'color-match': '快速匹配相同颜色',
      'merge': '合并数字冲高分',
      'iq-test': '测试你的智商',
      'reaction-test': '测量你的反应速度',
      'memory-card': '找到匹配的对子',
      'math-quiz': '快速解答数学题',
      'color-brain': '测试你的色彩感知',
      'sequence-memory': '记住出现的顺序',
      'typing-speed': '测试打字速度',
      'word-bomb': '在时间内猜出单词',
      'flag-quiz': '猜猜这是哪国国旗',
      'spot-diff': '找出不同之处',
      'number-chain': '按顺序连接数字',
      'emoji-puzzle': '解开表情包谜题',
      'tile-match': '匹配相同的方块',
      'aim-trainer': '训练你的瞄准能力',
      'snake': '养一条最长的蛇',
      'block-stack': '尽可能高地堆方块',
      'whack-mole': '打地鼠！',
      'maze': '逃出迷宫',
      'rps-battle': '石头剪刀布对决！',
      'flappy': '躲避障碍飞行',
      'bubble-pop': '戳破泡泡',
      'color-fill': '用一种颜色填满',
      'sliding-puzzle': '滑动拼图到正确位置',
      'connect4': '四子连珠获胜',
      'word-guess': '猜出隐藏的单词',
      'trivia': '测试你的常识',
      'minesweeper': '避开地雷清除方块',
      'number-find': '尽快找到数字',
      'pattern-lock': '记住并重现图案',
    },
    es: {
      'arrow-puzzle': 'Gira flechas para resolver el puzzle',
      'parking-jam': 'Mueve coches para encontrar la salida',
      'water-sort': 'Ordena el agua por colores',
      '2048': 'Fusiona numeros hasta llegar a 2048',
      'one-line': 'Dibuja todas las lineas de un trazo',
      'lights-out': 'Apaga todas las luces',
      'color-match': 'Empareja colores rapidamente',
      'merge': 'Fusiona numeros para sumar puntos',
      'iq-test': 'Pon a prueba tu IQ',
      'reaction-test': 'Mide tu tiempo de reaccion',
      'memory-card': 'Encuentra los pares',
      'math-quiz': 'Resuelve problemas de mates rapido',
      'color-brain': 'Pon a prueba tu percepcion del color',
      'sequence-memory': 'Recuerda la secuencia',
      'typing-speed': 'Mide tu velocidad al teclear',
      'word-bomb': 'Adivina la palabra antes de que explote',
      'flag-quiz': 'Adivina la bandera',
      'spot-diff': 'Encuentra las diferencias',
      'number-chain': 'Conecta numeros en orden',
      'emoji-puzzle': 'Resuelve acertijos con emojis',
      'tile-match': 'Empareja fichas identicas',
      'aim-trainer': 'Entrena tu punteria',
      'snake': 'Haz crecer la serpiente',
      'block-stack': 'Apila bloques lo mas alto posible',
      'whack-mole': 'Golpea al topo!',
      'maze': 'Escapa del laberinto',
      'rps-battle': 'Piedra Papel Tijera!',
      'flappy': 'Esquiva obstaculos y vuela lejos',
      'bubble-pop': 'Explota las burbujas',
      'color-fill': 'Rellena el tablero de un color',
      'sliding-puzzle': 'Desliza las piezas a su lugar',
      'connect4': 'Conecta 4 en fila para ganar',
      'word-guess': 'Adivina la palabra oculta',
      'trivia': 'Pon a prueba tu cultura general',
      'minesweeper': 'Limpia el campo sin pisar minas',
      'number-find': 'Encuentra numeros lo mas rapido posible',
      'pattern-lock': 'Recuerda y recrea el patron',
    },
  };

  // ── UI Text i18n ──
  var UI_I18N = {
    ko: {
      youMightLike: '이런 게임은 어때요?',
      playAgain: '다시 플레이',
      tryThisNext: '이것도 해보세요 \u2192',
      share: '공유하기',
      welcomeBack: '다시 오셨네요!',
      streakMsg: '\uD83D\uDD25 {n}일 연속 접속 중!',
      dailyChallenge: '일일 도전',
      newGame: 'NEW',
      popular: '인기',
      notPlayed: '미플레이',
    },
    en: {
      youMightLike: 'You Might Also Like',
      playAgain: 'Play Again',
      tryThisNext: 'Try This Next \u2192',
      share: 'Share',
      welcomeBack: 'Welcome Back!',
      streakMsg: '\uD83D\uDD25 {n}-day streak!',
      dailyChallenge: 'Daily Challenge',
      newGame: 'NEW',
      popular: 'Popular',
      notPlayed: 'Not Played',
    },
    ja: {
      youMightLike: 'こんなゲームはいかが？',
      playAgain: 'もう一度プレイ',
      tryThisNext: 'これもやってみよう \u2192',
      share: 'シェア',
      welcomeBack: 'おかえりなさい！',
      streakMsg: '\uD83D\uDD25 {n}日連続アクセス中！',
      dailyChallenge: 'デイリーチャレンジ',
      newGame: 'NEW',
      popular: '人気',
      notPlayed: '未プレイ',
    },
    zh: {
      youMightLike: '你可能还喜欢',
      playAgain: '再玩一次',
      tryThisNext: '试试这个 \u2192',
      share: '分享',
      welcomeBack: '欢迎回来！',
      streakMsg: '\uD83D\uDD25 连续 {n} 天!',
      dailyChallenge: '每日挑战',
      newGame: 'NEW',
      popular: '热门',
      notPlayed: '未玩过',
    },
    es: {
      youMightLike: 'Tambien te puede gustar',
      playAgain: 'Jugar de nuevo',
      tryThisNext: 'Prueba este \u2192',
      share: 'Compartir',
      welcomeBack: 'Bienvenido de nuevo!',
      streakMsg: '\uD83D\uDD25 {n} dias seguidos!',
      dailyChallenge: 'Reto Diario',
      newGame: 'NEW',
      popular: 'Popular',
      notPlayed: 'Sin jugar',
    },
  };

  // Games with daily challenge modes
  var DAILY_GAMES = ['math-quiz', 'typing-speed', 'reaction-test', 'word-bomb', 'flag-quiz', 'trivia', 'number-find'];

  // ── Utility Helpers ──

  function getLang() {
    var params = new URLSearchParams(window.location.search);
    return params.get('lang') || localStorage.getItem('puzzleArcadeLang') || 'ko';
  }

  function t(key) {
    var lang = getLang();
    return (UI_I18N[lang] && UI_I18N[lang][key]) || UI_I18N.ko[key] || key;
  }

  function gameName(id) {
    var lang = getLang();
    return (GAME_NAMES[lang] && GAME_NAMES[lang][id]) || GAME_NAMES.ko[id] || id;
  }

  function gameDesc(id) {
    var lang = getLang();
    return (GAME_DESCS[lang] && GAME_DESCS[lang][id]) || GAME_DESCS.ko[id] || '';
  }

  function getCurrentGameId() {
    var path = window.location.pathname;
    var filename = path.split('/').pop();
    if (!filename || filename === 'index.html' || filename === '') return null;
    return filename.replace('.html', '');
  }

  function findGame(id) {
    for (var i = 0; i < GAMES.length; i++) {
      if (GAMES[i].id === id) return GAMES[i];
    }
    return null;
  }

  function getPlayedGames() {
    try {
      return JSON.parse(localStorage.getItem(PLAYED_KEY) || '[]');
    } catch (e) { return []; }
  }

  function markPlayed(id) {
    var played = getPlayedGames();
    if (played.indexOf(id) === -1) {
      played.push(id);
      localStorage.setItem(PLAYED_KEY, JSON.stringify(played));
    }
  }

  function getPlayCounts() {
    try {
      return JSON.parse(localStorage.getItem(PLAY_COUNT_KEY) || '{}');
    } catch (e) { return {}; }
  }

  function incrementPlayCount(id) {
    var counts = getPlayCounts();
    counts[id] = (counts[id] || 0) + 1;
    localStorage.setItem(PLAY_COUNT_KEY, JSON.stringify(counts));
  }

  function buildGameUrl(file) {
    var lang = getLang();
    var sep = file.indexOf('?') >= 0 ? '&' : '?';
    return file + sep + 'lang=' + lang;
  }

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // ── Streak Management ──

  function updateStreak() {
    var today = new Date().toISOString().slice(0, 10);
    var lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    var streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);

    if (lastVisit === today) {
      // Already visited today, streak unchanged
      return streak;
    }

    var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastVisit === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }

    localStorage.setItem(STREAK_KEY, String(streak));
    localStorage.setItem(LAST_VISIT_KEY, today);
    return streak;
  }

  function getStreak() {
    return parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
  }

  // ── Recommendation Engine ──

  function getRecommendations(currentId, count) {
    count = count || 3;
    var played = getPlayedGames();
    var playCounts = getPlayCounts();
    var current = findGame(currentId);
    var currentCats = current ? current.cat : [];

    // Score each game
    var scored = [];
    for (var i = 0; i < GAMES.length; i++) {
      var g = GAMES[i];
      if (g.id === currentId) continue;

      var score = 0;

      // Category overlap bonus (0-3 points per shared category)
      for (var c = 0; c < g.cat.length; c++) {
        if (currentCats.indexOf(g.cat[c]) >= 0) {
          score += 3;
        }
      }

      // Not-yet-played bonus
      if (played.indexOf(g.id) === -1) {
        score += 5;
      }

      // Popularity bonus (based on play counts of all users on this device)
      var plays = playCounts[g.id] || 0;
      score += Math.min(plays, 5); // cap at 5

      // Small random jitter for variety
      score += Math.random() * 2;

      scored.push({ game: g, score: score });
    }

    // Sort descending by score
    scored.sort(function (a, b) { return b.score - a.score; });

    var results = [];
    for (var j = 0; j < Math.min(count, scored.length); j++) {
      results.push(scored[j].game);
    }
    return results;
  }

  // ── CSS Injection ──

  var cssInjected = false;

  function injectCSS() {
    if (cssInjected) return;
    cssInjected = true;

    var style = document.createElement('style');
    style.id = 'puzzle-recommend-css';
    style.textContent = [
      // Widget container
      '.pr-widget{',
      '  font-family:"Outfit",sans-serif;',
      '  background:#1a1a2e;',
      '  border-top:2px solid #333;',
      '  padding:20px 16px 28px;',
      '  margin-top:24px;',
      '}',
      '.pr-widget-title{',
      '  color:#fff;font-size:16px;font-weight:600;',
      '  margin-bottom:14px;text-align:center;',
      '}',
      '.pr-cards{',
      '  display:flex;gap:12px;overflow-x:auto;',
      '  scroll-snap-type:x mandatory;',
      '  -webkit-overflow-scrolling:touch;',
      '  padding-bottom:8px;',
      '}',
      '.pr-cards::-webkit-scrollbar{height:4px;}',
      '.pr-cards::-webkit-scrollbar-thumb{background:#444;border-radius:4px;}',
      '.pr-card{',
      '  flex:0 0 auto;width:140px;',
      '  background:#16213e;border-radius:14px;',
      '  padding:16px 12px;text-align:center;',
      '  text-decoration:none;color:#fff;',
      '  scroll-snap-align:start;',
      '  transition:transform .2s,box-shadow .2s;',
      '  border:1px solid #2a2a4a;',
      '}',
      '.pr-card:hover{',
      '  transform:translateY(-3px);',
      '  box-shadow:0 6px 20px rgba(0,0,0,.4);',
      '  border-color:#4a4aff;',
      '}',
      '.pr-card-emoji{font-size:36px;display:block;margin-bottom:8px;}',
      '.pr-card-name{',
      '  font-size:13px;font-weight:600;',
      '  margin-bottom:4px;white-space:nowrap;',
      '  overflow:hidden;text-overflow:ellipsis;',
      '}',
      '.pr-card-desc{',
      '  font-size:11px;color:#aaa;',
      '  line-height:1.3;display:-webkit-box;',
      '  -webkit-line-clamp:2;-webkit-box-orient:vertical;',
      '  overflow:hidden;',
      '}',
      '.pr-card-badge{',
      '  display:inline-block;font-size:9px;font-weight:700;',
      '  padding:2px 6px;border-radius:8px;margin-top:6px;',
      '}',
      '.pr-badge-new{background:#ff4757;color:#fff;}',
      '.pr-badge-popular{background:#ffa502;color:#1a1a2e;}',
      '.pr-badge-unplayed{background:#2ed573;color:#1a1a2e;}',

      // End screen bar
      '.pr-endbar{',
      '  position:fixed;bottom:0;left:0;right:0;',
      '  background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);',
      '  border-top:2px solid #4a4aff;',
      '  padding:14px 16px;display:flex;',
      '  align-items:center;justify-content:center;',
      '  gap:10px;z-index:10000;',
      '  transform:translateY(100%);',
      '  transition:transform .4s cubic-bezier(.22,1,.36,1);',
      '  box-shadow:0 -4px 24px rgba(0,0,0,.5);',
      '}',
      '.pr-endbar.pr-show{transform:translateY(0);}',
      '.pr-endbar-btn{',
      '  padding:10px 18px;border:none;border-radius:10px;',
      '  font-family:"Outfit",sans-serif;font-size:14px;',
      '  font-weight:600;cursor:pointer;',
      '  transition:transform .15s,opacity .15s;',
      '  white-space:nowrap;',
      '}',
      '.pr-endbar-btn:active{transform:scale(.95);}',
      '.pr-btn-play{background:#4a4aff;color:#fff;}',
      '.pr-btn-next{background:#2ed573;color:#1a1a2e;}',
      '.pr-btn-share{background:#ff6348;color:#fff;}',
      '.pr-endbar-close{',
      '  position:absolute;top:4px;right:10px;',
      '  background:none;border:none;color:#888;',
      '  font-size:18px;cursor:pointer;padding:4px;',
      '}',

      // Toast
      '.pr-toast{',
      '  position:fixed;top:20px;left:50%;',
      '  transform:translateX(-50%) translateY(-80px);',
      '  background:linear-gradient(135deg,#4a4aff,#6c5ce7);',
      '  color:#fff;padding:12px 24px;border-radius:12px;',
      '  font-family:"Outfit",sans-serif;font-size:15px;',
      '  font-weight:600;z-index:10001;',
      '  box-shadow:0 4px 20px rgba(74,74,255,.4);',
      '  transition:transform .5s cubic-bezier(.22,1,.36,1),opacity .5s;',
      '  opacity:0;pointer-events:none;',
      '}',
      '.pr-toast.pr-show{',
      '  transform:translateX(-50%) translateY(0);opacity:1;',
      '}',

      // Streak badge on main page
      '.pr-streak{',
      '  display:inline-flex;align-items:center;gap:6px;',
      '  background:linear-gradient(135deg,#ff4757,#ff6348);',
      '  color:#fff;padding:6px 14px;border-radius:20px;',
      '  font-family:"Outfit",sans-serif;font-size:14px;',
      '  font-weight:700;margin:8px auto;',
      '}',

      // Daily challenge indicator
      '.pr-daily-badge{',
      '  position:absolute;top:-4px;right:-4px;',
      '  width:10px;height:10px;background:#ff4757;',
      '  border-radius:50%;border:2px solid #1a1a2e;',
      '  animation:pr-pulse 2s infinite;',
      '}',
      '@keyframes pr-pulse{',
      '  0%,100%{box-shadow:0 0 0 0 rgba(255,71,87,.5);}',
      '  50%{box-shadow:0 0 0 6px rgba(255,71,87,0);}',
      '}',

      // Responsive
      '@media(max-width:400px){',
      '  .pr-card{width:120px;padding:12px 8px;}',
      '  .pr-card-emoji{font-size:28px;}',
      '  .pr-endbar{flex-wrap:wrap;gap:8px;padding:10px 12px;}',
      '  .pr-endbar-btn{padding:8px 14px;font-size:13px;}',
      '}',
    ].join('\n');

    document.head.appendChild(style);
  }

  // ── "You Might Also Like" Widget ──

  function createWidget(targetEl) {
    injectCSS();

    var currentId = getCurrentGameId();
    if (!currentId) return null;

    var recs = getRecommendations(currentId, 3);
    if (recs.length === 0) return null;

    var played = getPlayedGames();
    var playCounts = getPlayCounts();

    var container = document.createElement('div');
    container.className = 'pr-widget';

    var title = document.createElement('div');
    title.className = 'pr-widget-title';
    title.textContent = t('youMightLike');
    container.appendChild(title);

    var cards = document.createElement('div');
    cards.className = 'pr-cards';

    for (var i = 0; i < recs.length; i++) {
      var g = recs[i];
      var card = document.createElement('a');
      card.className = 'pr-card';
      card.href = buildGameUrl(g.file);

      var emoji = document.createElement('span');
      emoji.className = 'pr-card-emoji';
      emoji.textContent = g.emoji;
      card.appendChild(emoji);

      var name = document.createElement('div');
      name.className = 'pr-card-name';
      name.textContent = gameName(g.id);
      card.appendChild(name);

      var desc = document.createElement('div');
      desc.className = 'pr-card-desc';
      desc.textContent = gameDesc(g.id);
      card.appendChild(desc);

      // Badge logic
      var badge = null;
      if (played.indexOf(g.id) === -1) {
        badge = document.createElement('span');
        badge.className = 'pr-card-badge pr-badge-unplayed';
        badge.textContent = t('notPlayed');
      } else if ((playCounts[g.id] || 0) >= 5) {
        badge = document.createElement('span');
        badge.className = 'pr-card-badge pr-badge-popular';
        badge.textContent = t('popular');
      }
      if (badge) card.appendChild(badge);

      cards.appendChild(card);
    }

    container.appendChild(cards);

    if (targetEl) {
      targetEl.appendChild(container);
    }

    return container;
  }

  function showWidget() {
    var currentId = getCurrentGameId();
    if (!currentId) return;

    // Don't inject on index page
    if (window.location.pathname.indexOf('index.html') >= 0) return;
    var path = window.location.pathname;
    if (path === '/' || path.endsWith('/')) return;

    var widget = createWidget(document.body);
    return widget;
  }

  // ── End Screen Bar ──

  var endBarEl = null;

  function showEndScreen(opts) {
    injectCSS();
    opts = opts || {};

    // Remove previous end bar if any
    if (endBarEl && endBarEl.parentNode) {
      endBarEl.parentNode.removeChild(endBarEl);
    }

    var currentId = getCurrentGameId();
    var nextGame = getRecommendations(currentId, 5);
    var chosen = nextGame.length > 0 ? nextGame[Math.floor(Math.random() * Math.min(3, nextGame.length))] : null;

    var bar = document.createElement('div');
    bar.className = 'pr-endbar';

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.className = 'pr-endbar-close';
    closeBtn.textContent = '\u00D7';
    closeBtn.onclick = function () {
      bar.classList.remove('pr-show');
      setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 400);
    };
    bar.appendChild(closeBtn);

    // Play Again
    var playBtn = document.createElement('button');
    playBtn.className = 'pr-endbar-btn pr-btn-play';
    playBtn.textContent = t('playAgain');
    playBtn.onclick = function () {
      window.location.reload();
    };
    bar.appendChild(playBtn);

    // Try This Next
    if (chosen) {
      var nextBtn = document.createElement('button');
      nextBtn.className = 'pr-endbar-btn pr-btn-next';
      nextBtn.textContent = chosen.emoji + ' ' + t('tryThisNext');
      nextBtn.onclick = function () {
        window.location.href = buildGameUrl(chosen.file);
      };
      bar.appendChild(nextBtn);
    }

    // Share button
    var shareBtn = document.createElement('button');
    shareBtn.className = 'pr-endbar-btn pr-btn-share';
    shareBtn.textContent = t('share');
    shareBtn.onclick = function () {
      if (window.PuzzleShare && typeof window.PuzzleShare.showShareModal === 'function') {
        window.PuzzleShare.showShareModal(opts.shareOpts || {
          title: gameName(currentId),
          score: opts.score || 0,
          stars: opts.stars || 0,
          message: opts.message || '',
          lang: getLang(),
          gameName: gameName(currentId),
        });
      } else {
        // Fallback: native share or clipboard
        var text = gameName(currentId) + (opts.score ? ' - ' + opts.score : '');
        if (navigator.share) {
          navigator.share({ title: 'Puzzle Arcade', text: text, url: window.location.href });
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
        }
      }
    };
    bar.appendChild(shareBtn);

    document.body.appendChild(bar);
    endBarEl = bar;

    // Animate in after delay
    var delay = opts.delay !== undefined ? opts.delay : 2000;
    setTimeout(function () {
      bar.classList.add('pr-show');
    }, delay);

    return bar;
  }

  // ── Toast Notification ──

  function showToast(message, duration) {
    injectCSS();
    duration = duration || 3000;

    var toast = document.createElement('div');
    toast.className = 'pr-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger show
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('pr-show');
      });
    });

    setTimeout(function () {
      toast.classList.remove('pr-show');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 500);
    }, duration);

    return toast;
  }

  // ── Return User Engagement ──

  function handleReturnUser() {
    var streak = updateStreak();
    var lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    var today = new Date().toISOString().slice(0, 10);
    var sessionKey = STORAGE_PREFIX + 'sessionToast_' + today;

    // Only show toast once per session per day
    if (sessionStorage.getItem(sessionKey)) return streak;

    if (streak > 1) {
      // Show welcome back toast with streak
      setTimeout(function () {
        showToast(t('welcomeBack') + ' ' + t('streakMsg').replace('{n}', streak));
      }, 800);
    } else if (lastVisit && lastVisit !== today) {
      // Returning user but streak reset
      setTimeout(function () {
        showToast(t('welcomeBack'));
      }, 800);
    }

    sessionStorage.setItem(sessionKey, '1');
    return streak;
  }

  // ── Streak Counter Element ──

  function createStreakElement() {
    var streak = getStreak();
    if (streak < 2) return null;

    var el = document.createElement('div');
    el.className = 'pr-streak';
    el.textContent = t('streakMsg').replace('{n}', streak);
    return el;
  }

  // ── Daily Challenge Badge ──

  function addDailyBadges() {
    // Look for game links that have daily challenge modes and add pulsing badges
    DAILY_GAMES.forEach(function (gameId) {
      var links = document.querySelectorAll('a[href*="' + gameId + '"]');
      links.forEach(function (link) {
        if (link.querySelector('.pr-daily-badge')) return;
        var style = window.getComputedStyle(link);
        if (style.position === 'static') {
          link.style.position = 'relative';
        }
        var badge = document.createElement('span');
        badge.className = 'pr-daily-badge';
        badge.title = t('dailyChallenge');
        link.appendChild(badge);
      });
    });
  }

  // ── Auto-Inject on Game Pages ──

  function autoInit() {
    var currentId = getCurrentGameId();
    if (!currentId) return;

    // Mark game as played
    markPlayed(currentId);
    incrementPlayCount(currentId);

    // Handle return user engagement
    handleReturnUser();

    // Inject recommendation widget at bottom
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        showWidget();
        addDailyBadges();
      });
    } else {
      showWidget();
      addDailyBadges();
    }
  }

  // ── Public API ──

  window.PuzzleRecommend = {
    // Core data
    GAMES: GAMES,
    GAME_NAMES: GAME_NAMES,
    GAME_DESCS: GAME_DESCS,

    // Recommendation engine
    getRecommendations: function (count) {
      return getRecommendations(getCurrentGameId(), count || 3);
    },
    getRecommendationsFor: getRecommendations,

    // UI Components
    showWidget: showWidget,
    createWidget: createWidget,
    showEndScreen: showEndScreen,
    showToast: showToast,

    // Streak / engagement
    getStreak: getStreak,
    updateStreak: updateStreak,
    createStreakElement: createStreakElement,
    handleReturnUser: handleReturnUser,

    // Daily challenges
    addDailyBadges: addDailyBadges,
    DAILY_GAMES: DAILY_GAMES,

    // Utilities
    getCurrentGameId: getCurrentGameId,
    findGame: findGame,
    gameName: gameName,
    gameDesc: gameDesc,
    getPlayedGames: getPlayedGames,
    markPlayed: markPlayed,
    getLang: getLang,
    buildGameUrl: buildGameUrl,
  };

  // Auto-initialize on game pages
  autoInit();

})();
