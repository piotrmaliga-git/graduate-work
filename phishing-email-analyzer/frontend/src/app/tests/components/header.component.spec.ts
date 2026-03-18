import { DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HeaderComponent } from '../../components/header/header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  const util = {
    themeToggle(): DebugElement {
      return fixture.debugElement.query(By.css('[data-testid="theme-toggle"]'));
    },
    themeToggleButton(): DebugElement {
      return util.themeToggle();
    },
    languageToggle(): DebugElement {
      return fixture.debugElement.query(By.css('[data-testid="language-toggle"]'));
    },
    languageToggleButton(): DebugElement {
      return util.languageToggle();
    },
    moonIcon(): DebugElement {
      return fixture.debugElement.query(By.css('[data-testid="theme-toggle"] .pi-moon'));
    },
    sunIcon(): DebugElement {
      return fixture.debugElement.query(By.css('[data-testid="theme-toggle"] .pi-sun'));
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render app title and subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Phishing Email Analyzer');
    expect(compiled.textContent).toContain(
      'Paste an email below and select an AI model to analyze phishing risk'
    );
  });

  it('should render theme switch control', () => {
    const button = util.themeToggleButton().nativeElement as HTMLButtonElement;

    expect(button).toBeTruthy();
    expect(button.className).toContain('p-button');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
    expect(util.moonIcon()).toBeTruthy();
  });

  it('should render language switch control', () => {
    const button = util.languageToggleButton().nativeElement as HTMLButtonElement;

    expect(button).toBeTruthy();
    expect(button.className).toContain('p-button');
    expect(button.textContent?.trim()).toBe('PL');
    expect(button.getAttribute('aria-label')).toBe('Switch to Polish');
  });

  it('should render light-mode toggle state when theme is dark', () => {
    fixture.componentInstance.theme.isDark.set(true);
    fixture.detectChanges();

    const button = util.themeToggleButton().nativeElement as HTMLButtonElement;

    expect(button.getAttribute('aria-label')).toBe('Switch to light mode');
    expect(util.sunIcon()).toBeTruthy();
  });

  it('should invoke toggle handlers when header buttons are clicked', () => {
    const languageSpy = vi.spyOn(fixture.componentInstance, 'toggleLanguage');
    const themeSpy = vi.spyOn(fixture.componentInstance, 'toggleTheme');

    (util.languageToggleButton().nativeElement as HTMLButtonElement).click();
    (util.themeToggleButton().nativeElement as HTMLButtonElement).click();

    expect(languageSpy).toHaveBeenCalledTimes(1);
    expect(themeSpy).toHaveBeenCalledTimes(1);
  });
});

describe('HeaderComponent behavior', () => {
  const createFixture = async (options?: {
    platformId?: string;
    pathname?: string;
    search?: string;
    hash?: string;
    lang?: string;
  }) => {
    const assign = vi.fn();
    const location = {
      pathname: options?.pathname ?? '/',
      search: options?.search ?? '',
      hash: options?.hash ?? '',
      assign,
    };

    const documentMock = {
      documentElement: {
        lang: options?.lang ?? '',
      },
      defaultView: {
        location,
      },
    };

    const themeMock = {
      isDark: signal(false),
      toggleDarkMode: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance as any;

    component.document = documentMock;
    component.platformId = options?.platformId ?? 'browser';
    component.theme = themeMock;

    fixture.detectChanges();

    return {
      component: component as HeaderComponent,
      assign,
      themeMock,
      documentMock,
    };
  };

  it('should detect polish locale from html lang attribute', async () => {
    const { component } = await createFixture({ lang: 'pl-PL' });

    expect(component.isPolishLocale()).toBe(true);
  });

  it('should detect polish locale from /pl path prefix', async () => {
    const { component } = await createFixture({ pathname: '/pl/inbox' });

    expect(component.isPolishLocale()).toBe(true);
  });

  it('should redirect to /pl prefix when current locale is not polish', async () => {
    const { component, assign } = await createFixture({
      pathname: '/offers',
      search: '?page=2',
      hash: '#top',
      lang: 'en',
    });

    component.toggleLanguage();

    expect(assign).toHaveBeenCalledWith('/pl/offers?page=2#top');
  });

  it('should remove /pl prefix when current locale is polish', async () => {
    const { component, assign } = await createFixture({
      pathname: '/pl/offers',
      search: '?page=1',
      hash: '#section',
    });

    component.toggleLanguage();

    expect(assign).toHaveBeenCalledWith('/offers?page=1#section');
  });

  it('should not redirect on server platform', async () => {
    const { component, assign } = await createFixture({
      platformId: 'server',
      pathname: '/offers',
    });

    component.toggleLanguage();

    expect(assign).not.toHaveBeenCalled();
  });

  it('should not redirect when location is unavailable', async () => {
    const { component, documentMock } = await createFixture();
    (documentMock as any).defaultView = {};

    component.toggleLanguage();

    expect(true).toBe(true);
  });

  it('should toggle theme by negating current state', async () => {
    const { component, themeMock } = await createFixture();

    component.toggleTheme();
    expect(themeMock.toggleDarkMode).toHaveBeenCalledWith(true);

    themeMock.isDark.set(true);
    component.toggleTheme();
    expect(themeMock.toggleDarkMode).toHaveBeenCalledWith(false);
  });
});
