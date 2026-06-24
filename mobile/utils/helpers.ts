export function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function macrosToKcal(protein: number, carbs: number, fat: number): number {
  return protein * 4 + carbs * 4 + fat * 9;
}

export function coachFallback(text: string): string {
  const t = text.toLowerCase();
  if (/protein/.test(t))
    return "You're at 84 g of protein, so about 36 g to go. A grilled chicken breast (31 g) or a cup of Greek yogurt (17 g) would close the gap nicely.";
  if (/lunch/.test(t))
    return 'With 1,240 kcal left, try a grain bowl \u2014 quinoa, roasted veggies, chickpeas and a little feta lands around 500 kcal with ~20 g protein.';
  if (/breakfast/.test(t))
    return 'Tomorrow, try eggs on whole-grain toast with avocado: ~400 kcal and 20 g protein to start the day full and steady.';
  if (/snack/.test(t))
    return 'A solid ~150 kcal snack: Greek yogurt with berries, or an apple with a tablespoon of peanut butter for some staying power.';
  if (/oatmeal|workout|post.?workout|recovery/.test(t))
    return 'Oatmeal is a great post-workout choice \u2014 the carbs refill your glycogen. Add a scoop of protein or some Greek yogurt to support muscle recovery.';
  if (/water|hydrat/.test(t))
    return 'Aim for around 2\u20132.5 L a day. Keeping a bottle nearby and drinking a glass before each meal makes it almost automatic.';
  if (/weight|lose|deficit|fat loss/.test(t))
    return "A steady 300\u2013500 kcal daily deficit is sustainable. You're on track today with 1,240 kcal left \u2014 lean on protein and veggies to stay full.";
  return 'Good question! Today you\'ve got 1,240 kcal and about 36 g of protein left. Want a meal idea, a macro breakdown, or a quick snack suggestion?';
}

export function dietSummary(diet: Record<string, boolean>): string {
  const on = Object.keys(diet).filter((k) => diet[k]);
  if (on.length === 0) return 'None';
  if (on.length === 1) return on[0];
  return `${on.length} selected`;
}

export function connectedSummary(connected: Record<string, boolean>): string {
  const on = Object.keys(connected).filter((k) => connected[k]);
  if (on.length === 0) return 'None';
  if (on.length === 1) return on[0];
  return `${on.length} connected`;
}

export function formatIban(raw: string): string {
  return raw.replace(/[^A-Z0-9]/gi, '').replace(/(.{4})/g, '$1 ').trim().toUpperCase();
}

export function maskIban(iban: string): string {
  const clean = iban.replace(/\s/g, '');
  if (clean.length < 8) return formatIban(clean);
  return `${clean.slice(0, 4)} ${'•••• '.repeat(Math.max(0, Math.floor((clean.length - 8) / 4)))}${clean.slice(-4)}`;
}
