# Mobile Navigation and Article TOC Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the FEBIRDY mobile navigation and article table-of-contents drawer usable with touch and keyboard, expose correct ARIA state, close predictably with Escape or an outside action, and verify the layout at the project’s target viewports.

**Architecture:** Keep Hexo’s existing EJS structure and the native DOM controller in `source/javascripts/febirdy.js`. Add semantic IDs/state attributes in the header and article sidebar, then let one small controller own open/close/focus behavior for the mobile menu and TOC drawer. Keep the existing desktop TOC and visual direction; responsive CSS only changes visibility, focus affordances, overflow locking, and reduced-motion behavior.

**Tech Stack:** Hexo EJS templates, vanilla browser JavaScript, CSS in `source/stylesheets/febirdy.css`, existing `npm run build`/`npm run preview:build`, Playwright smoke checks against the generated preview.

**Spec:** User request to prioritize mobile navigation, article TOC drawer, keyboard/ARIA/Escape behavior, reduced-motion regression, and 390/768/1440/2560 viewport checks.

## Global Constraints

- Preserve Aomori-compatible configuration and existing desktop layout.
- Do not change article source, Giscus configuration, search provider configuration, or deployment settings.
- Do not add a runtime dependency; use native DOM APIs already used by the theme.
- Keep focus visible and return focus to the control that opened each temporary surface.
- `prefers-reduced-motion: reduce` must not introduce animated transitions or hover transforms for the updated controls.
- Run fresh build/preview checks before claiming completion.

---

### Task 1: Add semantic hooks to navigation and TOC markup

**Files:**
- Modify: `layout/_partial/header.ejs`
- Modify: `layout/_partial/sidebar.ejs`
- Modify: `layout/_partial/article.ejs`

**Interfaces:**
- Produces `#fb-mobile-nav`, `#fb-toc-panel`, `.fb-menu-button`, `.fb-mobile-toc-trigger`, `.fb-toc-close`, and matching `aria-controls`/`aria-expanded` state for the controller.

- [x] **Step 1: Add stable IDs and initial ARIA state**

  Set the mobile menu button to `aria-controls="fb-mobile-nav"`, `aria-haspopup="true"`, `aria-expanded="false"`, and an explicit closed label. Give the mobile nav `id="fb-mobile-nav"` and `aria-hidden="true"`.

- [x] **Step 2: Label the TOC panel and close control**

  Give the TOC title a stable `id`, add `aria-labelledby` and `tabindex="-1"` to `#fb-toc-panel`, and add `aria-controls="fb-toc-panel"` to `.fb-toc-close`. Keep the existing article trigger’s `aria-controls`/`aria-expanded` attributes.

- [x] **Step 3: Add a close target for outside clicks**

  Add a `data-toc-close` marker to the TOC close button and a `data-menu-link` marker to mobile links so the controller can close the temporary surface without depending on visible text.

- [x] **Step 4: Read back the generated template contract**

  Use `rg` to confirm every referenced ID/class is present exactly where the JavaScript expects it and that no article/sidebar conditional was widened.

### Task 2: Implement keyboard-safe open/close state management

**Files:**
- Modify: `source/javascripts/febirdy.js`

**Interfaces:**
- Consumes the semantic hooks from Task 1.
- Produces `openMobileMenu()`, `closeMobileMenu()`, `openToc()`, and `closeToc()` behavior through the existing DOMContentLoaded controller; no global API is required.

- [x] **Step 1: Add a small focusable-element helper**

  Use a selector covering links, buttons, form controls, and `[tabindex]:not([tabindex="-1"])`, filter out disabled/hidden elements, and use it only for focus restoration and the TOC drawer’s Tab boundary.

- [x] **Step 2: Implement mobile menu state transitions**

  On open, add `is-open`, set `aria-expanded="true"`/`aria-hidden="false"`, update the label to “关闭导航”, and focus the first visible link. On close, remove `is-open`, restore `aria-expanded="false"`/`aria-hidden="true"`, restore the label to “打开导航”, and return focus to the button when the close was user-initiated.

