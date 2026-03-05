import { TestBed } from '@angular/core/testing';
import { FormatTimePipe } from './format-time.pipe';

describe('FormatTimePipe', () => {
  let pipe: FormatTimePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormatTimePipe],
    });
    pipe = TestBed.inject(FormatTimePipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('undefined and null handling', () => {
    it('should return "N/A" for undefined', () => {
      expect(pipe.transform(undefined)).toBe('N/A');
    });

    it('should return "N/A" for null', () => {
      expect(pipe.transform(null as any)).toBe('N/A');
    });
  });

  describe('milliseconds formatting (< 1000ms)', () => {
    it('should format 0ms correctly', () => {
      expect(pipe.transform(0)).toBe('0ms');
    });

    it('should format small values correctly', () => {
      expect(pipe.transform(50)).toBe('50ms');
      expect(pipe.transform(100)).toBe('100ms');
      expect(pipe.transform(234)).toBe('234ms');
    });

    it('should round decimal values', () => {
      expect(pipe.transform(45.3)).toBe('45ms');
      expect(pipe.transform(45.6)).toBe('46ms');
      expect(pipe.transform(99.9)).toBe('100ms');
    });

    it('should format values just under 1 second', () => {
      expect(pipe.transform(999)).toBe('999ms');
      expect(pipe.transform(999.4)).toBe('999ms');
      expect(pipe.transform(999.9)).toBe('1000ms');
    });
  });

  describe('seconds and milliseconds formatting (>= 1000ms)', () => {
    it('should format exactly 1 second', () => {
      expect(pipe.transform(1000)).toBe('1s 0ms');
    });

    it('should format whole seconds', () => {
      expect(pipe.transform(2000)).toBe('2s 0ms');
      expect(pipe.transform(5000)).toBe('5s 0ms');
      expect(pipe.transform(10000)).toBe('10s 0ms');
    });

    it('should format seconds with milliseconds', () => {
      expect(pipe.transform(1234)).toBe('1s 234ms');
      expect(pipe.transform(3045)).toBe('3s 45ms');
      expect(pipe.transform(5678)).toBe('5s 678ms');
    });

    it('should round milliseconds part', () => {
      expect(pipe.transform(1234.3)).toBe('1s 234ms');
      expect(pipe.transform(1234.6)).toBe('1s 235ms');
      expect(pipe.transform(2500.4)).toBe('2s 500ms');
      expect(pipe.transform(2500.9)).toBe('2s 501ms');
    });

    it('should format large values correctly', () => {
      expect(pipe.transform(60000)).toBe('60s 0ms');
      expect(pipe.transform(123456)).toBe('123s 456ms');
      expect(pipe.transform(999999)).toBe('999s 999ms');
    });

    it('should handle edge case where rounding ms goes to 1000', () => {
      // 1999.9 -> 1s + 999.9ms -> rounds to 1s 1000ms
      // But Math.round(999.9) = 1000
      expect(pipe.transform(1999.9)).toBe('1s 1000ms');
    });
  });

  describe('real-world scenarios', () => {
    it('should format typical API response times', () => {
      expect(pipe.transform(150)).toBe('150ms'); // Fast response
      expect(pipe.transform(850)).toBe('850ms'); // Medium response
      expect(pipe.transform(1500)).toBe('1s 500ms'); // Slow response
      expect(pipe.transform(3200)).toBe('3s 200ms'); // Very slow response
    });
  });
});
