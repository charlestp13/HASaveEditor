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
}
