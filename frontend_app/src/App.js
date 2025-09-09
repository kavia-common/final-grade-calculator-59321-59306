import React, { useMemo, useState } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * Final Grade Calculator App
 * Single-page UI allowing users to input current grade, desired grade, and final exam weight,
 * then calculates the minimum required score on the final exam to achieve the desired course grade.
 * All calculations are client-side. Includes responsive design, minimalistic light theme, and clear/reset actions.
 */
function App() {
  // Input states (percent values)
  const [current, setCurrent] = useState('');
  const [desired, setDesired] = useState('');
  const [weight, setWeight] = useState('');

  // Validation and parsing helpers
  const parseNum = (v) => {
    if (v === '' || v === null || v === undefined) return NaN;
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  };

  // Calculate required final score with memoization
  const result = useMemo(() => {
    const c = parseNum(current);
    const d = parseNum(desired);
    const w = parseNum(weight);

    const hasAll = Number.isFinite(c) && Number.isFinite(d) && Number.isFinite(w);
    if (!hasAll) return { ready: false };

    // Guard rails for ranges
    const errors = [];
    if (c < 0 || c > 100) errors.push('Current grade must be between 0 and 100.');
    if (d < 0 || d > 100) errors.push('Desired grade must be between 0 and 100.');
    if (w <= 0 || w > 100) errors.push('Final exam weight must be between 0 (exclusive) and 100 (inclusive).');

    if (errors.length) {
      return { ready: true, errors };
    }

    const wDec = w / 100;
    const nonFinalWeight = 1 - wDec;

    // Formula:
    // desired = current * (1 - w) + requiredFinal * w
    // => requiredFinal = (desired - current * (1 - w)) / w
    let requiredFinal = (d - c * nonFinalWeight) / wDec;

    // Numerical stability for display
    const requiredFinalRounded = Math.round(requiredFinal * 100) / 100;

    // Interpret results
    let interpretation;
    if (requiredFinalRounded <= 0) {
      interpretation = 'You already secured your desired grade—any score on the final will do.';
    } else if (requiredFinalRounded > 100) {
      interpretation = 'It is not possible to reach your desired grade with the given final exam weight.';
    } else {
      interpretation = 'You need at least this score on the final exam.';
    }

    return {
      ready: true,
      errors: [],
      requiredFinal,
      requiredFinalRounded,
      steps: [
        'Formula: desired = current × (1 − w) + final × w',
        'Rearrange: final = (desired − current × (1 − w)) ÷ w',
        `Inputs: current = ${c}%, desired = ${d}%, w = ${w}% (= ${wDec})`,
        `Compute: (1 − w) = ${nonFinalWeight}`,
        `final = (${d} − ${c} × ${nonFinalWeight}) ÷ ${wDec}`,
        `final ≈ ${requiredFinalRounded}%`
      ],
      interpretation
    };
  }, [current, desired, weight]);

  const hasInputs = current !== '' || desired !== '' || weight !== '';

  const clearAll = () => {
    setCurrent('');
    setDesired('');
    setWeight('');
  };

  return (
    <div className="fgc-app">
      <header className="fgc-header">
        <h1 className="fgc-title">Final Grade Calculator</h1>
        <p className="fgc-subtitle">Find the minimum score you need on the final to reach your desired grade.</p>
      </header>

      <main className="fgc-main">
        <section className="fgc-card" aria-label="Final grade calculator form">
          <div className="fgc-form-grid">
            <div className="fgc-field">
              <label htmlFor="current" className="fgc-label">Current Grade (%)</label>
              <div className="fgc-input-wrap">
                <input
                  id="current"
                  inputMode="decimal"
                  type="text"
                  className="fgc-input"
                  placeholder="e.g., 86.5"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  aria-describedby="current-help"
                />
                <span className="fgc-suffix">%</span>
              </div>
              <div id="current-help" className="fgc-help">0 to 100</div>
            </div>

            <div className="fgc-field">
              <label htmlFor="desired" className="fgc-label">Desired Course Grade (%)</label>
              <div className="fgc-input-wrap">
                <input
                  id="desired"
                  inputMode="decimal"
                  type="text"
                  className="fgc-input"
                  placeholder="e.g., 90"
                  value={desired}
                  onChange={(e) => setDesired(e.target.value)}
                  aria-describedby="desired-help"
                />
                <span className="fgc-suffix">%</span>
              </div>
              <div id="desired-help" className="fgc-help">0 to 100</div>
            </div>

            <div className="fgc-field">
              <label htmlFor="weight" className="fgc-label">Final Exam Weight (%)</label>
              <div className="fgc-input-wrap">
                <input
                  id="weight"
                  inputMode="decimal"
                  type="text"
                  className="fgc-input"
                  placeholder="e.g., 30"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  aria-describedby="weight-help"
                />
                <span className="fgc-suffix">%</span>
              </div>
              <div id="weight-help" className="fgc-help">Greater than 0 and up to 100</div>
            </div>
          </div>

          <div className="fgc-actions">
            {/* PUBLIC_INTERFACE */}
            <button
              type="button"
              className="fgc-btn fgc-btn-primary"
              onClick={() => {/* No-op; calculation is reactive via useMemo */}}
              aria-label="Calculate required final exam score"
            >
              Calculate
            </button>

            {/* PUBLIC_INTERFACE */}
            <button
              type="button"
              className="fgc-btn fgc-btn-ghost"
              onClick={clearAll}
              disabled={!hasInputs}
              aria-label="Clear all input fields"
            >
              Clear
            </button>
          </div>

          <div className="fgc-result" aria-live="polite" aria-atomic="true">
            {!result.ready && (
              <p className="fgc-muted">Enter your current grade, desired grade, and the final exam weight to see the required score.</p>
            )}

            {result.ready && result.errors?.length > 0 && (
              <div className="fgc-alert">
                <ul className="fgc-alert-list">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            {result.ready && (!result.errors || result.errors.length === 0) && (
              <>
                <div className="fgc-result-number-wrap">
                  <div className={`fgc-result-number ${result.requiredFinal > 100 ? 'fgc-badge-warn' : ''}`}>
                    {Math.max(0, Math.round(result.requiredFinal * 100) / 100).toFixed(2)}%
                  </div>
                  <div className="fgc-interpretation">{result.interpretation}</div>
                </div>

                <div className="fgc-steps">
                  <h3 className="fgc-steps-title">How it’s calculated</h3>
                  <ol>
                    {result.steps.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="fgc-footer">
        <span>Made with ❤️ for students</span>
      </footer>
    </div>
  );
}

export default App;
