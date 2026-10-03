/**
 * HCE (Harrington, Cox & Evans) phoneme inventory for classroom activities.
 * Multi-character symbols (tʃ, dʒ, æɪ, …) are single phoneme units.
 */

export const PHONEMES = [
  // Consonants — stops
  { symbol: "p", category: "consonant", group: "stops", example: "pin", hint: "P as in pin" },
  { symbol: "t", category: "consonant", group: "stops", example: "tin", hint: "T as in tin" },
  { symbol: "k", category: "consonant", group: "stops", example: "kin", hint: "K as in kin" },
  { symbol: "b", category: "consonant", group: "stops", example: "bin", hint: "B as in bin" },
  { symbol: "d", category: "consonant", group: "stops", example: "din", hint: "D as in din" },
  { symbol: "g", category: "consonant", group: "stops", example: "give", hint: "G as in give" },

  // Consonants — nasals
  { symbol: "n", category: "consonant", group: "nasals", example: "no", hint: "N as in no" },
  { symbol: "m", category: "consonant", group: "nasals", example: "me", hint: "M as in me" },
  { symbol: "ŋ", category: "consonant", group: "nasals", example: "ring", hint: "NG as in ring" },

  // Consonants — fricatives
  { symbol: "f", category: "consonant", group: "fricatives", example: "fan", hint: "F as in fan" },
  { symbol: "s", category: "consonant", group: "fricatives", example: "sun", hint: "S as in sun" },
  { symbol: "θ", category: "consonant", group: "fricatives", example: "thin", hint: "TH as in thin" },
  { symbol: "ʃ", category: "consonant", group: "fricatives", example: "ship", hint: "SH as in ship" },
  { symbol: "v", category: "consonant", group: "fricatives", example: "van", hint: "V as in van" },
  { symbol: "z", category: "consonant", group: "fricatives", example: "zoo", hint: "Z as in zoo" },
  { symbol: "ð", category: "consonant", group: "fricatives", example: "then", hint: "TH as in then" },
  { symbol: "ʒ", category: "consonant", group: "fricatives", example: "measure", hint: "ZH as in measure" },
  { symbol: "h", category: "consonant", group: "fricatives", example: "hat", hint: "H as in hat" },

  // Consonants — approximants
  { symbol: "l", category: "consonant", group: "approximants", example: "lip", hint: "L as in lip" },
  { symbol: "ɹ", category: "consonant", group: "approximants", example: "run", hint: "R as in run" },
  { symbol: "w", category: "consonant", group: "approximants", example: "win", hint: "W as in win" },
  { symbol: "j", category: "consonant", group: "approximants", example: "yes", hint: "Y as in yes" },

  // Consonants — affricates
  { symbol: "tʃ", category: "consonant", group: "affricates", example: "chin", hint: "CH as in chin" },
  { symbol: "dʒ", category: "consonant", group: "affricates", example: "jam", hint: "J as in jam" },

  // Vowels — monophthongs
  { symbol: "iː", category: "vowel", group: "monophthongs", example: "sheep", hint: "EE as in sheep" },
  { symbol: "ɪ", category: "vowel", group: "monophthongs", example: "ship", hint: "I as in ship" },
  { symbol: "e", category: "vowel", group: "monophthongs", example: "bed", hint: "E as in bed" },
  { symbol: "eː", category: "vowel", group: "monophthongs", example: "haired", hint: "AIR as in haired" },
  { symbol: "æ", category: "vowel", group: "monophthongs", example: "bad", hint: "A as in bad" },
  { symbol: "ɐ", category: "vowel", group: "monophthongs", example: "bud", hint: "U as in bud" },
  { symbol: "ɐː", category: "vowel", group: "monophthongs", example: "bark", hint: "AR as in bark" },
  { symbol: "ɜː", category: "vowel", group: "monophthongs", example: "bird", hint: "IR as in bird" },
  { symbol: "ʉː", category: "vowel", group: "monophthongs", example: "boot", hint: "OO as in boot" },
  { symbol: "ɔ", category: "vowel", group: "monophthongs", example: "pot", hint: "O as in pot" },
  { symbol: "oː", category: "vowel", group: "monophthongs", example: "caught", hint: "OR as in caught" },
  { symbol: "ʊ", category: "vowel", group: "monophthongs", example: "book", hint: "OO as in book" },
  { symbol: "ə", category: "vowel", group: "monophthongs", example: "about", hint: "schwa as in about" },

  // Vowels — diphthongs
  { symbol: "æɪ", category: "vowel", group: "diphthongs", example: "bait", hint: "AY as in bait" },
  { symbol: "ɑe", category: "vowel", group: "diphthongs", example: "bike", hint: "I as in bike" },
  { symbol: "oɪ", category: "vowel", group: "diphthongs", example: "boy", hint: "OY as in boy" },
  { symbol: "əʉ", category: "vowel", group: "diphthongs", example: "boat", hint: "O as in boat" },
  { symbol: "æɔ", category: "vowel", group: "diphthongs", example: "cow", hint: "OW as in cow" },
  { symbol: "ɪə", category: "vowel", group: "diphthongs", example: "beard", hint: "EAR as in beard" },
];

/** Keyboard layout rows for the PhonemeKeyboard UI */
export const KEYBOARD_ROWS = {
  consonants: [
    ["p", "t", "k", "b", "d", "g"],
    ["n", "m", "ŋ", "f", "s", "θ"],
    ["ʃ", "v", "z", "ð", "ʒ"],
    ["l", "ɹ", "w", "j", "h"],
    ["tʃ", "dʒ"],
  ],
  vowels: [
    ["iː", "ɪ", "e", "eː"],
    ["æ", "ɐ", "ɐː", "ɜː"],
    ["ʉː", "ɔ", "oː", "ʊ"],
    ["æɪ", "ɑe", "oɪ", "əʉ"],
    ["æɔ", "ɪə", "ə"],
  ],
};

export const PHONEME_MAP = Object.fromEntries(
  PHONEMES.map((p) => [p.symbol, p])
);

/** Longest-first list for greedy phoneme tokenisation */
export const PHONEME_SYMBOLS = [...PHONEMES]
  .map((p) => p.symbol)
  .sort((a, b) => b.length - a.length);

/**
 * Parse a space-separated phoneme string, or greedily tokenise a concatenated string.
 * @param {string} input
 * @returns {{ ok: true, phonemes: string[] } | { ok: false, error: string }}
 */
export function parsePhonemeInput(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) {
    return { ok: false, error: "Please enter at least one phoneme." };
  }

  if (/\s/.test(trimmed)) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    for (const part of parts) {
      if (!PHONEME_MAP[part]) {
        return {
          ok: false,
          error: `"${part}" is not a recognised HCE phoneme.`,
        };
      }
    }
    return { ok: true, phonemes: parts };
  }

  const phonemes = [];
  let rest = trimmed;
  while (rest.length > 0) {
    const match = PHONEME_SYMBOLS.find((s) => rest.startsWith(s));
    if (!match) {
      return {
        ok: false,
        error: `Could not parse phonemes near "${rest}". Use spaces between symbols if needed.`,
      };
    }
    phonemes.push(match);
    rest = rest.slice(match.length);
  }
  return { ok: true, phonemes };
}

export function getPhonemeHint(symbol) {
  return PHONEME_MAP[symbol]?.hint || symbol;
}
