const CURRENCY_LOCALE = {
  MAD: 'fr-MA', EUR: 'fr-FR', USD: 'en-US', GBP: 'en-GB', CAD: 'en-CA',
  CHF: 'fr-CH', TND: 'fr-TN', DZD: 'fr-DZ', XOF: 'fr-SN',
};
const CURRENCY_SYMBOLS = {
  MAD: 'DH', EUR: '€', USD: '$', GBP: '£', CAD: 'CA$',
  CHF: 'Fr', TND: 'DT', DZD: 'DA', XOF: 'CFA',
};

const CURRENCY_AS_SYMBOL = ['MAD', 'TND', 'DZD', 'XOF'];

export const formatCurrency = (amount, currency = 'MAD') => {
  if (amount === null || amount === undefined) return `${CURRENCY_SYMBOLS[currency] || currency} 0,00`;
  try {
    const locale = CURRENCY_LOCALE[currency] || 'fr-FR';
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    if (CURRENCY_AS_SYMBOL.includes(currency)) {
      return new Intl.NumberFormat(locale, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ` ${symbol}`;
    }
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch {
    return `${CURRENCY_SYMBOLS[currency] || currency} ${Number(amount).toFixed(2)}`;
  }
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(date));
};

export const formatTime = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
};

export const getInitials = (name) => {
  return name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const truncate = (str, len = 50) => str?.length > len ? str.slice(0, len) + '...' : str;
