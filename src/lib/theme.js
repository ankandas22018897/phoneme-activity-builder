export const THEME_COOKIE = "pab-theme";
export const DENSITY_COOKIE = "pab-density";

export const THEMES = {
  light: "light",
  dark: "dark",
};

export const DENSITIES = {
  comfortable: "comfortable",
  compact: "compact",
};

export function parseTheme(value) {
  return value === THEMES.dark ? THEMES.dark : THEMES.light;
}

export function parseDensity(value) {
  return value === DENSITIES.compact
    ? DENSITIES.compact
    : DENSITIES.comfortable;
}

/** Client-side cookie write (365 days). */
export function setClientCookie(name, value) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function readClientCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}
