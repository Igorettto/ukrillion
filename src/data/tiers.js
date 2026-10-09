export const TIERS = {
  ONE_IN_KRILLION: {
    id: 'one_in_krillion',
    name: 'Один на крільйон',
    description: 'Екстремально рідкісна або унікальна відповідь (1-2 варіанти)',
    points: 1000,
    color: '#8b5cf6', // purple
    badgeClass: 'badge-krillion'
  },
  DEEP_CUT: {
    id: 'deep_cut',
    name: 'Глибинна знахідка',
    description: 'Маловідомий глибокий факт',
    points: 400,
    color: '#3b82f6', // blue
    badgeClass: 'badge-deep'
  },
  RARE: {
    id: 'rare',
    name: 'Рідкісна',
    description: 'Неочевидна правильна відповідь',
    points: 200,
    color: '#10b981', // green
    badgeClass: 'badge-rare'
  },
  SCHOOLER: {
    id: 'schooler',
    name: 'Косякова риба',
    description: 'Поширена, стандартна відповідь',
    points: 75,
    color: '#f59e0b', // amber
    badgeClass: 'badge-schooler'
  },
  PLANKTON: {
    id: 'plankton',
    name: 'Планктон',
    description: 'Найдефолтніша відповідь, яку знає кожен',
    points: 20,
    color: '#ef4444', // red
    badgeClass: 'badge-plankton'
  },
  MISS: {
    id: 'miss',
    name: 'Мимо / Не знайдено',
    description: 'Відповідь відсутня в базі або неправильна',
    points: 0,
    color: '#6b7280', // gray
    badgeClass: 'badge-miss'
  }
};