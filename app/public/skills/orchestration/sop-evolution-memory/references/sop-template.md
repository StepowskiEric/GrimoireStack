# SOP Template

## 1. Template Structure

Use this template when distilling a successful task trajectory into a reusable SOP.

```markdown
# SOP: <Descriptive Title>

## Metadata
- **SOP ID**: `<kebab-case-identifier>`
- **Domain**: `<debugging|feature-development|refactoring|deployment|etc.>`
- **Tech Stack**: `[comma-separated list]`
- **Created**: YYYY-MM-DD
- **Last Updated**: YYYY-MM-DD
- **Version**: 1.0.0
- **Success Count**: 0
- **Last Used**: YYYY-MM-DD

## Trigger
The conditions that should cause this SOP to be loaded. Include observable symptoms, error messages, or task descriptions.

- `<specific trigger 1>`
- `<specific trigger 2>`
- `<specific trigger 3>`

## Root Cause / Background
Brief explanation of why this problem occurs and the underlying pattern. Keep under 100 tokens.

## Steps
1. **Step 1 title**: Clear, actionable instruction with code snippets or commands if applicable.
2. **Step 2 title**: Next action, including how to verify the step succeeded.
3. **Step 3 title**: Continue until the issue is resolved or task is complete.

## Verification
How to confirm the SOP was applied successfully:

- `<verification check 1>`
- `<verification check 2>`
- `<command or test to run>`

## Common Pitfalls
- **Pitfall 1**: Description of what can go wrong and how to avoid it.
- **Pitfall 2**: Another common mistake and the correct approach.
- **Pitfall 3**: Edge case or gotcha to watch for.

## Version History
| Version | Date       | Changes                                               |
|---------|------------|-------------------------------------------------------|
| 1.0.0   | YYYY-MM-DD | Initial creation from task trajectory <task ID/ref>   |
```

---

## 2. Example SOP 1: Debugging

```markdown
# SOP: Fix React useEffect Infinite Loop

## Metadata
- **SOP ID**: react-useeffect-infinite-loop
- **Domain**: debugging
- **Tech Stack**: [React, JavaScript/TypeScript]
- **Created**: 2026-04-22
- **Last Updated**: 2026-04-22
- **Version**: 1.0.0
- **Success Count**: 4
- **Last Used**: 2026-04-22

## Trigger
- Component re-renders endlessly after state update
- Browser console shows "Maximum update depth exceeded"
- React DevTools Profiler shows component rendering hundreds of times per second

## Root Cause / Background
`useEffect` with missing or incorrect dependency array runs after every render. If the effect updates state, it triggers another render, creating an infinite loop.

## Steps
1. **Identify the problematic effect**: Locate `useEffect` call in component. Check if dependency array is missing, empty `[]`, or contains values that change on every render (e.g., object/array literals).
2. **Check for state updates in effect**: If `setState` is called inside the effect and a dependency changes on each render, the effect will loop.
3. **Stabilize dependencies**: Move inline object/array definitions outside the component or wrap them in `useMemo`/`useCallback`. Ensure all dependencies are primitive values or stable references.
4. **Add missing dependencies**: Use the exhaustive-deps ESLint rule (`eslint-plugin-react-hooks`) to identify all dependencies that should be in the array.
5. **Refactor if needed**: If the effect truly needs to run on every render, convert it to a direct computation or use `useLayoutEffect` with caution.

## Verification
- Page renders without "Maximum update depth exceeded" error
- Component renders only when expected (e.g., when specific props or state change)
- React Profiler shows normal render count

## Common Pitfalls
- **Pitfall 1**: Adding `[]` as a quick fix without verifying the effect doesn't need reactive data — can cause stale closures.
- **Pitfall 2**: Forgetting that inline objects `{}` and arrays `[]` are new references each render, triggering effects even if contents haven't changed.
- **Pitfall 3**: Removing dependencies to "fix" the warning instead of stabilizing them — leads to bugs from stale data.

## Version History
| Version | Date       | Changes                                               |
|---------|------------|-------------------------------------------------------|
| 1.0.0   | 2026-04-22 | Initial creation from task trajectory #A1b2          |
| 1.1.0   | 2026-04-28 | Added pitfall about stale closures after 2nd reuse    |
```

---

## 3. Example SOP 2: Feature Development

```markdown
# SOP: Add Protected Route in Next.js App Router

## Metadata
- **SOP ID**: nextjs-protected-route-app-router
- **Domain**: feature-development
- **Tech Stack**: [Next.js, React, TypeScript, NextAuth.js]
- **Created**: 2026-04-22
- **Last Updated**: 2026-04-22
- **Version**: 1.0.0
- **Success Count**: 2
- **Last Used**: 2026-04-22

## Trigger
- Need to restrict a page to authenticated users only
- Need to redirect unauthenticated users to `/login`
- Adding a new dashboard or settings page that requires sign-in

## Root Cause / Background
Next.js App Router uses server components by default, but `next-auth` session checks require client-side access or server-side session fetching. The standard pattern wraps route content in a conditional based on session state.

## Steps
1. **Create or locate the route**: Ensure the page exists under `app/` directory (e.g., `app/dashboard/page.tsx`).
2. **Set up server-side session check** (preferred): Use `getServerSession(authOptions)` at the top of the page component (async). If no session, redirect using `redirect('/login')`.
3. **OR set up client-side check**: If client-side logic is needed, create a wrapper component that uses `useSession()` from `next-auth/react` to get session state, then conditionally render content or `<Navigate to="/login" />`.
4. **Protect the route**: Wrap page content in session check. Server-side: `const session = await getServerSession(authOptions); if (!session) redirect('/login');`. Client-side: `const { data: session, status } = useSession(); if (status === 'loading') return <Spinner />; if (!session) return <Navigate to="/login" />;`.
5. **Test both states**: Verify authenticated users see the page and unauthenticated users are redirected.

## Verification
- Running `npm run dev` and visiting the route while logged out redirects to `/login`
- After logging in, the protected page renders correctly
- Server-side check: `/login` redirect happens before page renders (no flash of content)

## Common Pitfalls
- **Pitfall 1**: Using client-side check on server-rendered page causes hydration mismatch — use server-side `getServerSession` in Server Components whenever possible.
- **Pitfall 2**: Forgetting to handle `status === 'loading'` state in client-side check — causes UI flicker or premature redirect.
- **Pitfall 3**: Placing `getServerSession` in a client component — it only works in Server Components or Route Handlers.

## Version History
| Version | Date       | Changes                                               |
|---------|------------|-------------------------------------------------------|
| 1.0.0   | 2026-04-22 | Initial creation from task trajectory #C3d4          |
| 1.0.1   | 2026-05-10 | Clarified server vs client approach after v2 migration |
```
