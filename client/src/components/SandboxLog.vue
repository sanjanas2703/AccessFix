<script setup>
defineProps({
  events: { type: Array, required: true },
});

const formatTime = (iso) => new Date(iso).toLocaleTimeString();
</script>

<template>
  <section class="card" aria-labelledby="log-heading">
    <h2 id="log-heading">Sandbox log</h2>
    <ol class="sandbox-log">
      <li v-for="item in events" :key="`${item.time}-${item.event}`">
        <time :datetime="item.time">{{ formatTime(item.time) }}</time>
        <span>{{ item.event }}</span>
      </li>
    </ol>
  </section>
</template>
