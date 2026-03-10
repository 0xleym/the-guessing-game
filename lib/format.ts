export function formatINR(
  amount: number,
  { symbol = true }: { symbol?: boolean } = {}
): string {
  const formatted = amount.toLocaleString('en-IN');
  return symbol ? '₹' + formatted : formatted;
}
