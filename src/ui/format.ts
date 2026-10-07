const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** "$1,250" o "$12.50". El " MXN" lo agregan los textos. */
export function money(amount: number): string {
  return Number.isInteger(amount) ? mxn.format(amount) : mxn.format(amount).replace(/(\.\d)$/, '$10');
}

/** Altura de la pila: 2 mm por tarjeta. "2 mm", "2 cm", "20 cm". */
export function stackHeight(cards: number): string {
  const mm = cards * 2;
  if (mm < 10) return `${mm} mm`;
  const cm = mm / 10;
  return `${Number.isInteger(cm) ? cm : cm.toFixed(1)} cm`;
}

export function packLabel(cards: number, title: string, oneCard: string): string {
  return cards === 1 ? oneCard : title;
}
