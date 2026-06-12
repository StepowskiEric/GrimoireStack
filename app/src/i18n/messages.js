const STORAGE_KEY = 'grimoire-lang';
import { useState } from 'react';

export function getLanguage() {
  if (typeof window === 'undefined') return 'grimoire';
  return localStorage.getItem(STORAGE_KEY) || 'grimoire';
}

export function setLanguage(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
}

export const messages = {
  grimoire: {
    // App shell
    appTitle: 'GrimoireStack',
    appSubtitle: "The Warlock's Tome of Agent Incantations",
    castToggleLabel: 'Cast animation',
    browseHint: 'Browse by school, scry by affliction in the orb below, or brew your own recipe combinations.',

    // Modal actions
    share: '✦ Share',
    shareCopied: '✦ Link Copied!',
    shareFailed: '✦ Copy failed',
    inscribe: '✦ Inscribe to your Workshop',
    inscribeCopied: '✦ Incantation Inscribed',
    inscribeFailed: '✦ Copy failed',
    inscribeUnsupported: '✦ Copy unsupported',
    viewPlain: '✦ Plain English',
    viewFull: '✦ Full Grimoire Entry',

    // Ritual section
    ritualTitle: '⛧ Ritual of Summoning',
    ritualSub: 'To bind these incantations to your own workshop, inscribe them into your agent\'s grimoire. The following rites summon the full collection or any single spell.',
    primaryIncantation: '✦ The Primary Incantation',
    primaryDesc: 'Summon every incantation in the grimoire. The picker will guide you through agent and spell selection.',
    codexAgents: '✦ Codex of Agents',
    codexDesc: 'Each agent receives a different folder format. Choose yours and inscribe the whole collection.',
    singleSpell: '✦ Single-Spell Inscription',
    singleDesc: 'For when you only need one incantation. Repeat the --skill flag to inscribe several at once.',
    grimoireRef: '✦ The Grimoire Reference',
    refFormat: '〈 grimoirestack:<topic>/<spell-name> 〉',
    companionTooling: '✦ Companion Tooling',
    companionDesc: 'Two optional companions ship alongside the incantations:',
    inscribedToast: '✦ The incantation has been inscribed. Paste it into your terminal to summon.',

    // Recipe Lab (themed versions)
    recipeTitle: '⚗ Recipe Lab',
    recipeSub: 'Select 2–5 incantations below and brew a custom ritual',
    cauldronLabel: '✦ Cauldron',
    cauldronEmpty: 'Select incantations from the grid below…',
    brewButton: '⚗ Brew Ritual',
    brewedRitual: '✦ Brewed Ritual',
    incantationsLabel: 'Incantations',
    removeChipTitle: 'Click to remove',

    // Tome of Ailments
    tomeTitle: '⟐ Tome of Common Ailments',
    tomeSubtitle: 'Describe your affliction to find the right incantation',

    // Summoning Circle
    summoningOpen: 'Open Summoning Circle',
    summoningClose: 'Close Summoning Circle',
    circleTitle: 'The Summoning Circle',
    unbind: 'Unbind {name}',
    bind: 'Bind to Summoning Circle',
    unbindLabel: 'Unbind from Summoning Circle',

    // Scrying Orb
    orbLabel: 'Click to search',
    orbTry: 'Try:',
    orbConsult: '✦ Not sure what you need? Consult the Witch Doctor →',

    // Footer
    footerTagline: 'Forge your own incantations',
    footerInstall: 'To summon:',
    footerRitualTab: 'visit the Ritual tab above',

    // Spell Card
    clickToReveal: 'click to reveal',
    revealHint: 'click to reveal',

    // Misc
    skillPath: 'Skill Path',
    noFullEntry: 'No full grimoire entry found for this incantation.',
    noFullEntryHint: 'The scroll may still be in the scribe\'s hands.',
    mdLoading: 'Unfurling the scroll...',

    // Marginalia
    marginaliaTitle: '✎ Apprentice Marginalia',
    marginaliaPlaceholder: "Scribe your own notes here. They stay on this device.",
    marginaliaErase: '✕ Erase',
    marginaliaAriaLabel: 'Personal notes for this spell',
    marginaliaSaving: 'saving…',
    marginaliaSaved: 'saved',
    marginaliaCleared: 'cleared',

    // Stale-link banner
    notFoundTitle: 'The incantation has been unbound',
    notFoundMessage: 'No spell named {skill} is inscribed in the current grimoire.',
    notFoundSuggestionsLead: 'Did you mean…',
    notFoundDismiss: '✕ Dismiss',

    // Cast the bones
    castBones: '✦ Cast the bones',
    castBonesTitle: 'Open a random incantation',

    // Shortcuts modal
    shortcutsTitle: 'Runes of Power',
    shortcutsSubtitle: 'Keyboard shortcuts for the warlock on the go',
    shortcutsFootnote: 'Shortcuts are inert when typing in the search or a note.',
    shortcutsClose: 'Close cheatsheet',

    // Install prompt
    installTitle: '✦ Summon GrimoireStack to your device',
    installAction: 'Install',
    installDismiss: 'Dismiss install',

    // Footer
    shortcutsLink: 'keyboard shortcuts',

    // Filters
    filterSchoolLabel: 'School:',
    filterTierLabel: 'Tier:',
    filterFavorites: 'Favorites',
    filterClear: '✕ Clear',
    filterFavoritesTitle: 'Show only favorited incantations',

    // Summoning Circle
    recentTab: 'Recently Cast ({count})',
    favoritesTab: 'Favorites ({count})',
    recentEmpty: 'No spells cast yet. Open one to begin your trail.',

    // New tabs
    indexTab: '🗂 Index',
    graphTab: '🕸 Graph',
    changelogTab: '📜 Changelog',
    indexSub: 'A flat alphabetical catalogue of every incantation, independent of school.',
    graphSub: 'The grimoire as a graph — spells are nodes, synergies are edges.',
    changelogSub: 'Recently inscribed and revised incantations.',

    // Compare
    compareTitle: '⚖ Compare Incantations',
    compareSubtitle: 'Side-by-side comparison of two spells',
    comparePickFirst: '+ Pick first spell',
    comparePickSecond: '+ Pick second spell',
    comparePickSpell: 'Choose a spell for the {slot} side',
    compareNoMatch: 'Pick two spells to compare their effect, status, and synergies.',
    compareDiff: 'Different',
    compareSame: 'Same',

    // Problem intake
    intakeTitle: 'What Ails You?',
    intakeSubtitle: 'Describe your problem in plain language — the orb will suggest incantations.',
    intakePlaceholder: "e.g. 'I have a flaky test that only fails in CI' or 'I need to coordinate three agents'…",
    intakeSubmit: '✦ Reveal Suggestions',
    intakeExamples: 'Or try a sample problem:',
    intakeNoMatch: 'The orb sees no clear match. Try broader terms, or browse by school.',
    intakeSuggested: '{count} suggested incantation{plural}',

    // Export
    exportJson: 'JSON',
    exportMarkdown: 'Markdown',
    exportLabel: 'Export your config:',
  },
  plain: {
    // App shell
    appTitle: 'Agent Skills Catalog',
    appSubtitle: 'A collection of reusable AI agent skills',
    castToggleLabel: 'Cast animation',
    browseHint: 'Browse by category, search by keyword or problem description, or combine skills in the recipe lab.',

    // Modal actions
    share: '✦ Share',
    shareCopied: '✦ Link Copied!',
    shareFailed: '✦ Copy failed',
    inscribe: '✦ Copy to Clipboard',
    inscribeCopied: '✦ Copied',
    inscribeFailed: '✦ Copy failed',
    inscribeUnsupported: '✦ Copy unsupported',
    viewPlain: '✦ Plain Description',
    viewFull: '✦ Full Documentation',

    // Ritual section
    ritualTitle: '⛧ Installation Guide',
    ritualSub: 'Install these skills into your agent\'s configuration folder. Below are commands for the full collection or individual skills.',
    primaryIncantation: '✦ Install All Skills',
    primaryDesc: 'Install every skill in the catalog. The picker will guide you through agent and skill selection.',
    codexAgents: '✦ Supported Agents',
    codexDesc: 'Each agent uses a different folder structure. Choose yours and install the full collection.',
    singleSpell: '✦ Install Single Skill',
    singleDesc: 'Install just one skill. Repeat the --skill flag to install several at once.',
    grimoireRef: '✦ Reference Format',
    refFormat: 'grimoirestack:<topic>/<spell-name>',
    companionTooling: '✦ Companion Tools',
    companionDesc: 'Two optional companions ship alongside the skills:',
    inscribedToast: '✦ Copied to clipboard. Paste it into your terminal to install.',

    // Recipe Lab
    recipeTitle: '⚗ Recipe Lab',
    recipeSub: 'Select 2–5 skills below and create a custom combination',
    cauldronLabel: '✦ Selected Skills',
    cauldronEmpty: 'Select skills from the grid below…',
    brewButton: '⚗ Generate Combination',
    brewedRitual: '✦ Generated Combination',
    incantationsLabel: 'Skills',
    removeChipTitle: 'Click to remove',

    // Tome of Ailments
    tomeTitle: '⟐ Common Problems',
    tomeSubtitle: 'Describe your problem to find the right skill',

    // Summoning Circle
    summoningOpen: 'Open Favorites',
    summoningClose: 'Close Favorites',
    circleTitle: 'Favorites',
    unbind: 'Remove {name}',
    bind: 'Add to Favorites',
    unbindLabel: 'Remove from Favorites',

    // Scrying Orb
    orbLabel: 'Click to search',
    orbTry: 'Try:',
    orbConsult: '✦ Not sure what you need? Consult the Skill Recommender →',

    // Footer
    footerTagline: 'Build your own skill combinations',
    footerInstall: 'To install:',
    footerRitualTab: 'visit the Installation tab above',

    // Spell Card
    clickToReveal: 'click to view details',
    revealHint: 'click to view details',

    // Misc
    skillPath: 'Skill ID',
    noFullEntry: 'No full documentation found for this skill.',
    noFullEntryHint: 'Documentation may still be in progress.',
    mdLoading: 'Loading documentation...',

    // Marginalia
    marginaliaTitle: '✎ Personal Notes',
    marginaliaPlaceholder: 'Write your own notes here. They stay on this device.',
    marginaliaErase: '✕ Erase',
    marginaliaAriaLabel: 'Personal notes for this skill',
    marginaliaSaving: 'saving…',
    marginaliaSaved: 'saved',
    marginaliaCleared: 'cleared',

    // Stale-link banner
    notFoundTitle: 'Skill not found',
    notFoundMessage: 'No skill named {skill} exists in the current catalog.',
    notFoundSuggestionsLead: 'Did you mean…',
    notFoundDismiss: '✕ Dismiss',

    // Cast the bones
    castBones: '✦ Cast the bones',
    castBonesTitle: 'Open a random skill',

    // Shortcuts modal
    shortcutsTitle: 'Keyboard Shortcuts',
    shortcutsSubtitle: 'Quick reference for power users',
    shortcutsFootnote: 'Shortcuts are inert when typing in the search or a note.',
    shortcutsClose: 'Close cheatsheet',

    // Install prompt
    installTitle: '✦ Install GrimoireStack',
    installAction: 'Install',
    installDismiss: 'Dismiss install',

    // Footer
    shortcutsLink: 'keyboard shortcuts',

    // Filters
    filterSchoolLabel: 'Category:',
    filterTierLabel: 'Tier:',
    filterFavorites: 'Favorites',
    filterClear: '✕ Clear',
    filterFavoritesTitle: 'Show only favorited skills',

    // Summoning Circle
    recentTab: 'Recently Viewed ({count})',
    favoritesTab: 'Favorites ({count})',
    recentEmpty: 'No skills viewed yet. Open one to start your trail.',

    // New tabs
    indexTab: '🗂 Index',
    graphTab: '🕸 Graph',
    changelogTab: '📜 Changelog',
    indexSub: 'A flat alphabetical list of every skill, independent of category.',
    graphSub: 'The catalog as a graph — skills are nodes, connections are edges.',
    changelogSub: 'Recently added and updated skills.',

    // Compare
    compareTitle: '⚖ Compare Skills',
    compareSubtitle: 'Side-by-side comparison of two skills',
    comparePickFirst: '+ Pick first skill',
    comparePickSecond: '+ Pick second skill',
    comparePickSkill: 'Choose a skill for the {slot} side',
    compareNoMatch: 'Pick two skills to compare their effect, status, and synergies.',
    compareDiff: 'Different',
    compareSame: 'Same',

    // Problem intake
    intakeTitle: 'What Ails You?',
    intakeSubtitle: 'Describe your problem in plain language to get skill suggestions.',
    intakePlaceholder: "e.g. 'I have a flaky test that only fails in CI' or 'I need to coordinate three agents'…",
    intakeSubmit: '✦ Reveal Suggestions',
    intakeExamples: 'Or try a sample problem:',
    intakeNoMatch: 'No clear match found. Try broader terms, or browse by category.',
    intakeSuggested: '{count} suggested skill{plural}',

    // Export
    exportJson: 'JSON',
    exportMarkdown: 'Markdown',
    exportLabel: 'Export your config:',
  },
};

export function useMessages() {
  const [lang, setLang] = useState(() => getLanguage());
  const updateLang = (value) => {
    setLanguage(value);
    setLang(value);
  };
  const t = (key) => {
    const msgs = messages[lang] || messages.grimoire;
    return msgs[key] || messages.grimoire[key] || key;
  };
  return { lang, setLang: updateLang, t };
}
