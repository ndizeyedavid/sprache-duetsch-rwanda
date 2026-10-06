---
name: ui-design-compact
description: Design, implement, refine, or review polished web and product interfaces with a compact cross-stack workflow covering product intent, visual direction, responsive layout, typography, color, interaction, motion, accessibility, code quality, and verification. Use for frontend UI work when prompt budget is tight. Do not use for backend-only tasks or standalone image generation.
metadata:
  edition: "compact"
  version: "1.0.0"
---

# UI Design Compact

Create interfaces that are useful, distinctive, accessible, responsive, and maintainable. This is an operating standard, not a fixed visual style. Adapt it to the product, audience, platform, repository, and explicit brief.

## Resolve Conflicts in This Order

1. The user's explicit scope, content, and aesthetic direction.
2. Product truth, task success, safety, and accessibility.
3. The existing design system, component library, stack, and repository conventions.
4. Platform conventions and evidence from the current interface.
5. The defaults in this skill.

Do not broaden a narrow refinement into a redesign. Do not change the stack, add dependencies, or invent product claims without a clear need and authorization.

## Work in This Order

### 1. Inspect Before Designing

- Read the relevant routes, components, styles, tokens, dependencies, tests, and nearby screens.
- Identify the real user, primary task, content, constraints, device context, and success state.
- Reuse real copy, data shapes, brand assets, icons, and established patterns. Do not hide uncertainty behind placeholder content.
- Decide whether the work is a new design, a redesign, a scoped refinement, an implementation, or an audit. Preserve what already works.

### 2. Choose the Interface Mode

Use the mode to settle hierarchy before styling:

| Mode | Optimize for |
| --- | --- |
| Persuade | A clear promise, credible proof, and one primary action |
| Operate | Fast scanning, task completion, state clarity, and error recovery |
| Read | Comprehension, navigation, rhythm, and comfortable measure |
| Experience | A memorable sequence without sacrificing usability |

Hybrids are allowed, but name the dominant mode. Write a one-sentence visual thesis tying the audience, task, tone, and signature element together. Every unusual visual choice must support that thesis.

### 3. Establish the System

- Map product priority to reading order, visual weight, and interaction priority.
- Use a small spacing scale and clear proximity: related items close, groups separated, sections distinct.
- Prefer an existing token system. For a new system, define primitive values, then semantic tokens such as `surface`, `text-muted`, `border`, `accent`, and `danger`; components consume semantic tokens.
- Use existing fonts first. Keep type families and weights few, define purposeful roles, keep long text near 60–75 characters per line, and use tabular numerals for comparable data.
- Build a neutral color ramp, one primary accent, and only the semantic status colors the product needs. Color must keep stable meaning and never carry meaning alone.
- Measure contrast: at least 4.5:1 for normal text and 3:1 for large text. Tune dark mode independently rather than inverting light mode.
- Gradients, glass, glow, texture, extreme rounding, and decorative color are optional identity tools—not defaults.

### 4. Implement the Real Interface

#### Layout and responsiveness

- Let content and tasks determine breakpoints; use container queries when behavior depends on component width.
- Responsive design may reorder, collapse, wrap, scroll, disclose, or change controls. Do not merely squeeze desktop UI.
- Keep DOM, reading, and focus order logical. Use logical properties where practical and account for RTL, safe areas, zoom, long labels, localized copy, and dynamic data.
- Avoid accidental clipping, horizontal page overflow, fragile fixed heights, and absolute positioning for primary structure.

#### Components and states

- Prefer semantic native HTML. Use established accessible primitives for dialogs, menus, popovers, comboboxes, tabs, tooltips, and other complex widgets.
- Make controls recognizable, labels explicit, focus visible, and interactive targets comfortably usable by touch.
- Cover every relevant state: default, hover, focus, active, disabled, loading, empty, error, success, and destructive confirmation.
- Keep errors close to their source, explain recovery, preserve entered data, and never block paste without a strong security reason.
- Use one coherent icon family per surface. Icons inherit color, include accessible names when needed, and do not replace unfamiliar labels.
- Usually allow one dominant filled action per view or decision group; make secondary actions visually quieter.

