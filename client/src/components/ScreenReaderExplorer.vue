<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  issues: {
    type: Array,
    required: true,
  },
  selectedIssueId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['select-issue']);

const activeSubTab = ref('structure'); // 'structure', 'labels', 'images', 'focus'

// Filter issues relevant to screen reader & keyboard navigation
const screenReaderIssues = computed(() =>
  props.issues.filter((i) => i.group === 'blind' || i.type?.includes('alt') || i.type?.includes('label') || i.type?.includes('name'))
);

const missingNameIssues = computed(() =>
  screenReaderIssues.value.filter((i) => i.type?.includes('name') || i.type?.includes('label') || i.type?.includes('button'))
);

const imageAltIssues = computed(() =>
  screenReaderIssues.value.filter((i) => i.type?.includes('alt') || i.type?.includes('image'))
);

const focusNavigationIssues = computed(() =>
  props.issues.filter((i) => i.group === 'motor' || i.type?.includes('focus') || i.type?.includes('keyboard') || i.type?.includes('trap'))
);

// Derives a structured semantic tree representation from the observed issues
const semanticNodes = computed(() => {
  return [
    {
      id: 'landmark-banner',
      role: 'landmark',
      tag: 'header[role="banner"]',
      name: 'Site Header',
      level: 1,
      hasIssue: screenReaderIssues.value.some((i) => i.component === 'SiteHeader'),
      issue: screenReaderIssues.value.find((i) => i.component === 'SiteHeader'),
      children: [
        {
          id: 'elem-nav',
          role: 'navigation',
          tag: 'nav[aria-label="Main"]',
          name: 'Primary Navigation',
          level: 2,
          hasIssue: false,
        },
        {
          id: 'elem-search-btn',
          role: 'button',
          tag: 'button.icon-search',
          name: '(empty accessible name)',
          level: 2,
          hasIssue: true,
          issue: screenReaderIssues.value.find((i) => i.selector?.includes('search')),
        },
      ],
    },
    {
      id: 'landmark-main',
      role: 'landmark',
      tag: 'main[id="content"]',
      name: 'Main Content Area',
      level: 1,
      hasIssue: screenReaderIssues.value.some((i) => i.component === 'HeroBanner' || i.page === '/'),
      children: [
        {
          id: 'elem-hero-img',
          role: 'img',
          tag: 'img.hero-banner',
          name: '(missing alt attribute)',
          level: 2,
          hasIssue: true,
          issue: screenReaderIssues.value.find((i) => i.selector?.includes('hero')),
        },
        {
          id: 'elem-contact-form',
          role: 'form',
          tag: 'form#contact',
          name: 'Contact Form',
          level: 2,
          hasIssue: screenReaderIssues.value.some((i) => i.component === 'ContactForm'),
          children: [
            {
              id: 'elem-input-email',
              role: 'textbox',
              tag: 'input#email',
              name: 'Placeholder: "you@domain.com" (No <label>)',
              level: 3,
              hasIssue: true,
              issue: screenReaderIssues.value.find((i) => i.selector?.includes('email')),
            },
          ],
        },
      ],
    },
    {
      id: 'landmark-modal',
      role: 'dialog',
      tag: 'div.modal-newsletter',
      name: 'Newsletter Subscription Dialog',
      level: 1,
      hasIssue: focusNavigationIssues.value.some((i) => i.selector?.includes('newsletter')),
      issue: focusNavigationIssues.value.find((i) => i.selector?.includes('newsletter')),
    },
  ];
});
</script>

