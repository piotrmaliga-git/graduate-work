import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsComponent } from '../../components/results/results.component';
import { AnalysisResult } from '../../models/prediction';

describe('ResultsComponent', () => {
  let fixture: ComponentFixture<ResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsComponent);
  });

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render analysis block when result is null', () => {
    fixture.componentRef.setInput('result', null);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')).toBeNull();
  });

  it('should render analysis details when result is provided', () => {
    const result: AnalysisResult = {
      model: 'gpt-4.1',
      prediction: 'phishing',
      reason: 'Suspicious URL domain',
      timestamp: '2026-03-03T11:00:00Z',
      sender: 'attacker@example.com',
      title: 'Urgent Account Verification',
      response_time_ms: 1234,
    };

    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Analysis Result');
    expect(compiled.textContent).toContain('gpt-4.1');
    expect(compiled.textContent).toContain('attacker@example.com');
    expect(compiled.textContent).toContain('PHISHING');
    expect(compiled.textContent).toContain('Suspicious URL domain');
  });

  it('should render formatted frontend response time when frontend_time_ms is present', () => {
    const result: AnalysisResult = {
      model: 'gpt-4.1',
      prediction: 'phishing',
      reason: 'Suspicious URL domain',
      timestamp: '2026-03-03T11:00:00Z',
      sender: 'attacker@example.com',
      title: 'Urgent Account Verification',
      response_time_ms: 1234,
      frontend_time_ms: 250,
    };

    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Total Response Time');
    expect(compiled.textContent).toContain('250ms');
  });

  it('should not render frontend response time row when frontend_time_ms is missing', () => {
    const result: AnalysisResult = {
      model: 'gpt-4.1',
      prediction: 'legit',
      reason: 'Normal message',
      timestamp: '2026-03-03T11:00:00Z',
      sender: 'sender@example.com',
      title: 'Newsletter',
      response_time_ms: 567,
    };

    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Total Response Time');
  });

  it('should apply phishing style class for phishing prediction', () => {
    const result: AnalysisResult = {
      model: 'gpt-4.1',
      prediction: 'phishing',
      reason: 'Suspicious URL domain',
      timestamp: '2026-03-03T11:00:00Z',
      sender: 'attacker@example.com',
      title: 'Urgent Account Verification',
      response_time_ms: 1234,
    };

    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const predictionBadge = compiled.querySelector('.font-bold.rounded') as HTMLElement;

    expect(predictionBadge.className).toContain('text-danger');
    expect(predictionBadge.className).toContain('bg-red-100');
  });

  it('should apply legit style class for legit prediction', () => {
    const result: AnalysisResult = {
      model: 'gpt-4.1',
      prediction: 'legit',
      reason: 'Looks fine',
      timestamp: '2026-03-03T11:00:00Z',
      sender: 'sender@example.com',
      title: 'Newsletter',
      response_time_ms: 500,
    };

    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const predictionBadge = compiled.querySelector('.font-bold.rounded') as HTMLElement;

    expect(predictionBadge.className).toContain('text-success');
    expect(predictionBadge.className).toContain('bg-green-100');
  });

  it('should render fallback reason when reason is empty', () => {
    const result: AnalysisResult = {
      model: 'gpt-4.1',
      prediction: 'legit',
      reason: '',
      timestamp: '2026-03-03T11:00:00Z',
      sender: 'sender@example.com',
      title: 'Newsletter',
      response_time_ms: 567,
    };

    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Brak dodatkowego uzasadnienia.');
  });
});
