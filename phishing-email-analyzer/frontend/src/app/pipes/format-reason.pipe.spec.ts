import { TestBed } from '@angular/core/testing';
import { FormatReasonPipe } from './format-reason.pipe';

function getHtmlString(safeHtml: any): string {
  if (typeof safeHtml === 'string') {
    return safeHtml;
  }

  return safeHtml.changingThisBreaksApplicationSecurity || safeHtml.toString();
}

describe('FormatReasonPipe', () => {
  let pipe: FormatReasonPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormatReasonPipe],
    });
    pipe = TestBed.inject(FormatReasonPipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('null/undefined/empty values', () => {
    it('should return default message for null value', () => {
      const result = pipe.transform(null);
      expect(result).toBe('No additional justification.');
    });

    it('should return default message for undefined value', () => {
      const result = pipe.transform(undefined);
      expect(result).toBe('No additional justification.');
    });

    it('should return default message for empty string', () => {
      const result = pipe.transform('');
      expect(result).toBe('No additional justification.');
    });
  });

  describe('bold text formatting', () => {
    it('should convert **bold** markdown to HTML strong tags', () => {
      const input = 'This is **bold text** in a sentence.';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain('<strong class="font-semibold text-gray-900">bold text</strong>');
    });

    it('should convert multiple **bold** occurrences', () => {
      const input = '**First bold** and **second bold** text.';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain('<strong class="font-semibold text-gray-900">First bold</strong>');
      expect(html).toContain('<strong class="font-semibold text-gray-900">second bold</strong>');
    });

    it('should handle text without bold markers', () => {
      const input = 'Plain text without any formatting.';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain('Plain text without any formatting.');
    });
  });

  describe('numbered list formatting', () => {
    it('should wrap numbered bold headings in a block and keep the description', () => {
      const input = '1. **Header**: Description';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toBe(
        '<div class="mt-3 mb-1"><span class="font-bold text-primary">1.</span> <strong class="font-semibold text-gray-900">Header</strong>:</div> Description'
      );
    });

    it('should style every numbered item at the start of a line', () => {
      const input = '1. Regular item\n2. Another item';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain('<span class="font-bold text-primary">1.</span>');
      expect(html).toContain('<span class="font-bold text-primary">2.</span>');
    });

    it('should support multi-digit numbered items', () => {
      const input = '12. Twelfth item';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain('<span class="font-bold text-primary">12.</span> Twelfth item');
    });

    it('should support multi-digit numbered headings', () => {
      const input = '12. **Header**: Description';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toBe(
        '<div class="mt-3 mb-1"><span class="font-bold text-primary">12.</span> <strong class="font-semibold text-gray-900">Header</strong>:</div> Description'
      );
    });

    it('should accept more than one space after the numbered heading marker', () => {
      const input = '3.  **Header**: Description';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toBe(
        '<div class="mt-3 mb-1"><span class="font-bold text-primary">3.</span> <strong class="font-semibold text-gray-900">Header</strong>:</div> Description'
      );
    });

    it('should wrap numbered headings even when the bold heading has no colon', () => {
      const input = '4. **Header** Description';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toBe(
        '<div class="mt-3 mb-1"><span class="font-bold text-primary">4.</span> <strong class="font-semibold text-gray-900">Header</strong></div> Description'
      );
    });

    it('should keep multi-digit headings as plain numbered items when the heading marker is malformed', () => {
      const input = '12. **Header*: Description';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toBe('<span class="font-bold text-primary">12.</span> **Header*: Description');
    });

    it('should not style numbers that are not at the start of a line', () => {
      const input = 'Prefix 2. **Header** should stay inline';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain(
        'Prefix 2. <strong class="font-semibold text-gray-900">Header</strong> should stay inline'
      );
      expect(html).not.toContain('<div class="mt-3 mb-1">');
      expect(html).not.toContain('<span class="font-bold text-primary">2.</span>');
    });

    it('should not treat a numbered item as a heading when there is no space between the dot and bold marker', () => {
      const input = '1.**Bold**';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).not.toContain('<div class="mt-3 mb-1">');
      expect(html).toBe(
        '<span class="font-bold text-primary">1.</span><strong class="font-semibold text-gray-900">Bold</strong>'
      );
    });

    it('should not treat a numbered item as a heading when bold does not start at the first non-space position', () => {
      const input = '1. abc**def**';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).not.toContain('<div class="mt-3 mb-1">');
      expect(html).toBe(
        '<span class="font-bold text-primary">1.</span> abc<strong class="font-semibold text-gray-900">def</strong>'
      );
    });

    it('should not treat a numbered item as a heading when the bold marker is never closed', () => {
      const input = '1. **Unclosed';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).not.toContain('<div class="mt-3 mb-1">');
      expect(html).toBe('<span class="font-bold text-primary">1.</span> **Unclosed');
    });

    it('should not treat a numbered item as a heading when the heading text is empty', () => {
      const input = '1. ****';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).not.toContain('<div class="mt-3 mb-1">');
      expect(html).toBe('<span class="font-bold text-primary">1.</span> ****');
    });

    it('should not treat a numbered item as a heading when the heading text contains an asterisk', () => {
      const input = '1. **A*B**';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).not.toContain('<div class="mt-3 mb-1">');
      expect(html).toBe(
        '<span class="font-bold text-primary">1.</span> <strong class="font-semibold text-gray-900">A*B</strong>'
      );
    });

    it('should format a numbered item whose number is 9', () => {
      const input = '9. item';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain('<span class="font-bold text-primary">9.</span> item');
    });

    it('should format a numbered item whose number contains the digit 0', () => {
      const input = '10. item';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain('<span class="font-bold text-primary">10.</span> item');
    });

    it('should not style a line as a numbered item when digits are not followed by a dot', () => {
      const result = pipe.transform('1X');
      expect(getHtmlString(result)).toBe('1X');
    });

    it('should not style a line as a numbered item when it starts with a dot but no leading digit', () => {
      const result = pipe.transform('.item');
      expect(getHtmlString(result)).toBe('.item');
    });

    it('should not style a line as a numbered item when it starts with a non-digit character followed by a dot', () => {
      const result = pipe.transform(':. item');
      expect(getHtmlString(result)).toBe(':. item');
    });
  });

  describe('line break conversion', () => {
    it('should convert newline characters to <br> tags', () => {
      const input = 'Line 1\nLine 2\nLine 3';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain('Line 1<br>Line 2<br>Line 3');
    });

    it('should handle multiple consecutive newlines', () => {
      const input = 'Paragraph 1\n\nParagraph 2';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain('<br><br>');
    });
  });

  describe('complex formatting combinations', () => {
    it('should handle bold text with numbered lists', () => {
      const input = '1. **Urgency**: Creates pressure\n2. **Suspicious Link**: Not legitimate';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain(
        '<div class="mt-3 mb-1"><span class="font-bold text-primary">1.</span> <strong class="font-semibold text-gray-900">Urgency</strong>:</div> Creates pressure'
      );
      expect(html).toContain(
        '<div class="mt-3 mb-1"><span class="font-bold text-primary">2.</span> <strong class="font-semibold text-gray-900">Suspicious Link</strong>:</div> Not legitimate'
      );
      expect(html).toContain('<strong class="font-semibold text-gray-900">Urgency</strong>');
      expect(html).toContain(
        '<strong class="font-semibold text-gray-900">Suspicious Link</strong>'
      );
      expect(html).toContain('<br>');
    });

    it('should handle real-world phishing analysis text', () => {
      const input = `This email exhibits several red flags:

1. **Urgency and Threats**: The message creates urgency.
2. **Suspicious Link**: The provided link is not legitimate.
3. **Request for Sensitive Information**: Asks for credentials.

All these factors indicate phishing.`;

      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain(
        '<strong class="font-semibold text-gray-900">Urgency and Threats</strong>'
      );
      expect(html).toContain(
        '<strong class="font-semibold text-gray-900">Suspicious Link</strong>'
      );
      expect(html).toContain(
        '<strong class="font-semibold text-gray-900">Request for Sensitive Information</strong>'
      );
      expect(html).toContain('<br>');
      expect(html).toContain(
        '<div class="mt-3 mb-1"><span class="font-bold text-primary">1.</span> <strong class="font-semibold text-gray-900">Urgency and Threats</strong>:</div> The message creates urgency.'
      );
      expect(html).toContain(
        '<div class="mt-3 mb-1"><span class="font-bold text-primary">2.</span> <strong class="font-semibold text-gray-900">Suspicious Link</strong>:</div> The provided link is not legitimate.'
      );
      expect(html).toContain(
        '<div class="mt-3 mb-1"><span class="font-bold text-primary">3.</span> <strong class="font-semibold text-gray-900">Request for Sensitive Information</strong>:</div> Asks for credentials.'
      );
    });

    it('should format additional bold text after a numbered heading', () => {
      const input = '3. **Evidence**: Contains **multiple** warning signs';
      const result = pipe.transform(input);
      const html = getHtmlString(result);

      expect(html).toContain(
        '<div class="mt-3 mb-1"><span class="font-bold text-primary">3.</span> <strong class="font-semibold text-gray-900">Evidence</strong>:</div> Contains <strong class="font-semibold text-gray-900">multiple</strong> warning signs'
      );
    });
  });

  describe('security', () => {
    it('should return SafeHtml type for valid input', () => {
      const input = 'Test text with **bold**';
      const result = pipe.transform(input);

      // SafeHtml objects are truthy and have specific internal structure
      expect(result).toBeDefined();
      expect(result).toBeTruthy();
    });

    it('should safely handle HTML-like content in input', () => {
      const input = 'Text with <script>alert("xss")</script> attempt';
      const result = pipe.transform(input);

      // Should still process the text
      expect(result).toBeDefined();
    });
  });
});
