<template>
  <div class="card-list-container">
    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search titles..."
        class="search-input"
      />
    </div>

    <div class="cards-list">
      <div
        v-for="(card, index) in filteredCards"
        :key="index"
        class="card-item"
        @click="handleCardClick(card.title)"
      >
        <h3 class="card-title">{{ card.title }}</h3>
      </div>

      <div v-if="filteredCards.length === 0" class="no-results">
        <p>No titles match your search.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  cards: {
    type: Array,
    required: true,
  },
  onCardClick: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(['card-click']);

const searchQuery = ref('');

const filteredCards = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.cards;
  }

  const query = searchQuery.value.toLowerCase();

  return props.cards.filter(card => {
    return card.title.toLowerCase().includes(query);
  });
});

const handleCardClick = title => {
  if (props.onCardClick) {
    props.onCardClick(title);
  } else {
    emit('card-click', title);
  }
};
</script>

<style scoped>
.card-list-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  width: 100%;
}

.search-container {
  margin-bottom: 2rem;
  text-align: center;
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(187, 134, 252, 0.2);
}

.cards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  width: 100%;
}

.card-item {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  cursor: pointer;
  border: 1px solid var(--border-color);
}

.card-item:hover {
  background: var(--bg-tertiary);
  transform: translateY(-3px);
  box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.3);
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 1.125rem;
  grid-column: 1 / -1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-list-container {
    padding: 0.75rem;
  }

  .search-input {
    max-width: 100%;
    padding: 0.6rem 0.8rem;
    font-size: 0.95rem;
  }

  .cards-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .card-title {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .card-list-container {
    padding: 0.5rem;
  }

  .search-input {
    padding: 0.5rem 0.7rem;
    font-size: 0.9rem;
  }

  .cards-list {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .card-item {
    padding: 0.8rem;
  }

  .card-title {
    font-size: 1rem;
  }
}

/* Tablet landscape */
@media (min-width: 769px) and (max-width: 1024px) {
  .cards-list {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}
</style>