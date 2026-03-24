import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { Theme } from '../utils/enums/enums';

describe('ThemeService', () => {
  const storageKey = 'app-theme-mode';

  const createService = (options?: {
    platformId?: string;
    classListToggle?: ReturnType<typeof vi.fn>;
  }) => {
    const classListToggle = options?.classListToggle ?? vi.fn();
    const documentMock = {
      documentElement: {
        classList: {
          toggle: classListToggle,
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: DOCUMENT, useValue: documentMock },
        { provide: PLATFORM_ID, useValue: options?.platformId ?? 'browser' },
      ],
    });

    const service = TestBed.inject(ThemeService);
    return { service, classListToggle };
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should create the service', () => {
    const { service } = createService();

    expect(service).toBeTruthy();
  });

  it('should initialize dark mode from saved storage value', () => {
    localStorage.setItem(storageKey, Theme.dark);
    const setItemSpy = vi.spyOn(localStorage, 'setItem');

    const { service, classListToggle } = createService();

    expect(service.isDark()).toBe(true);
    expect(classListToggle).toHaveBeenCalledWith('app-dark', true);
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('should initialize light mode from saved storage value', () => {
    localStorage.setItem(storageKey, Theme.light);

    const { service, classListToggle } = createService();

    expect(service.isDark()).toBe(false);
    expect(classListToggle).toHaveBeenCalledWith('app-dark', false);
  });

  it('should initialize from matchMedia when storage has no value', () => {
    const originalMatchMedia = globalThis.matchMedia;
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    } as MediaQueryList);
    Object.defineProperty(globalThis, 'matchMedia', {
      value: matchMediaMock,
      configurable: true,
      writable: true,
    });

    const { service } = createService();

    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(service.isDark()).toBe(true);

    Object.defineProperty(globalThis, 'matchMedia', {
      value: originalMatchMedia,
      configurable: true,
      writable: true,
    });
  });

  it('should fallback to light mode when matchMedia is unavailable', () => {
    const originalMatchMedia = globalThis.matchMedia;
    Object.defineProperty(globalThis, 'matchMedia', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const { service } = createService();

    expect(service.isDark()).toBe(false);

    Object.defineProperty(globalThis, 'matchMedia', {
      value: originalMatchMedia,
      configurable: true,
      writable: true,
    });
  });

  it('should persist dark mode when toggled in browser', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { service, classListToggle } = createService();

    service.toggleDarkMode(true);

    expect(service.isDark()).toBe(true);
    expect(classListToggle).toHaveBeenLastCalledWith('app-dark', true);
    expect(setItemSpy).toHaveBeenCalledWith(storageKey, Theme.dark);
  });

  it('should persist light mode when toggled in browser', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { service, classListToggle } = createService();

    service.toggleDarkMode(false);

    expect(service.isDark()).toBe(false);
    expect(classListToggle).toHaveBeenLastCalledWith('app-dark', false);
    expect(setItemSpy).toHaveBeenCalledWith(storageKey, Theme.light);
  });

  it('should not persist mode on server platform', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { service } = createService({ platformId: 'server' });

    service.toggleDarkMode(true);

    expect(service.isDark()).toBe(true);
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('should initialize to light mode on server platform even when matchMedia prefers dark', () => {
    const originalMatchMedia = globalThis.matchMedia;
    Object.defineProperty(globalThis, 'matchMedia', {
      value: vi.fn().mockReturnValue({ matches: true } as MediaQueryList),
      configurable: true,
      writable: true,
    });

    const { service } = createService({ platformId: 'server' });

    expect(service.isDark()).toBe(false);

    Object.defineProperty(globalThis, 'matchMedia', {
      value: originalMatchMedia,
      configurable: true,
      writable: true,
    });
  });

  it('should prefer stored light theme over matchMedia dark preference', () => {
    localStorage.setItem(storageKey, Theme.light);
    const originalMatchMedia = globalThis.matchMedia;
    Object.defineProperty(globalThis, 'matchMedia', {
      value: vi.fn().mockReturnValue({ matches: true } as MediaQueryList),
      configurable: true,
      writable: true,
    });

    const { service } = createService();

    expect(service.isDark()).toBe(false);

    Object.defineProperty(globalThis, 'matchMedia', {
      value: originalMatchMedia,
      configurable: true,
      writable: true,
    });
  });
});
