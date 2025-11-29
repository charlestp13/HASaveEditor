const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export class DateUtils {
  static readonly GAME_START_DATE = '1929-01-01T00:00:00';

  readonly year: number;
  readonly month: number;
  readonly day: number;

  constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Static Factory Methods
  // ───────────────────────────────────────────────────────────────────────────

  static parse(dateStr: string): DateUtils | null {
    const match = dateStr.match(/(\w+) (\d+), (\d+)/);
    if (!match) return null;

    const monthIndex = MONTHS_FULL.indexOf(match[1]);
    if (monthIndex === -1) return null;

    return new DateUtils(parseInt(match[3]), monthIndex, parseInt(match[2]));
  }

  static fromDDMMYYYY(dateStr: string): DateUtils | null {
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    return new DateUtils(year, month - 1, day);
  }

  static fromDate(date: Date): DateUtils {
    return new DateUtils(date.getFullYear(), date.getMonth(), date.getDate());
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Static Helpers
  // ───────────────────────────────────────────────────────────────────────────

  static calculateAge(birthDate: string, currentDate: string): number | null {
    try {
      const birth = DateUtils.fromDDMMYYYY(birthDate);
      const current = DateUtils.parse(currentDate);

      if (!birth || !current) return null;

      return birth.ageTo(current);
    } catch {
      return null;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Instance Methods
  // ───────────────────────────────────────────────────────────────────────────

  toDate(): Date {
    return new Date(this.year, this.month, this.day);
  }

  format(style: 'short' | 'full' = 'short'): string {
    const months = style === 'short' ? MONTHS_SHORT : MONTHS_FULL;
    return `${months[this.month]} ${this.day}, ${this.year}`;
  }

  ageTo(currentDate: DateUtils): number {
    let age = currentDate.year - this.year;
    const monthDiff = currentDate.month - this.month;

    if (monthDiff < 0 || (monthDiff === 0 && currentDate.day < this.day)) {
      age--;
    }

    return age;
  }

  daysUntil(target: DateUtils): number {
    const from = this.toDate();
    const to = target.toDate();
    const diffTime = to.getTime() - from.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
