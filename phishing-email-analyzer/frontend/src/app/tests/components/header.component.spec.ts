import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from '../../components/header/header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

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
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('[data-testid="theme-toggle"]') as HTMLButtonElement;

    expect(button).toBeTruthy();
    expect(button.className).toContain('p-button');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
    expect(button.querySelector('.pi-moon')).toBeTruthy();
  });

  it('should render language switch control', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('[data-testid="language-toggle"]') as HTMLButtonElement;

    expect(button).toBeTruthy();
    expect(button.className).toContain('p-button');
    expect(button.textContent?.trim()).toBe('PL');
    expect(button.getAttribute('aria-label')).toBe('Switch to Polish');
  });
});
