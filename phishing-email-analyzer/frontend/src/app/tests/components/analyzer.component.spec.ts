import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyzerComponent } from '../../components/analyzer/analyzer.component';

describe('AnalyzerComponent', () => {
  let fixture: ComponentFixture<AnalyzerComponent>;
  let component: AnalyzerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyzerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyzerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose expected models list', () => {
    expect(component.models.length).toBe(5);
    expect(component.models.map((model) => model.id)).toContain('gpt-4.1');
    expect(component.models.map((model) => model.id)).toContain('bielik-2-4bit');
  });

  it('should set internal error and not emit when email text is empty', () => {
    const emitSpy = vi.spyOn(component.analyzeRequest, 'emit');

    component.emailText.set('   ');
    component.onAnalyze();

    expect(component.internalError()).toBe('Please enter email text');
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit analyze request for valid input and trim sender', () => {
    const emitSpy = vi.spyOn(component.analyzeRequest, 'emit');

    component.emailText.set('Important email content');
    component.selectedModel.set('gpt-4.1');
    component.sender.set('  sender@example.com  ');

    component.onAnalyze();

    expect(emitSpy).toHaveBeenCalledWith({
      emailText: 'Important email content',
      selectedModel: 'gpt-4.1',
      sender: 'sender@example.com',
      title: '',
    });
  });

  it('should trim title before emitting analyze request', () => {
    const emitSpy = vi.spyOn(component.analyzeRequest, 'emit');

    component.emailText.set('Important email content');
    component.title.set('  Urgent action required  ');

    component.onAnalyze();

    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Urgent action required' })
    );
  });

  it('should clear all editable fields and internal error', () => {
    component.emailText.set('Body');
    component.sender.set('sender@example.com');
    component.internalError.set('Some error');

    component.clear();

    expect(component.emailText()).toBe('');
    expect(component.sender()).toBe('');
    expect(component.internalError()).toBe('');
  });

  it('should render external error message when error input is provided', () => {
    fixture.componentRef.setInput('error', 'Backend unavailable');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Backend unavailable');
  });

  it('should disable form controls and show loading label when loading is true', async () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentInstance.emailText.set('Some content');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('#model-select') as HTMLSelectElement;
    const senderInput = compiled.querySelector('#sender-input') as HTMLInputElement;
    const titleInput = compiled.querySelector('#title-input') as HTMLInputElement;
    const textarea = compiled.querySelector('#email-input') as HTMLTextAreaElement;
    const buttons = compiled.querySelectorAll('button');

    expect(select.disabled).toBe(true);
    expect(senderInput.disabled).toBe(true);
    expect(titleInput.disabled).toBe(true);
    expect(textarea.disabled).toBe(true);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
    expect(buttons[0].textContent).toContain('Analyzing...');
  });

  it('should disable analyze button when email text has only whitespace', () => {
    component.emailText.set('   ');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const analyzeButton = compiled.querySelectorAll('button')[0] as HTMLButtonElement;

    expect(analyzeButton.disabled).toBe(true);
  });

  it('should render all model options', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const options = compiled.querySelectorAll('#model-select option');

    expect(options.length).toBe(component.models.length);
    expect(Array.from(options).map((option) => option.textContent?.trim())).toContain('GPT-4.1');
    expect(Array.from(options).map((option) => option.textContent?.trim())).toContain(
      'Bielik 2 (4-bit)'
    );
  });

  it('should update model and text fields via DOM events', async () => {
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('#model-select') as HTMLSelectElement;
    const senderInput = compiled.querySelector('#sender-input') as HTMLInputElement;
    const titleInput = compiled.querySelector('#title-input') as HTMLInputElement;
    const textarea = compiled.querySelector('#email-input') as HTMLTextAreaElement;

    select.value = 'mistral-7b';
    select.dispatchEvent(new Event('change'));

    senderInput.value = 'author@example.com';
    senderInput.dispatchEvent(new Event('input'));

    titleInput.value = 'Monthly update';
    titleInput.dispatchEvent(new Event('input'));

    textarea.value = 'Example body';
    textarea.dispatchEvent(new Event('input'));

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.selectedModel()).toBe('mistral-7b');
    expect(component.sender()).toBe('author@example.com');
    expect(component.title()).toBe('Monthly update');
    expect(component.emailText()).toBe('Example body');
    expect(compiled.textContent).toContain('12 characters');
  });

  it('should keep controls enabled and show Analyze label when not loading', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.componentInstance.emailText.set('Example body');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('#model-select') as HTMLSelectElement;
    const senderInput = compiled.querySelector('#sender-input') as HTMLInputElement;
    const titleInput = compiled.querySelector('#title-input') as HTMLInputElement;
    const textarea = compiled.querySelector('#email-input') as HTMLTextAreaElement;
    const analyzeButton = compiled.querySelectorAll('button')[0] as HTMLButtonElement;

    expect(select.disabled).toBe(false);
    expect(senderInput.disabled).toBe(false);
    expect(titleInput.disabled).toBe(false);
    expect(textarea.disabled).toBe(false);
    expect(analyzeButton.disabled).toBe(false);
    expect(analyzeButton.textContent).toContain('Analyze');
  });

  it('should not render external error block when error input is empty', () => {
    fixture.componentRef.setInput('error', '');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('❌');
  });
});
