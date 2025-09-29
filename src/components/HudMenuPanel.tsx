import { useEffect, useMemo, useRef } from 'react';

type OverlayOptionKey =
  | 'weightlessness'
  | 'terminator'
  | 'clouds'
  | 'aurora'
  | 'cityLights'
  | 'reducedMotion';

type OverlayOptions = Record<OverlayOptionKey, boolean>;

interface HudMenuPanelProps {
  open: boolean;
  onClose: () => void;
  options: OverlayOptions;
  toggleOption: (key: OverlayOptionKey) => void;
  weightlessnessIntensity: number;
  onWeightlessnessIntensityChange: (value: number) => void;
  fastOverlaySuspended: boolean;
  reducedMotion: boolean;
}

const FOCUSABLE_SELECTORS =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const HudMenuPanel = ({
  open,
  onClose,
  options,
  toggleOption,
  weightlessnessIntensity,
  onWeightlessnessIntensityChange,
  fastOverlaySuspended,
  reducedMotion,
}: HudMenuPanelProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const focusPanel = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
      const firstFocusable = focusable[0];
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        panel.focus();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) {
          return;
        }
        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
        ).filter((element) => !element.hasAttribute('disabled'));
        if (focusable.length === 0) {
          event.preventDefault();
          panel.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const current = document.activeElement as HTMLElement | null;
        if (event.shiftKey) {
          if (current === first || !panel.contains(current)) {
            event.preventDefault();
            last.focus();
          }
        } else if (current === last || !panel.contains(current)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    focusPanel();
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElementRef.current?.focus?.();
    };
  }, [open, onClose]);

  const overlayOptions = useMemo(
    () => [
      { key: 'terminator' as const, label: 'Terminator', description: 'Show the day/night boundary.' },
      {
        key: 'clouds' as const,
        label: 'Clouds',
        description: 'Render real-time global cloud coverage.',
        disabled: fastOverlaySuspended,
      },
      {
        key: 'aurora' as const,
        label: 'Aurora',
        description: 'Visualize auroral activity across the poles.',
        disabled: fastOverlaySuspended,
      },
      { key: 'cityLights' as const, label: 'City Lights', description: 'Highlight major metropolitan areas.' },
    ],
    [fastOverlaySuspended]
  );

  if (!open) {
    return null;
  }

  return (
    <div className="hud-menu-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        className="hud-menu-panel"
        role="dialog"
        id="hud-menu-panel"
        aria-modal="true"
        aria-labelledby="hud-menu-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="hud-menu-header">
          <h2 id="hud-menu-title">HUD &amp; Overlay Controls</h2>
          <button
            type="button"
            className="hud-menu-close"
            onClick={onClose}
            aria-label="Close HUD menu"
          >
            ×
          </button>
        </header>

        <section className="hud-menu-section" aria-labelledby="hud-menu-experience">
          <h3 id="hud-menu-experience">Visual Experience</h3>
          <label className={`hud-menu-toggle${reducedMotion ? ' is-disabled' : ''}`}>
            <input
              type="checkbox"
              checked={options.weightlessness}
              onChange={() => toggleOption('weightlessness')}
              disabled={reducedMotion}
            />
            <span>
              <span className="hud-menu-toggle-label">Weightlessness</span>
              <span className="hud-menu-toggle-description">
                Enable gentle cockpit sway for the Cupola view.
              </span>
            </span>
          </label>
          <label className="hud-menu-slider">
            <span>Drift intensity</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={weightlessnessIntensity}
              onChange={(event) => onWeightlessnessIntensityChange(Number(event.target.value))}
              disabled={!options.weightlessness || reducedMotion}
            />
          </label>
          {reducedMotion && (
            <p className="hud-menu-note">
              Weightlessness is disabled while Reduced Motion is active.
            </p>
          )}
        </section>

        <section className="hud-menu-section" aria-labelledby="hud-menu-overlays">
          <h3 id="hud-menu-overlays">Earth overlays</h3>
          <div className="hud-menu-grid">
            {overlayOptions.map(({ key, label, description, disabled }) => (
              <label
                key={key}
                className={`hud-menu-toggle${disabled ? ' is-disabled' : ''}`}
                aria-disabled={disabled || undefined}
              >
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={() => toggleOption(key)}
                  disabled={disabled}
                />
                <span>
                  <span className="hud-menu-toggle-label">{label}</span>
                  <span className="hud-menu-toggle-description">{description}</span>
                </span>
              </label>
            ))}
          </div>
          {fastOverlaySuspended && (
            <p className="hud-menu-note">
              Some overlays are temporarily paused at very high playback speeds to keep the simulation responsive.
            </p>
          )}
        </section>

        <section className="hud-menu-section" aria-labelledby="hud-menu-accessibility">
          <h3 id="hud-menu-accessibility">Motion &amp; accessibility</h3>
          <label className="hud-menu-toggle">
            <input
              type="checkbox"
              checked={options.reducedMotion}
              onChange={() => toggleOption('reducedMotion')}
            />
            <span>
              <span className="hud-menu-toggle-label">Reduced Motion</span>
              <span className="hud-menu-toggle-description">
                Simplify animations and disable weightlessness drift.
              </span>
            </span>
          </label>
        </section>

        <div className="hud-menu-actions">
          <button type="button" onClick={onClose} className="hud-menu-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HudMenuPanel;
