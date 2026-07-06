# Slice 3: Wire Eye State + Eye-Stage Scroll Layout

## Contract

`GrimoireEye` already accepts `oracleState` and writes `data-oracle` to the DOM. This slice wires the prop from the layout and changes `.eye-stage` from a fixed center container into a scrollable column so textarea + results can live below the eye.

## API Seam

**`app/src/components/GrimoireStackLayout.jsx`:**
- Import `useOracle` hook
- Call `const oracle = useOracle()` at top of component
- Pass `oracleState={oracle.oracleState}` to `<GrimoireEye>`
- Add textarea + Ask button + `OracleInlinePanel` below `<GrimoireEye>` inside `<main className="eye-stage">`

**`app/src/App.css` — new styles:**
```css
.eye-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  gap: 16px;
  padding-bottom: 24px;
}
```

**`app/src/components/GrimoireEye.jsx`:**
- `oracleState` prop already added in previous work
- rAF loop already handles `consulting` (faster breath, brighter glow) and `answering` (steady glow)
- Add `error` state: dim glow, slow breath, slight red tint

## What the human can run/see

Eye breathes faster and glows brighter during "consulting". When "answering", glow pulses steady. When "error", glow dims. Scroll the eye-stage column on a short viewport to see the textarea and results below the eye.

## Verification

1. Visual: wrapper element has `data-oracle="consulting"` during ask
2. Visual: `data-oracle="answering"` after results arrive
3. Visual: `data-oracle="error"` on fetch failure
4. Visual: eye-stage scrolls when content exceeds viewport
5. Mobile: at <768px, eye-stage column stacks and remains usable

## Dependencies

Slice 1 — `oracleState` is managed by `useOracle`.
Slice 2 — `OracleInlinePanel` is the child to place below the eye.