#### Motion

- Animate to explain hierarchy, feedback, continuity, or attention. Prefer one memorable moment over constant motion.
- Use CSS transitions for simple state changes, the existing React motion library for presence/layout/gestures, and GSAP only for genuinely complex timelines or scroll choreography.
- Prefer transform and opacity; avoid continuously animating layout or paint-heavy properties. Clean up listeners and timelines, pause offscreen work, and stop decorative loops.
- Typical ranges: 120–200 ms for micro feedback, 180–320 ms for small state changes, and 400–800 ms for section choreography. Exits are usually faster.
- Honor reduced motion by removing nonessential spatial movement and scroll scrubbing while preserving content and state feedback.

#### Code quality

- Follow the repository's framework, typing, file, naming, styling, and testing conventions.
- Compose around coherent responsibilities. Avoid both giant do-everything components and arbitrary fragmentation.
- Keep state at the simplest correct owner: local interaction state locally, shareable navigation state in the URL, remote data in server-state tools, and global state only when genuinely global.
- Use stable keys, derive values instead of duplicating state, and do not use effects for render-time calculations.
- Reuse tokens and variants; avoid raw values where tokens exist, arbitrary z-index escalation, and `transition: all`.
- Size media explicitly, preserve aspect ratios, use responsive sources, lazy-load below-fold media, and prevent layout shift.
- Optimize from evidence. Do not add memoization, virtualization, or a heavy dependency without a measured or structural need.

### 5. Choose Libraries Deliberately

Inspect installed packages and their actual versions first. Prefer the existing stack.

| Need | Default decision |
| --- | --- |
| Simple control or layout | Native HTML and CSS |
| Complex accessible widget | Existing design-system primitive; otherwise a stack-compatible accessible library |
| Simple animation | CSS |
| React presence, layout, gesture | Existing motion library |
| Sequenced or scroll-led animation | GSAP when complexity justifies it |
| Anchored floating UI | Existing primitive or Floating UI-style positioning |
| Complex forms and validation | Existing form/schema tools after native behavior is insufficient |
| Large tables, lists, or charts | Add specialized tools only when data volume or interaction requires them |
| Icons | One existing vector icon family; no emoji as functional UI icons |

Do not migrate libraries during a UI task unless migration is part of the request.

### 6. Verify the Result

Run the checks the repository supports, then inspect the rendered interface when tools permit.

- Test representative desktop, narrow mobile, and an awkward intermediate width.
- Check light/dark themes if supported, 200% zoom, long content, empty/loading/error states, and localized or RTL content where relevant.
- Use keyboard-only navigation; verify focus visibility, order, trapping, restoration, escape behavior, labels, and announcements.
- Test reduced motion and coarse-pointer/touch behavior.
- Check console errors, broken assets, page overflow, clipped controls, layout shift, and obvious performance regressions.
- Fix findings as a coherent batch, then perform one confirmation pass. State clearly what could not be rendered or tested.

## Copy Rules

- Use plain, specific, action-led language and consistent product terms.
- Buttons describe actions; headings describe destinations or outcomes.
- Empty states explain why the space is empty and offer one useful next step.
- Errors state what happened, what remains safe, and how to recover.
- Never invent testimonials, metrics, compatibility, pricing, security claims, or customer evidence.

## Final Gate

Do not call the UI finished unless all are true:

- The main task and primary action are obvious.
- The design has a product-specific rationale and at least one restrained signature detail.
- Hierarchy, spacing, type, and color form a coherent system.
- Mobile is intentionally composed, not compressed desktop.
- Keyboard, focus, contrast, reduced motion, and semantic structure work.
- Relevant states and failure paths exist.
- The code matches the repository and introduces no needless dependency or abstraction.
- The result was rendered and checked where possible; unverified areas are disclosed.

Reject generic defaults such as a centered slogan followed by three equal cards, card containers around every section, random gradients or glass, oversized empty space, pill-shaped everything, decoration-only animation, color-only status, inaccessible clickable `div`s, and success-only mockups—unless the product evidence or explicit brief genuinely calls for them.

use Solid colors , dont use half colors with half opacity
