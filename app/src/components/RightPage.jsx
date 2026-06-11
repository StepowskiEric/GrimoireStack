import { useState, useEffect, useCallback } from 'react';
import SchoolCardGrid from './SchoolCardGrid.jsx';
import SpellDetailView from './SpellDetailView.jsx';
import FavoritesView from './FavoritesView.jsx';
import RecipeLabView from './RecipeLabView.jsx';
import ArcaneToolsView from './ArcaneToolsView.jsx';
import SettingsView from './SettingsView.jsx';
import AllSchoolsView from './AllSchoolsView.jsx';
import { pageTurn } from '../audio/sounds.js';

// Tab constants (duplicated to avoid circular dependency with BookLayout)
const TABS = {
  LIBRARY: 'library',
  SPELLBOOK: 'spellbook',
  RECIPE_LAB: 'recipe-lab',
  ARCANE_TOOLS: 'arcane-tools',
  SETTINGS: 'settings',
};

export default function RightPage({
  activeTab,
  pageKey,
  schools,
  currentSchool,
  onSchoolSelect,
  onSpellClick,
  searchQuery,
  onSearchChange,
  isFavorited,
  onToggleFavorite,
  favorites,
  recent,
  marginalia,
  getVote,
  castVote,
  aggregateFor,
  onIntakeOpen,
  onCompareOpen,
  onCastBones,
  schoolFilter,
  tierFilter,
  favoritesOnly,
  onToggleSchool,
  onToggleTier,
  onToggleFavorites,
  onClearFilters,
  filterResults,
  featuredSchools,
  onFeaturedSchoolsChange,
}) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [displayContent, setDisplayContent] = useState('home');

  // Handle page turns with animation
  useEffect(() => {
    if (pageKey !== displayContent) {
      setIsFlipping(true);
      // Play page turn sound
      pageTurn();
      
      const timer = setTimeout(() => {
        setDisplayContent(pageKey);
        setIsFlipping(false);
      }, 300); // Half of the animation duration
      return () => clearTimeout(timer);
    }
  }, [pageKey, displayContent]);

  const renderContent = useCallback(() => {
    // If we're viewing a specific spell, show spell detail
    if (pageKey === 'spell-detail' && currentSchool) {
      return (
        <SpellDetailView
          school={currentSchool}
          onBack={() => onSchoolSelect(currentSchool.id)}
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
          marginalia={marginalia}
          getVote={getVote}
          castVote={castVote}
          aggregateFor={aggregateFor}
        />
      );
    }

    // If we're viewing all schools
    if (pageKey === 'all-schools') {
      return (
        <AllSchoolsView
          schools={schools}
          onSchoolSelect={onSchoolSelect}
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
          searchQuery={searchQuery}
        />
      );
    }

    // Tab-based content
    switch (activeTab) {
      case TABS.LIBRARY:
        return (
          <SchoolCardGrid
            schools={schools}
            featuredSchools={featuredSchools}
            onSchoolSelect={onSchoolSelect}
            onViewAll={() => onSchoolSelect(null)}
            isFavorited={isFavorited}
            onToggleFavorite={onToggleFavorite}
          />
        );
      
      case TABS.SPELLBOOK:
        return (
          <FavoritesView
            schools={schools}
            favorites={favorites}
            recent={recent}
            marginalia={marginalia}
            onSpellClick={onSpellClick}
            isFavorited={isFavorited}
            onToggleFavorite={onToggleFavorite}
          />
        );
      
      case TABS.RECIPE_LAB:
        return (
          <RecipeLabView
            schools={schools}
            onSpellClick={onSpellClick}
            onCompareOpen={onCompareOpen}
          />
        );
      
      case TABS.ARCANE_TOOLS:
        return (
          <ArcaneToolsView
            schools={schools}
            onSpellClick={onSpellClick}
          />
        );
      
      case TABS.SETTINGS:
        return (
          <SettingsView
            castEnabled={true}
            onToggleCast={() => {}}
            onShowShortcuts={() => {}}
            onExportJson={() => {}}
            onExportMarkdown={() => {}}
          />
        );
      
      default:
        return (
          <SchoolCardGrid
            schools={schools}
            featuredSchools={featuredSchools}
            onSchoolSelect={onSchoolSelect}
            onViewAll={() => onSchoolSelect(null)}
            isFavorited={isFavorited}
            onToggleFavorite={onToggleFavorite}
          />
        );
    }
  }, [activeTab, pageKey, currentSchool, schools, featuredSchools, favorites, recent, marginalia, searchQuery, isFavorited, onSchoolSelect, onSpellClick, onToggleFavorite, getVote, castVote, aggregateFor, onCompareOpen]);

  return (
    <div className={`right-page ${isFlipping ? 'right-page--flipping' : ''}`}>
      {/* Page decorations */}
      <div className="page-corner page-corner--tr">ᛉ ᚲ ᛟ</div>
      <div className="page-corner page-corner--br">ᛒ ᛖ ᚦ</div>
      <div className="page-stain page-stain--2" />
      <div className="page-burn page-burn--2" />
      
      {/* Content */}
      <div className="right-page__content">
        {renderContent()}
      </div>
    </div>
  );
}
