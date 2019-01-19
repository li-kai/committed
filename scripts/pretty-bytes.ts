/* eslint-disable no-param-reassign */
// https://github.com/sindresorhus/pretty-bytes
const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

/*
Formats the given number using `Number#toLocaleString`.
- If locale is a string, the value is expected to be a locale-key (for example: `de`).
- If locale is true, the system default locale is used for translation.
- If no value for locale is specified, the number is returned unmodified.
*/
const toLocaleString = (number: number, locale?: string | boolean): string => {
  let result;
  if (typeof locale === 'string') {
    result = number.toLocaleString(locale);
  } else if (locale === true) {
    result = number.toLocaleString();
  } else {
    result = number.toString();
  }

  return result;
};

type Options = { signed?: boolean, locale?: string | boolean }
export default (number: number, options: Options = {}) => {
  if (!Number.isFinite(number)) {
    throw new TypeError(
      `Expected a finite number, got ${typeof number}: ${number}`
    );
  }

  const opts = options;

  if (opts.signed && number === 0) {
    return ' 0 B';
  }

  const isNegative = number < 0;
  // eslint-disable-next-line no-nested-ternary
  const prefix = isNegative ? '-' : opts.signed ? '+' : '';

  if (isNegative) {
    number = -number;
  }

  if (number < 1) {
    const numberString = toLocaleString(number, opts.locale);
    return `${prefix + numberString} B`;
  }

  const exponent = Math.min(
    Math.floor(Math.log10(number) / 3),
    UNITS.length - 1
  );
  // eslint-disable-next-line no-restricted-properties
  number = Number((number / Math.pow(1000, exponent)).toPrecision(3));
  const numberString = toLocaleString(number, opts.locale);

  const unit = UNITS[exponent];

  return `${prefix + numberString} ${unit}`;
};
