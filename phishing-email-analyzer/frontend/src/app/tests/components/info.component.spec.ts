import { type DebugElement } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InfoComponent } from '../../components/info/info.component';

describe('InfoComponent', () => {
  let fixture: ComponentFixture<InfoComponent>;

  const util = {
    infoCard(): DebugElement {
      return fixture.debugElement.query(By.css('[data-testid="info-card"]'));
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoComponent);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render available models section', () => {
    const cardText = (util.infoCard().nativeElement as HTMLElement).textContent;

    expect(cardText).toContain('Available Models');
    expect(cardText).toContain('GPT-4.1:');
    expect(cardText).toContain('Latest OpenAI model');
    expect(cardText).toContain("Google's latest LLM with advanced understanding");
    expect(cardText).toContain('Open-source model from Mistral AI with 7 billion parameters');
    expect(cardText).toContain("Meta's LLM accessed via cloud API");
    expect(cardText).toContain('Polish language model running locally in 4-bit quantization mode');
    expect(cardText).toContain('Bielik 2 (4-bit)');
  });
});
