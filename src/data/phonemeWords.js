/**
 * HCE phoneme word corpus (3-, 4-, and 5-phoneme words).
 * Game logic uses the phonemes array — never convert to alphabet letters.
 */

export const PHONEME_WORDS = [
  // --- 3 phonemes ---
  { word: "bed", phonemes: ["b", "e", "d"], phonemeCount: 3 },
  { word: "bid", phonemes: ["b", "ɪ", "d"], phonemeCount: 3 },
  { word: "bad", phonemes: ["b", "æ", "d"], phonemeCount: 3 },
  { word: "bud", phonemes: ["b", "ɐ", "d"], phonemeCount: 3 },
  { word: "bird", phonemes: ["b", "ɜː", "d"], phonemeCount: 3 },
  { word: "bark", phonemes: ["b", "ɐː", "k"], phonemeCount: 3 },
  { word: "book", phonemes: ["b", "ʊ", "k"], phonemeCount: 3 },
  { word: "boot", phonemes: ["b", "ʉː", "t"], phonemeCount: 3 },
  { word: "boat", phonemes: ["b", "əʉ", "t"], phonemeCount: 3 },
  { word: "bike", phonemes: ["b", "ɑe", "k"], phonemeCount: 3 },
  { word: "bait", phonemes: ["b", "æɪ", "t"], phonemeCount: 3 },
  { word: "boil", phonemes: ["b", "oɪ", "l"], phonemeCount: 3 },
  { word: "beard", phonemes: ["b", "ɪə", "d"], phonemeCount: 3 },
  { word: "boy", phonemes: ["b", "oɪ"], phonemeCount: 2 },
  { word: "choice", phonemes: ["tʃ", "oɪ", "s"], phonemeCount: 3 },
  { word: "chin", phonemes: ["tʃ", "ɪ", "n"], phonemeCount: 3 },
  { word: "thin", phonemes: ["θ", "ɪ", "n"], phonemeCount: 3 },
  { word: "then", phonemes: ["ð", "e", "n"], phonemeCount: 3 },
  { word: "jam", phonemes: ["dʒ", "æ", "m"], phonemeCount: 3 },
  { word: "fan", phonemes: ["f", "æ", "n"], phonemeCount: 3 },
  { word: "van", phonemes: ["v", "æ", "n"], phonemeCount: 3 },
  { word: "sun", phonemes: ["s", "ɐ", "n"], phonemeCount: 3 },
  { word: "ring", phonemes: ["ɹ", "ɪ", "ŋ"], phonemeCount: 3 },
  { word: "log", phonemes: ["l", "ɔ", "g"], phonemeCount: 3 },
  { word: "ship", phonemes: ["ʃ", "ɪ", "p"], phonemeCount: 3 },
  { word: "sheep", phonemes: ["ʃ", "iː", "p"], phonemeCount: 3 },
  { word: "fish", phonemes: ["f", "ɪ", "ʃ"], phonemeCount: 3 },
  { word: "cat", phonemes: ["k", "æ", "t"], phonemeCount: 3 },
  { word: "dog", phonemes: ["d", "ɔ", "g"], phonemeCount: 3 },
  { word: "cup", phonemes: ["k", "ɐ", "p"], phonemeCount: 3 },
  { word: "hat", phonemes: ["h", "æ", "t"], phonemeCount: 3 },
  { word: "map", phonemes: ["m", "æ", "p"], phonemeCount: 3 },
  { word: "net", phonemes: ["n", "e", "t"], phonemeCount: 3 },
  { word: "pin", phonemes: ["p", "ɪ", "n"], phonemeCount: 3 },
  { word: "pot", phonemes: ["p", "ɔ", "t"], phonemeCount: 3 },
  { word: "red", phonemes: ["ɹ", "e", "d"], phonemeCount: 3 },
  { word: "run", phonemes: ["ɹ", "ɐ", "n"], phonemeCount: 3 },
  { word: "sit", phonemes: ["s", "ɪ", "t"], phonemeCount: 3 },
  { word: "top", phonemes: ["t", "ɔ", "p"], phonemeCount: 3 },
  { word: "win", phonemes: ["w", "ɪ", "n"], phonemeCount: 3 },
  { word: "yes", phonemes: ["j", "e", "s"], phonemeCount: 3 },
  { word: "zoo", phonemes: ["z", "ʉː"], phonemeCount: 2 },
  { word: "cow", phonemes: ["k", "æɔ"], phonemeCount: 2 },
  { word: "mouth", phonemes: ["m", "æɔ", "θ"], phonemeCount: 3 },
  { word: "house", phonemes: ["h", "æɔ", "s"], phonemeCount: 3 },
  { word: "caught", phonemes: ["k", "oː", "t"], phonemeCount: 3 },
  { word: "cart", phonemes: ["k", "ɐː", "t"], phonemeCount: 3 },
  { word: "food", phonemes: ["f", "ʉː", "d"], phonemeCount: 3 },
  { word: "moon", phonemes: ["m", "ʉː", "n"], phonemeCount: 3 },
  { word: "feet", phonemes: ["f", "iː", "t"], phonemeCount: 3 },
  { word: "leaf", phonemes: ["l", "iː", "f"], phonemeCount: 3 },
  { word: "lake", phonemes: ["l", "æɪ", "k"], phonemeCount: 3 },
  { word: "light", phonemes: ["l", "ɑe", "t"], phonemeCount: 3 },
  { word: "night", phonemes: ["n", "ɑe", "t"], phonemeCount: 3 },
  { word: "road", phonemes: ["ɹ", "əʉ", "d"], phonemeCount: 3 },
  { word: "soap", phonemes: ["s", "əʉ", "p"], phonemeCount: 3 },
  { word: "voice", phonemes: ["v", "oɪ", "s"], phonemeCount: 3 },
  { word: "judge", phonemes: ["dʒ", "ɐ", "dʒ"], phonemeCount: 3 },
  { word: "church", phonemes: ["tʃ", "ɜː", "tʃ"], phonemeCount: 3 },

  // --- 4 phonemes ---
  { word: "black", phonemes: ["b", "l", "æ", "k"], phonemeCount: 4 },
  { word: "green", phonemes: ["g", "ɹ", "iː", "n"], phonemeCount: 4 },
  { word: "train", phonemes: ["t", "ɹ", "æɪ", "n"], phonemeCount: 4 },
  { word: "cloud", phonemes: ["k", "l", "æɔ", "d"], phonemeCount: 4 },
  { word: "snake", phonemes: ["s", "n", "æɪ", "k"], phonemeCount: 4 },
  { word: "smile", phonemes: ["s", "m", "ɑe", "l"], phonemeCount: 4 },
  { word: "bread", phonemes: ["b", "ɹ", "e", "d"], phonemeCount: 4 },
  { word: "glass", phonemes: ["g", "l", "ɐː", "s"], phonemeCount: 4 },
  { word: "swim", phonemes: ["s", "w", "ɪ", "m"], phonemeCount: 4 },
  { word: "stop", phonemes: ["s", "t", "ɔ", "p"], phonemeCount: 4 },
  { word: "frog", phonemes: ["f", "ɹ", "ɔ", "g"], phonemeCount: 4 },
  { word: "flag", phonemes: ["f", "l", "æ", "g"], phonemeCount: 4 },
  { word: "clock", phonemes: ["k", "l", "ɔ", "k"], phonemeCount: 4 },
  { word: "drum", phonemes: ["d", "ɹ", "ɐ", "m"], phonemeCount: 4 },
  { word: "twin", phonemes: ["t", "w", "ɪ", "n"], phonemeCount: 4 },
  { word: "queen", phonemes: ["k", "w", "iː", "n"], phonemeCount: 4 },
  { word: "please", phonemes: ["p", "l", "iː", "z"], phonemeCount: 4 },
  { word: "clean", phonemes: ["k", "l", "iː", "n"], phonemeCount: 4 },
  { word: "brave", phonemes: ["b", "ɹ", "æɪ", "v"], phonemeCount: 4 },
  { word: "crane", phonemes: ["k", "ɹ", "æɪ", "n"], phonemeCount: 4 },
  { word: "slide", phonemes: ["s", "l", "ɑe", "d"], phonemeCount: 4 },
  { word: "brush", phonemes: ["b", "ɹ", "ɐ", "ʃ"], phonemeCount: 4 },
  { word: "crash", phonemes: ["k", "ɹ", "æ", "ʃ"], phonemeCount: 4 },
  { word: "fresh", phonemes: ["f", "ɹ", "e", "ʃ"], phonemeCount: 4 },

  // --- 5 phonemes ---
  { word: "splash", phonemes: ["s", "p", "l", "æ", "ʃ"], phonemeCount: 5 },
  { word: "street", phonemes: ["s", "t", "ɹ", "iː", "t"], phonemeCount: 5 },
  { word: "strong", phonemes: ["s", "t", "ɹ", "ɔ", "ŋ"], phonemeCount: 5 },
  { word: "plant", phonemes: ["p", "l", "æ", "n", "t"], phonemeCount: 5 },
  { word: "brand", phonemes: ["b", "ɹ", "æ", "n", "d"], phonemeCount: 5 },
  { word: "grand", phonemes: ["g", "ɹ", "æ", "n", "d"], phonemeCount: 5 },
  { word: "frost", phonemes: ["f", "ɹ", "ɔ", "s", "t"], phonemeCount: 5 },
  { word: "print", phonemes: ["p", "ɹ", "ɪ", "n", "t"], phonemeCount: 5 },
  { word: "split", phonemes: ["s", "p", "l", "ɪ", "t"], phonemeCount: 5 },
  { word: "spring", phonemes: ["s", "p", "ɹ", "ɪ", "ŋ"], phonemeCount: 5 },
  { word: "string", phonemes: ["s", "t", "ɹ", "ɪ", "ŋ"], phonemeCount: 5 },
  { word: "blink", phonemes: ["b", "l", "ɪ", "ŋ", "k"], phonemeCount: 5 },
  { word: "trunk", phonemes: ["t", "ɹ", "ɐ", "ŋ", "k"], phonemeCount: 5 },
  { word: "crisp", phonemes: ["k", "ɹ", "ɪ", "s", "p"], phonemeCount: 5 },
  { word: "clamp", phonemes: ["k", "l", "æ", "m", "p"], phonemeCount: 5 },
];

/** Prefer CVC-style teaching words for Wordle defaults */
export const WORDLE_WORDS = PHONEME_WORDS.filter(
  (w) => w.phonemeCount >= 3 && w.phonemeCount <= 5
);

export function getWordsByCount(count) {
  return PHONEME_WORDS.filter((w) => w.phonemeCount === count);
}

export function findWordByEnglish(english) {
  const key = (english || "").trim().toLowerCase();
  return PHONEME_WORDS.find((w) => w.word === key) || null;
}

export function findWordByPhonemes(phonemes) {
  const key = phonemes.join("|");
  return (
    PHONEME_WORDS.find((w) => w.phonemes.join("|") === key) || null
  );
}
