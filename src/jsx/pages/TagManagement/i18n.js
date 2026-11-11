/**
 * Language of Tag Management: English or French, as chosen in the header (`_lang`).
 * The header reloads the page when the language changes, so reading it at render time is enough.
 *
 * tr('Some text')                    → the French text from TagManagementTranslation.js, or the English text
 * tr('{n} tags assigned', { n: 5 })  → values replace {name} placeholders
 * Text missing from the French list simply stays in English.
 */
import moment from 'moment';
import 'moment/locale/fr';
import { translations, messagePatterns } from './TagManagementTranslation';

// Loading the French dates switches moment's global language; put the dashboard's default back
moment.locale('en');

export const getLanguage = () => {
  try {
    return localStorage.getItem('_lang') === 'fr' ? 'fr' : 'en';
  } catch (e) {
    return 'en';
  }
};

const fill = (text, values) => (values
  ? String(text).replace(/\{(\w+)\}/g, (match, key) => (values[key] !== undefined && values[key] !== null ? values[key] : match))
  : text);

export const tr = (text, values) => {
  const lang = getLanguage();
  const list = translations[lang] || {};
  if (Object.prototype.hasOwnProperty.call(list, text)) return fill(list[text], values);
  // Server messages that contain names or numbers: matched by pattern ($1, $2… are the parts kept)
  const pattern = (messagePatterns[lang] || []).find(([regex]) => regex.test(String(text)));
  if (pattern) return String(text).replace(pattern[0], pattern[1]);
  return fill(text, values);
};

/** moment in the chosen language (month and day names), without changing other pages. */
export const localMoment = (value) => moment(value).locale(getLanguage());
