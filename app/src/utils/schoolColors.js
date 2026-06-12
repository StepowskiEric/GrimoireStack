// Deterministic per-school color derivation for the cosmic horror palette.
// Each school gets a unique but dark, desaturated accent based on hashing its id.

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a deterministic color palette for a school.
 * All colors are dark and desaturated to fit the cosmic horror aesthetic.
 */
export function schoolColors(schoolId) {
  const h = hashString(schoolId);
  const hue = h % 360;

  // Dark, desaturated range: sat 18-30%, light 8-18% for bg, 25-40% for accents
  const sat = 18 + (h % 13);
  const bgLight = 6 + (h % 8);
  const accentLight = 26 + (h % 14);
  const glowLight = 30 + (h % 12);

  return {
    hue,
    // Card background center glow
    bg: `hsl(${hue}, ${sat}%, ${bgLight}%)`,
    // Border / drip color
    border: `hsl(${hue}, ${sat + 5}%, ${accentLight}%)`,
    // Glow / pulse color
    glow: `hsla(${hue}, ${sat + 8}%, ${glowLight}%, 0.35)`,
    // Stronger glow for hover
    glowStrong: `hsla(${hue}, ${sat + 10}%, ${glowLight + 5}%, 0.55)`,
    // Drip gradient top
    dripTop: `hsla(${hue}, ${sat + 5}%, ${accentLight}%, 0.4)`,
    // Drip gradient bottom
    dripBottom: `hsla(${hue}, ${sat + 5}%, ${accentLight}%, 0.25)`,
    // Text accent (for tier badges, counts)
    text: `hsl(${hue}, ${sat - 4}%, ${accentLight + 12}%)`,
    // CSS custom properties string for inline style
    cssVars: {
      '--school-hue': hue,
      '--school-sat': `${sat}%`,
      '--school-bg': `hsl(${hue}, ${sat}%, ${bgLight}%)`,
      '--school-border': `hsl(${hue}, ${sat + 5}%, ${accentLight}%)`,
      '--school-glow': `hsla(${hue}, ${sat + 8}%, ${glowLight}%, 0.35)`,
      '--school-glow-strong': `hsla(${hue}, ${sat + 10}%, ${glowLight + 5}%, 0.55)`,
      '--school-drip-top': `hsla(${hue}, ${sat + 5}%, ${accentLight}%, 0.4)`,
      '--school-drip-bottom': `hsla(${hue}, ${sat + 5}%, ${accentLight}%, 0.25)`,
      '--school-text': `hsl(${hue}, ${sat - 4}%, ${accentLight + 12}%)`,
    },
  };
}
