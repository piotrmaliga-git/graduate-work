export type LocaleCode = 'en' | 'pl';

export type NumberedHeadingMatch = {
  number: string;
  heading: string;
  punctuation: '' | ':';
  rest: string;
};

export type NumberedItemMatch = {
  number: string;
  rest: string;
};
