import { Pipe, type PipeTransform, inject } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { pipesTranslations } from '../utils/translations/translations';
import { type NumberedHeadingMatch, type NumberedItemMatch } from '../utils/types/types';

@Pipe({
  name: 'formatReason',
})
export class FormatReasonPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly boldClass = 'font-semibold text-gray-900';
  private readonly numberClass = 'font-bold text-primary';

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return pipesTranslations['noReason'];
    }

    const formatted = value
      .split('\n')
      .map((line) => this.formatLine(line))
      .join('<br>');

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  private formatLine(line: string): string {
    const numberedHeading = this.parseNumberedHeading(line);
    if (numberedHeading) {
      const { number, heading, punctuation, rest } = numberedHeading;
      const formattedRest = this.formatBoldText(rest);

      return `<div class="mt-3 mb-1"><span class="${this.numberClass}">${number}.</span> <strong class="${this.boldClass}">${heading}</strong>${punctuation}</div>${formattedRest}`;
    }

    const numberedItem = this.parseNumberedItem(line);
    if (numberedItem) {
      const { number, rest } = numberedItem;
      return `<span class="${this.numberClass}">${number}</span>${this.formatBoldText(rest)}`;
    }

    return this.formatBoldText(line);
  }

  private parseNumberedHeading(line: string): NumberedHeadingMatch | null {
    const prefix = this.parseNumberedItem(line);
    if (!prefix || !prefix.rest.startsWith(' ')) {
      return null;
    }

    const restWithoutNumber = prefix.rest;
    let headingStart = 0;

    while (restWithoutNumber[headingStart] === ' ') {
      headingStart += 1;
    }

    if (headingStart === 0 || !restWithoutNumber.startsWith('**', headingStart)) {
      return null;
    }

    const headingTextStart = headingStart + 2;
    const headingEnd = restWithoutNumber.indexOf('**', headingTextStart);
    if (headingEnd === -1) {
      return null;
    }

    const heading = restWithoutNumber.slice(headingTextStart, headingEnd);
    if (!heading || heading.includes('*')) {
      return null;
    }

    const suffix = restWithoutNumber.slice(headingEnd + 2);
    const punctuation = suffix.startsWith(':') ? ':' : '';
    const rest = punctuation ? suffix.slice(1) : suffix;

    return {
      number: prefix.number.slice(0, -1),
      heading,
      punctuation,
      rest,
    };
  }

  private parseNumberedItem(line: string): NumberedItemMatch | null {
    let numberEnd = 0;

    while (numberEnd < line.length && this.isDigit(line[numberEnd])) {
      numberEnd += 1;
    }

    if (numberEnd === 0 || line[numberEnd] !== '.') {
      return null;
    }

    return {
      number: line.slice(0, numberEnd + 1),
      rest: line.slice(numberEnd + 1),
    };
  }

  private isDigit(character: string | undefined): boolean {
    return character !== undefined && character >= '0' && character <= '9';
  }

  private formatBoldText(value: string): string {
    return value.replaceAll(/\*\*(.+?)\*\*/g, `<strong class="${this.boldClass}">$1</strong>`);
  }
}
