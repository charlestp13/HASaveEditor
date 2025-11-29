export class ValueSteppers {
  static snapUp(value: number, gridSize: number, max: number): number {
    const current = Math.round(value * 100);
    if (current % gridSize === 0) {
      return Math.min((current + gridSize) / 100, max);
    }
    return Math.min((Math.ceil(current / gridSize) * gridSize) / 100, max);
  }

  static snapDown(value: number, gridSize: number, min: number = 0): number {
    const current = Math.round(value * 100);
    if (current % gridSize === 0) {
      return Math.max((current - gridSize) / 100, min);
    }
    return Math.max((Math.floor(current / gridSize) * gridSize) / 100, min);
  }

  static findNextLevel(current: number, levels: readonly number[]): number {
    for (const level of levels) {
      if (level > current) return level;
    }
    return current;
  }

  static findPrevLevel(current: number, levels: readonly number[]): number {
    for (let i = levels.length - 1; i >= 0; i--) {
      if (levels[i] < current) return levels[i];
    }
    return 0;
  }

  static formatScaled(value: number, scale: number): string {
    const scaled = value * scale;
    return scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
