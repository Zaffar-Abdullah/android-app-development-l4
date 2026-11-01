import React from 'react';

interface LiquidChromeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export const LiquidChromeToggle: React.FC<LiquidChromeToggleProps> = ({ theme, onToggle }) => {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`glass-theme-switch ${isDark ? 'is-dark' : 'is-light'}`}
      onClick={onToggle}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-pressed={isDark}
    >
      {/* Studio acrylic glass track */}
      <span className="glass-switch-track" aria-hidden="true">
        {/* Subtle starfield / light motes inside track */}
        <span className="glass-switch-motes" />

        {/* Background track icons */}
        <span className="glass-switch-bg-icon sun-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </span>
        <span className="glass-switch-bg-icon moon-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>

        {/* 3D Refractive Glass Orb Thumb */}
        <span className="glass-switch-thumb">
          <span className="glass-thumb-orbit" />
          <span className="glass-thumb-core">
            {isDark ? (
              <svg className="thumb-svg moon-svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z" />
              </svg>
            ) : (
              <svg className="thumb-svg sun-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4.2" fill="currentColor" />
                <path d="M12 2.5v2.2M12 19.3v2.2M5.28 5.28l1.55 1.55M17.17 17.17l1.55 1.55M2.5 12h2.2M19.3 12h2.2M5.28 18.72l1.55-1.55M17.17 6.83l1.55-1.55" />
              </svg>
            )}
          </span>
          <span className="glass-thumb-shine" />
        </span>

        {/* Top domed acrylic umbrella reflection */}
        <span className="glass-switch-specular" />
      </span>
    </button>
  );
};
