<script setup>
defineProps({
  integrations: { type: Object, required: true },
});

const NAMES = { daytona: 'Daytona (scanning)', neo4j: 'Neo4j (guidance)', nosana: 'Nosana (AI explanations)' };
const STATUS = { pending: 'Waiting', ok: 'Working', unavailable: 'Unavailable', skipped: 'Skipped' };
</script>

<template>
  <section class="card" aria-labelledby="integrations-heading">
    <h2 id="integrations-heading">Services used</h2>
    <ul class="issue-list">
      <li v-for="(integration, name) in integrations" :key="name">
        <p>
          <strong>{{ NAMES[name] }}: {{ STATUS[integration.status] }}</strong>
        </p>
        <p v-if="integration.detail" class="issue-meta">{{ integration.detail }}</p>
      </li>
    </ul>
  </section>
</template>
