export class Formatter {
  static toTitleCase(str: string): string {
    return str
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  static formatDollar(value: number): string {
    return '$' + value.toLocaleString('en-US');
  }

  static formatNumber(value: number, decimals: number = 0): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  static formatPercent(value: number, decimals: number = 0): string {
    return (value * 100).toFixed(decimals) + '%';
  }
}