<template>
  <div class="sr-explorer" aria-labelledby="sr-explorer-heading">
    <!-- Header with Category Identity -->
    <div class="category-banner banner-teal">
      <div class="banner-badge">
        <span class="badge badge-screen-reader">Category A</span>
        <span class="concept-tag">Structure · Clarity · Navigation</span>
      </div>
      <h2 id="sr-explorer-heading" class="category-heading">
        Screen Reader Accessibility Instrument
      </h2>
      <p class="category-desc">
        Screen readers construct a non-visual accessibility tree based strictly on semantic landmarks, hierarchy, and explicit accessible names.
      </p>

      <!-- Sub Navigation -->
      <div class="instrument-nav" role="tablist" aria-label="Screen Reader Explorer Modules">
        <button
          type="button"
          role="tab"
          class="inst-tab"
          :class="{ active: activeSubTab === 'structure' }"
          :aria-selected="activeSubTab === 'structure'"
          @click="activeSubTab = 'structure'"
        >
          Semantic Structure Tree
        </button>
        <button
          type="button"
          role="tab"
          class="inst-tab"
          :class="{ active: activeSubTab === 'labels' }"
          :aria-selected="activeSubTab === 'labels'"
          @click="activeSubTab = 'labels'"
        >
          Missing Label Inspector ({{ missingNameIssues.length }})
        </button>
        <button
          type="button"
          role="tab"
          class="inst-tab"
          :class="{ active: activeSubTab === 'images' }"
          :aria-selected="activeSubTab === 'images'"
          @click="activeSubTab = 'images'"
        >
          Image Alternative Review ({{ imageAltIssues.length }})
        </button>
        <button
          type="button"
          role="tab"
          class="inst-tab"
          :class="{ active: activeSubTab === 'focus' }"
          :aria-selected="activeSubTab === 'focus'"
          @click="activeSubTab = 'focus'"
        >
          Focus & Navigation Ring ({{ focusNavigationIssues.length }})
        </button>
      </div>
    </div>

    <!-- MODULE 1: SEMANTIC STRUCTURE EXPLORER -->
    <section v-if="activeSubTab === 'structure'" class="module-section">
      <div class="module-intro">
        <h3>Observed Accessible DOM Hierarchy</h3>
        <p>
          Click any highlighted node to inspect its missing accessible name and synthesized screen-reader announcement.
        </p>
      </div>

      <div class="tree-container card-box">
        <div v-for="node in semanticNodes" :key="node.id" class="tree-row-group">
          <!-- Root / Landmark Node -->
          <div
            class="tree-row level-1"
            :class="{ 'row-flagged': node.hasIssue, selected: selectedIssueId === node.issue?.id }"
            @click="node.issue && emit('select-issue', node.issue)"
          >
            <div class="row-left">
              <span class="role-icon role-landmark" aria-hidden="true">🏛</span>
              <span class="tag-name">{{ node.tag }}</span>
              <span class="node-title">{{ node.name }}</span>
            </div>
            <div class="row-right">
              <span v-if="node.hasIssue" class="badge badge-severity-high">Issue Detected</span>
              <span v-else class="badge-status-ok">Verified</span>
            </div>
          </div>

          <!-- Children Nodes -->
          <div v-if="node.children" class="tree-branch">
            <div
              v-for="child in node.children"
              :key="child.id"
              class="tree-row level-2"
              :class="{ 'row-flagged': child.hasIssue, selected: selectedIssueId === child.issue?.id }"
              @click="child.issue && emit('select-issue', child.issue)"
            >
              <div class="row-left">
                <span class="tree-line" aria-hidden="true">├──</span>
                <span class="role-icon" aria-hidden="true">
                  {{ child.role === 'img' ? '🖼' : child.role === 'button' ? '🔘' : '📄' }}
                </span>
                <span class="tag-name">{{ child.tag }}</span>
                <span class="node-title" :class="{ 'text-error': child.hasIssue }">
                  {{ child.name }}
                </span>
              </div>
              <div class="row-right">
                <span v-if="child.hasIssue" class="badge badge-severity-high">
                  {{ child.issue?.type ?? 'Missing Label' }}
                </span>
                <span v-else class="badge-status-ok">Accessible</span>
              </div>

              <!-- Grandchildren if any -->
              <div v-if="child.children" class="tree-branch grandchild-branch">
                <div
                  v-for="grandchild in child.children"
                  :key="grandchild.id"
                  class="tree-row level-3"
                  :class="{ 'row-flagged': grandchild.hasIssue, selected: selectedIssueId === grandchild.issue?.id }"
                  @click="grandchild.issue && emit('select-issue', grandchild.issue)"
                >
                  <div class="row-left">
                    <span class="tree-line" aria-hidden="true">└──</span>
                    <span class="role-icon" aria-hidden="true">⌨️</span>
                    <span class="tag-name">{{ grandchild.tag }}</span>
                    <span class="node-title text-error">{{ grandchild.name }}</span>
                  </div>
                  <div class="row-right">
                    <span class="badge badge-severity-medium">No Associated Label</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MODULE 2: MISSING LABEL INSPECTOR -->
    <section v-if="activeSubTab === 'labels'" class="module-section">
      <div class="module-intro">
        <h3>Detected Elements Missing Accessible Names</h3>
        <p>
          Form controls and interactive triggers without accessible names cannot be operated reliably by voice command or screen reading software.
        </p>
      </div>

      <div class="findings-grid">
        <div
          v-for="issue in missingNameIssues"
          :key="issue.id"
          class="inspector-card card-box"
          :class="{ selected: selectedIssueId === issue.id }"
          @click="emit('select-issue', issue)"
        >
          <div class="card-head">
            <span class="badge badge-severity-high">{{ issue.severity }}</span>
            <span class="badge font-mono">WCAG {{ issue.wcag }}</span>
            <span class="badge" :class="issue.fixed ? 'badge-fixed' : 'badge-open'">
              {{ issue.fixed ? 'Resolved' : 'Open' }}
            </span>
          </div>

          <h4 class="card-title">{{ issue.description }}</h4>

          <div class="card-meta-list">
            <div class="meta-row">
              <span class="label">Target Selector:</span>
              <code class="val">{{ issue.selector }}</code>
            </div>
            <div class="meta-row">
              <span class="label">Component:</span>
              <span class="val">{{ issue.component }}</span>
            </div>
            <div class="meta-row">
              <span class="label">Assistance Impact:</span>
              <span class="val impact-text">
                Screen readers announce: <em>"Unlabelled {{ issue.type.includes('button') ? 'button' : 'input' }}"</em>
              </span>
            </div>
          </div>

          <div class="suggested-fix-box">
            <span class="fix-head">Suggested Fix:</span>
            <code>{{ issue.proposedFix ?? 'Add aria-label="..." or <label for="..."> element' }}</code>
          </div>
        </div>
      </div>
    </section>

    <!-- MODULE 3: IMAGE ALTERNATIVE REVIEW -->
    <section v-if="activeSubTab === 'images'" class="module-section">
      <div class="module-intro">
        <h3>Image Alternative Text Audit</h3>
        <p>
          Distinguishes between missing alternatives, present descriptive text, and decorative assets requiring manual human judgment.
        </p>
      </div>

      <div class="image-audit-list">
        <div
          v-for="issue in imageAltIssues"
          :key="issue.id"
          class="image-item card-box"
          :class="{ selected: selectedIssueId === issue.id }"
          @click="emit('select-issue', issue)"
        >
          <div class="img-preview-col">
            <div class="mock-image-frame" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>{{ issue.selector }}</span>
            </div>
          </div>

          <div class="img-details-col">
            <div class="card-head">
              <span class="badge badge-severity-high">Missing Alternative Text</span>
              <span class="badge badge-severity-medium">Manual Review Needed</span>
            </div>
            <h4>{{ issue.description }}</h4>
            <p class="img-reason">
              When an &lt;img&gt; lacks an <code>alt</code> attribute entirely, screen readers often read aloud the raw image URL or filename (e.g. <code>hero-oct-sale.jpg</code>).
            </p>

            <div class="alt-comparison-box">
              <div class="alt-state">
                <span class="alt-label">Current Accessible Name:</span>
                <span class="alt-val empty">(None)</span>
              </div>
              <div class="alt-state">
                <span class="alt-label">Proposed Adaptation:</span>
                <span class="alt-val text-green">
                  {{ issue.proposedFix ?? 'alt="Descriptive summary of the promotional banner"' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MODULE 4: FOCUS & NAVIGATION EXPLORER -->
    <section v-if="activeSubTab === 'focus'" class="module-section">
      <div class="module-intro">
        <h3>Keyboard & Focus Navigation Explorer</h3>
        <p>
          Simulates the sequential keyboard Tab order observed on the page to identify keyboard traps and missing visual focus rings.
        </p>
      </div>

      <div class="findings-grid">
        <div
          v-for="issue in focusNavigationIssues"
          :key="issue.id"
          class="inspector-card card-box"
          :class="{ selected: selectedIssueId === issue.id }"
          @click="emit('select-issue', issue)"
        >
          <div class="card-head">
            <span class="badge" :class="`badge-severity-${issue.severity}`">{{ issue.severity }}</span>
            <span class="badge font-mono">WCAG {{ issue.wcag }}</span>
          </div>

          <h4 class="card-title">{{ issue.description }}</h4>

          <div class="card-meta-list">
            <div class="meta-row">
              <span class="label">Observed Target:</span>
              <code class="val">{{ issue.selector }}</code>
            </div>
            <div class="meta-row">
              <span class="label">Behavioral Defect:</span>
              <span class="val text-danger">
                {{ issue.type === 'keyboard-trap' ? 'Keyboard Trap: Tab cannot exit back to document' : 'Focus indicator suppressed (:focus { outline: 0 })' }}
              </span>
            </div>
          </div>

          <div class="suggested-fix-box">
            <span class="fix-head">Adaptive Fix:</span>
            <code>{{ issue.proposedFix ?? 'Restore visible outline or trap release' }}</code>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sr-explorer {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-banner {
  background-color: var(--color-surface);
  border: 1px solid var(--cat-screen-reader-border);
  border-top: 4px solid var(--cat-screen-reader);
  border-radius: var(--radius-lg);
  padding: 28px 28px 0;
}

.banner-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.concept-tag {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--cat-screen-reader-dark);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.category-heading {
  font-size: 1.6rem;
  margin-bottom: 8px;
}

.category-desc {
  color: var(--color-charcoal);
  font-size: 0.95rem;
  line-height: 1.55;
  margin-bottom: 24px;
  max-width: 800px;
}

.instrument-nav {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
}

.inst-tab {
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 10px 16px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.inst-tab:hover {
  color: var(--color-obsidian);
}

.inst-tab.active {
  color: var(--cat-screen-reader-dark);
  border-bottom-color: var(--cat-screen-reader);
}

.module-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.module-intro h3 {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

.module-intro p {
  font-size: 0.875rem;
  color: var(--color-muted);
}

/* Semantic Tree Styling */
.tree-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
}

.tree-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tree-row:hover {
  border-color: var(--cat-screen-reader);
  background: #ffffff;
}

.tree-row.selected {
  outline: 2px solid var(--cat-screen-reader);
  background: var(--cat-screen-reader-bg);
}

.tree-row.row-flagged {
  border-left: 4px solid var(--color-danger);
}

.row-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

.role-icon {
  font-size: 1rem;
}

.tag-name {
  color: var(--color-muted);
}

.node-title {
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--color-obsidian);
}

.text-error {
  color: var(--color-danger);
}

.badge-status-ok {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-success);
}

.tree-branch {
  margin-left: 28px;
  padding-left: 14px;
  border-left: 2px dashed var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.grandchild-branch {
  margin-left: 36px;
}

.tree-line {
  color: var(--color-muted-light);
}

/* Findings Grid */
.findings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.inspector-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.inspector-card:hover {
  border-color: var(--cat-screen-reader);
  box-shadow: var(--shadow-md);
}

.inspector-card.selected {
  outline: 2px solid var(--cat-screen-reader);
  background: var(--cat-screen-reader-bg);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 12px;
}

.card-meta-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8125rem;
  margin-bottom: 14px;
}

.meta-row {
  display: flex;
  gap: 8px;
}

.meta-row .label {
  color: var(--color-muted);
  min-width: 90px;
}

.meta-row .val {
  color: var(--color-obsidian);
  word-break: break-all;
}

.impact-text {
  color: var(--color-danger);
  font-weight: 500;
}

.suggested-fix-box {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 0.75rem;
}

.fix-head {
  display: block;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 4px;
}

/* Image Audit */
.image-audit-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-item {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 20px;
  cursor: pointer;
}

.image-item.selected {
  outline: 2px solid var(--cat-screen-reader);
  background: var(--cat-screen-reader-bg);
}

.mock-image-frame {
  height: 100%;
  min-height: 120px;
  background: var(--color-surface-sunken);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-muted);
  font-size: 0.75rem;
  text-align: center;
  padding: 10px;
}

.img-details-col h4 {
  font-size: 1rem;
  margin-bottom: 6px;
}

.img-reason {
  font-size: 0.875rem;
  color: var(--color-charcoal);
  margin-bottom: 12px;
}

.alt-comparison-box {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8125rem;
}

.alt-state {
  display: flex;
  gap: 8px;
}

.alt-label {
  color: var(--color-muted);
  min-width: 160px;
}

.alt-val.empty {
  color: var(--color-danger);
  font-style: italic;
}

.alt-val.text-green {
  color: var(--color-success);
  font-weight: 600;
}

@media (max-width: 768px) {
  .image-item {
    grid-template-columns: 1fr;
  }
}
</style>
