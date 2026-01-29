<template>
  <div class="accordion">
    <div 
      v-for="(item, index) in items" 
      :key="index" 
      class="accordion-item"
      :class="{ 'item-active': activeIndex === index }"
    >
      <button 
        class="accordion-header" 
        @click="toggleAccordion(index)"
        :aria-expanded="activeIndex === index"
        :aria-controls="`panel-${index}`"
      >
        <span class="accordion-title">{{ item.title }}</span>
        <span 
          class="accordion-icon"
          :class="{ 'icon-active': activeIndex === index }"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
          </svg>
        </span>
      </button>
      <transition name="accordion-content">
        <div 
          v-if="activeIndex === index" 
          class="accordion-content"
          :id="`panel-${index}`"
          role="region"
        >
          <div class="accordion-text">{{ item.content }}</div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const activeIndex = ref(null);

const toggleAccordion = index => {
  activeIndex.value = activeIndex.value === index ? null : index;
};
</script>

<style scoped>
.accordion {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background: white;
}

.accordion-item {
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.accordion-item:last-child {
  border-bottom: none;
}

.accordion-item.item-active {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.accordion-header {
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s ease;
  position: relative;
}

.accordion-header:hover {
  background: rgba(59, 130, 246, 0.05);
  color: #2563eb;
}

.accordion-item.item-active .accordion-header {
  color: #2563eb;
  background: rgba(59, 130, 246, 0.08);
}

.accordion-title {
  flex: 1;
  padding-right: 1rem;
}

.accordion-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #6b7280;
  flex-shrink: 0;
}

.icon-active {
  transform: rotate(180deg);
  color: #2563eb;
}

.accordion-content {
  border-top: 1px solid #e5e7eb;
}

.accordion-text {
  padding: 1.25rem 1.5rem;
  color: #4b5563;
  line-height: 1.6;
  font-size: 0.95rem;
  background: white;
}

/* Accordion content transition */
.accordion-content-enter-active,
.accordion-content-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.accordion-content-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.accordion-content-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.accordion-content-enter-to,
.accordion-content-leave-from {
  max-height: 300px;
  opacity: 1;
  transform: translateY(0);
}
</style>