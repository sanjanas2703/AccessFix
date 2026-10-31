<script setup>
import { computed } from 'vue';
import { FINDING_TYPE_LABELS, GROUP_LABELS, GROUP_NOTES, GROUPS } from '../groups.js';

const props = defineProps({
  findings: { type: Array, required: true },
  reducedMotionQuery: { type: String, default: '' },
});

const groupedFindings = computed(() =>
  GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    note: GROUP_NOTES[group],
    findings: props.findings.filter((finding) => finding.area === group),
  })),
);

const REDUCED_MOTION_NOTES = {
  found: 'The page\'s readable CSS mentions prefers-reduced-motion.',
  'not-found': 'The page\'s CSS does not mention prefers-reduced-motion.',
  'unknown-cross-origin-css': 'Some stylesheets could not be read, so support for prefers-reduced-motion is unknown.',
};
</script>

<template>
  <section class="card" aria-labelledby="issues-heading">
    <h2 id="issues-heading">Findings ({{ findings.length }})</h2>
    <p v-if="findings.length === 0">
      These checks found nothing. That does not mean the page is accessible: most accessibility issues need a person
      to find them.
    </p>

    <div v-for="entry in groupedFindings" :key="entry.group" class="issue-group">
      <h3>{{ entry.label }} ({{ entry.findings.length }})</h3>
      <p class="issue-meta">{{ entry.note }}</p>
      <p v-if="entry.group === 'motion' && REDUCED_MOTION_NOTES[reducedMotionQuery]" class="issue-meta">
        {{ REDUCED_MOTION_NOTES[reducedMotionQuery] }}
      </p>

      <ul class="issue-list">
        <li v-for="finding in entry.findings" :key="finding.id">
          <p class="issue-title">
            <span :class="['badge', `type-${finding.findingType}`]">{{ FINDING_TYPE_LABELS[finding.findingType] }}</span>
          </p>
          <p>{{ finding.summary }}</p>
          <p class="issue-meta">
            {{ finding.ruleId }} · <code>{{ finding.selector }}</code>
          </p>
          <p v-if="finding.evidence?.contrastRatio" class="issue-meta">
            Measured contrast {{ finding.evidence.contrastRatio }}:1, required {{ finding.evidence.required }}:1
            ({{ finding.evidence.foreground }} on {{ finding.evidence.background }})
          </p>
          <p v-if="finding.evidence?.colourDifference" class="issue-meta">
            Difference from a similar element: {{ finding.evidence.colourDifference.normal }} normally,
            {{ finding.evidence.colourDifference.deuteranopia }} under deuteranopia simulation,
            {{ finding.evidence.colourDifference.protanopia }} under protanopia simulation (RGB distance).
          </p>

          <details v-if="finding.guidance">
            <summary>Why this matters</summary>
            <div v-for="need in finding.guidance.needs" :key="need.id">
              <p>
                <strong>{{ need.name }}.</strong> {{ need.description }}
              </p>
              <ul>
                <li v-for="fix in need.fixes" :key="fix.id">
                  {{ fix.title }}: {{ fix.description }}
                  <em>{{ fix.adjustmentType ? '(can be previewed if supported here)' : '(needs a person)' }}</em>
                </li>
              </ul>
            </div>
            <p v-if="finding.guidance.guidelines.length" class="issue-meta">
              <template v-for="(guideline, index) in finding.guidance.guidelines" :key="guideline.id">
                <template v-if="index > 0"> · </template>
                <a :href="guideline.url" target="_blank" rel="noreferrer">
                  WCAG {{ guideline.id }} {{ guideline.title }} ({{ guideline.level }})</a>
              </template>
              <template v-if="finding.findingType !== 'automated_violation'">
                (possibly relevant, not a confirmed failure)
              </template>
            </p>
          </details>
          <p v-else class="issue-meta">Why this matters: no guidance available, because no graph entry was retrieved.</p>

          <div v-if="finding.ai" class="ai-note">
            <p>
              <strong>AI suggestion ({{ finding.ai.confidence }} confidence):</strong> {{ finding.ai.explanation }}
            </p>
            <p v-if="finding.ai.uncertainty" class="issue-meta">Still to check: {{ finding.ai.uncertainty }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
