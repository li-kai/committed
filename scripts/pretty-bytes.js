// https://github.com/sindresorhus/pretty-bytes
const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

/*
Formats the given number using `Number#toLocaleString`.
- If locale is a string, the value is expected to be a locale-key (for example: `de`).
- If locale is true, the system default locale is used for translation.
- If no value for locale is specified, the number is returned unmodified.
*/
const toLocaleString = (num, locale) => {
  let result;
  if (typeof locale === 'string') {
    result = num.toLocaleString(locale);
  } else if (locale === true) {
    result = num.toLocaleString();
  } else {
    result = num.toString();
  }

  return result;
};

function prettyBytes(num, options = {}) {
  if (!Number.isFinite(num)) {
    throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`);
  }

  const opts = options;

  if (opts.signed && num === 0) {
    return ' 0 B';
  }

  const isNegative = num < 0;
  const prefix = isNegative ? '-' : opts.signed ? '+' : '';

  if (isNegative) {
    num = -num;
  }

  if (num < 1) {
    const numString = toLocaleString(num, opts.locale);
    return `${prefix + numString} B`;
  }

  const exponent = Math.min(Math.floor(Math.log10(num) / 3), UNITS.length - 1);
  num = Number((num / Math.pow(1000, exponent)).toPrecision(3));
  const numberString = toLocaleString(num, opts.locale);

  const unit = UNITS[exponent];

  return `${prefix + numberString} ${unit}`;
};

module.exports = prettyBytes;
