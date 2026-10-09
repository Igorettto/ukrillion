import { TIERS } from '../data/tiers';

/**
 * Нормалізація українського тексту:
 * - нижній регістр
 * - уніфікація апострофів
 * - видалення службових слів категорії (протока, кістка, море, планета тощо)
 * - видалення спеціальних символів і зайвих пробілів
 */
export function normalize(text) {
  if (!text) return '';

  return text
    .toLowerCase()
    .replace(/[’ʼ`]/g, "'")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(
      /\b(протока|протоки|річка|річки|кістка|кістки|острів|море|моря|океан|океану|планета|планети|країна|країни|мова|мови|гора|гори|сузір'я|сузіря|літера|елемент|вид|спорту|порода|породи|дерево|кущ|орган|органи|залоза)\b/gi,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Просте усічення типових українських прикметникових та іменникових закінчень
 * (для порівняння форми на зразок "берингова" і "беринг", "шлунок" і "шлунка")
 */
function stemWord(word) {
  if (word.length <= 4) return word;
  return word.replace(/(ська|ський|ське|ської|ську|івська|ова|овий|ове|ного|ному|ний|на|не|ні|ів|ях|ам|ом|ем|ям)$/g, '');
}

/**
 * Розрахунок відстані Левенштейна
 */
function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/**
 * Перевірка збігу відповіді гравця з канонічним словом із бази
 */
function isMatch(userRaw, targetRaw) {
  const u = normalize(userRaw);
  const t = normalize(targetRaw);

  if (!u || !t) return false;
  if (u === t) return true;

  // 1. Порівняння основ слів (stems)
  const uStem = stemWord(u);
  const tStem = stemWord(t);
  if (uStem === tStem && uStem.length >= 3) return true;

  // 2. Входження підрядка для складних назв
  if (t.length >= 5 && u.includes(t)) return true;
  if (u.length >= 5 && t.includes(u)) return true;

  // 3. Відстань Левенштейна (допуск 1 помилки для слів від 5 літер, 2 помилок для слів від 8 літер)
  const maxLen = Math.max(u.length, t.length);
  const dist = levenshteinDistance(u, t);

  if (maxLen >= 8 && dist <= 2) return true;
  if (maxLen >= 5 && dist <= 1) return true;

  return false;
}

/**
 * Перевірка відповіді за ієрархією tiers
 */
export function evaluateAnswer(rawInput, question) {
  if (!rawInput || !rawInput.trim()) {
    return { tier: TIERS.MISS, matchedAs: null };
  }

  const order = [
    { key: 'one_in_krillion', tierObj: TIERS.ONE_IN_KRILLION },
    { key: 'deep_cut', tierObj: TIERS.DEEP_CUT },
    { key: 'rare', tierObj: TIERS.RARE },
    { key: 'schooler', tierObj: TIERS.SCHOOLER },
    { key: 'plankton', tierObj: TIERS.PLANKTON }
  ];

  for (const { key, tierObj } of order) {
    const list = question.tiers[key] || [];
    for (const candidate of list) {
      if (isMatch(rawInput, candidate)) {
        return {
          tier: tierObj,
          matchedAs: candidate
        };
      }
    }
  }

  return {
    tier: TIERS.MISS,
    matchedAs: null
  };
}