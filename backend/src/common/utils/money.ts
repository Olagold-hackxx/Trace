export function koboToNaira(amountKobo: string | number): number {
  return Number(amountKobo) / 100;
}

export function nairaToKobo(amountNaira: string | number): string {
  return String(Math.round(Number(amountNaira) * 100));
}
