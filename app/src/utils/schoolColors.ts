function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function schoolColors(schoolId: string) {
  const h = hashString(schoolId);
  const hue = h % 360;
  const sat = 18 + (h % 13);
  const bgLight = 6 + (h % 8);
  const accentLight = 32 + (h % 14);
  const glowLight = 30 + (h % 12);

  return {
    hue,
    bg: `hsl(${hue}, ${sat}%, ${bgLight}%)`,
    border: `hsl(${hue}, ${sat + 5}%, ${accentLight}%)`,
    glow: `hsla(${hue}, ${sat + 8}%, ${glowLight}%, 0.35)`,
    glowStrong: `hsla(${hue}, ${sat + 10}%, ${glowLight + 5}%, 0.55)`,
    dripTop: `hsla(${hue}, ${sat + 5}%, ${accentLight}%, 0.4)`,
    dripBottom: `hsla(${hue}, ${sat + 5}%, ${accentLight}%, 0.25)`,
    text: `hsl(${hue}, ${sat - 4}%, ${accentLight + 12}%)`,
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
