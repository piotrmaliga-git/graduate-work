import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app';

describe('App', () => {
  const storageKey = 'app-theme-mode';

  const util = {
    routerOutlet(fixture: ComponentFixture<AppComponent>): DebugElement {
      return fixture.debugElement.query(By.css('[data-testid="app-router-outlet"]'));
    },
  };

  afterEach(() => {
    localStorage.removeItem(storageKey);
    document.documentElement.classList.remove('app-dark');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router outlet', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();

    expect(util.routerOutlet(fixture)).toBeTruthy();
  });

  it('should initialize dark mode class from local storage', () => {
    localStorage.setItem(storageKey, 'dark');

    TestBed.createComponent(AppComponent);

    expect(document.documentElement.classList.contains('app-dark')).toBe(true);
  });
});