- [x] **Step 3: Implement TOC drawer state transitions**

  Toggle `fb-toc-open` on the site body, set the trigger’s `aria-expanded`, set the panel’s `aria-hidden`, focus the close button (or the panel if no close button is available), and restore focus to the trigger on close. Close when Escape is pressed, when the marked close target is clicked, when the sidebar backdrop/padding is clicked, or when a TOC link is activated on mobile.

- [x] **Step 4: Add keyboard and resize safeguards**

  Handle Escape for whichever mobile surface is open, keep Tab within the open TOC drawer, and close the mobile menu/TOC when the viewport crosses the desktop breakpoint so stale `is-open` state cannot hide later interactions.

- [x] **Step 5: Run a static JavaScript check**

  Run `npx eslint source/javascripts/febirdy.js` and inspect the diff for unrelated changes. The command must exit 0 before moving on.

### Task 3: Align responsive and reduced-motion CSS with the new state

**Files:**
- Modify: `source/stylesheets/febirdy.css`

**Interfaces:**
- Consumes `.is-open`, `fb-toc-open`, `[aria-hidden]`, and focus state from Task 2.
- Produces responsive behavior at 900px/600px without changing desktop component geometry.

- [x] **Step 1: Make closed surfaces non-interactive to assistive technology**

  Add explicit `[aria-hidden="true"] { display: none; }` rules scoped to `.fb-mobile-nav` and `.fb-toc-panel`, while preserving the existing desktop TOC visibility through the desktop media query.

- [x] **Step 2: Add visible focus affordances**

  Add `:focus-visible` outlines for the menu button, mobile links, TOC trigger, close button, and TOC links using the FEBIRDY cyan token and a non-layout-shifting outline.

- [x] **Step 3: Harden mobile drawer overflow and click area**

  Keep the body locked while the TOC is open, make the drawer’s scroll region safe on short screens, and provide a clickable padded area around the panel that the controller can treat as an outside close target.

- [x] **Step 4: Add reduced-motion overrides**

  Under `@media (prefers-reduced-motion: reduce)`, disable hover transforms on cards/tags/links touched by this work and retain instant state changes with `scroll-behavior: auto`.

- [x] **Step 5: Run Stylelint**

  Run `npx stylelint source/stylesheets/febirdy.css` only if the repository’s configured Stylelint accepts CSS input; otherwise run the project’s existing SCSS style check and inspect the appended CSS manually. Do not reformat the pre-existing minified block.

### Task 4: Build and perform multi-viewport interaction regression

**Files:**
- Modify: none (generated `.preview/site-*` output is ignored)
- Test: generated preview pages and a temporary Playwright smoke script/CLI session

**Interfaces:**
- Verifies the actual Hexo output from the real blog’s articles and the article TOC trigger.

- [x] **Step 1: Generate fresh theme and blog output**

  Run `npm run build` in the theme repository, then run `npm run preview:build /Users/zhangyipeng/MyCodingSpace/HexoBlogs/tech-blogs` and record the emitted preview path. Build and preview must exit 0; the preview must report the expected theme, post count, and routes.

- [x] **Step 2: Serve the isolated preview without modifying the blog**

  Start a temporary static server rooted at the emitted preview `public/` directory and capture its local URL. Do not run Hexo deploy or write to the real blog’s `public/` directory.

- [x] **Step 3: Check target viewports**

  At 390x844 and 768x1024, verify the desktop nav is hidden, the menu button is visible, the menu opens by click, its ARIA state changes, Escape closes it, and focus returns to the button. On a post page, verify the TOC trigger opens the drawer, the drawer is focusable/scrollable, Escape and the close button close it, and the trigger regains focus. At 1440x900 and 2560x1440, verify the desktop nav/sidebar are visible and the mobile controls do not alter the desktop layout.

- [x] **Step 4: Check reduced-motion state**

  Repeat one mobile menu and TOC interaction with `prefers-reduced-motion: reduce`; verify no transition/animation is required for the state change and no hover transform is applied.

- [x] **Step 5: Inspect final repository state**

  Run `git diff --check`, `git status --short`, and a focused diff review. Generated preview files must remain ignored; only the planned theme files may be modified.
