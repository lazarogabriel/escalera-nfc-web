const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** "$1,250" o "$12.50". El " MXN" lo agregan los textos. */
export function money(amount: number): string {
  return Number.isInteger(amount) ? mxn.format(amount) : mxn.format(amount).replace(/(\.\d)$/, '$10');
}

/** "1 tarjeta" o "10 tarjetas". */
export function cardsLabel(n: number, one: string, many: string): string {
  return n === 1 ? one : many.replace('{n}', String(n));
}
