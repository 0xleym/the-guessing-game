export function formatINR(amount: number): string {
  // Indian number system: 1,00,000 instead of 100,000
  return '₹' + amount.toLocaleString('en-IN');
}

export function parseINR(input: string): number | null {
  const cleaned = input.replace(/[₹,\s]/g, '');
  const num = Number(cleaned);
  return isNaN(num) || num < 0 ? null : Math.round(num);
}
