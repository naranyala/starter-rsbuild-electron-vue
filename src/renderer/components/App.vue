<template>
  <div class="App">
    <main class="App-main">
      <div class="search-section">
        <input
          type="text"
          class="search-input"
          placeholder="Search topics..."
          v-model="searchTerm"
          aria-label="Search topics"
        />
        <button
          v-if="searchTerm"
          class="clear-search"
          @click="clearSearch"
          aria-label="Clear search"
        >
          ×
        </button>
      </div>

      <!-- Content Tab Filter Switcher -->
      <div class="tab-filter">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-button', { active: activeTab === tab.key }]"
          @click="setActiveTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="cards-list">
        <div
          v-for="(card, index) in filteredCards"
          :key="card.id || index"
          class="card"
          @click="handleCardClick(card, index)"
        >
          <div class="card-content">
            <h3 class="card-title">{{ processTitle(card.title, searchTerm) }}</h3>
            <div class="card-meta">
              <span class="card-category">{{ card.category }}</span>
            </div>
          </div>
        </div>

        <div v-if="filteredCards.length === 0" class="no-results">
          No results found
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import '../styles/App.css';
import { menuData } from '../../shared/constants';
import {
  ElectronArchitectureWindow,
  ElectronDevelopmentWindow,
  ElectronIntroWindow,
  ElectronNativeAPIsWindow,
  ElectronPackagingWindow,
  ElectronPerformanceWindow,
  ElectronSecurityWindow,
  ElectronVersionsWindow,
} from '../services';

export default {
  name: 'App',
  data() {
    return {
      searchTerm: '',
      activeTab: 'all', // Default to show all cards
      tabs: [
        { key: 'all', label: 'All Integrations' },
        { key: 'ui', label: 'UI Components' },
        { key: 'system', label: 'System APIs' },
        { key: 'devtools', label: 'Dev Tools' },
        { key: 'perf', label: 'Performance' },
        { key: 'security', label: 'Security' },
      ]
    };
  },
  computed: {
    filteredCards() {
      let filtered = menuData.filter(card => {
        const titleMatch = this.fuzzySearch(
          card.title,
          this.searchTerm
        ).matches;
        return titleMatch;
      });

      // Apply tab filter if not 'all'
      if (this.activeTab !== 'all') {
        filtered = filtered.filter(card => {
          // Map tab keys to categories or tags
          switch(this.activeTab) {
            case 'ui':
              return card.tags.includes('ui') ||
                     card.tags.includes('components') ||
                     card.tags.includes('rendering') ||
                     card.category.includes('ui') ||
                     card.title.toLowerCase().includes('ui') ||
                     card.title.toLowerCase().includes('component');
            case 'system':
              return card.tags.includes('system') ||
                     card.tags.includes('native') ||
                     card.tags.includes('os') ||
                     card.tags.includes('filesystem') ||
                     card.category.includes('api') ||
                     card.category.includes('system');
            case 'devtools':
              return card.tags.includes('devtools') ||
                     card.tags.includes('debugging') ||
                     card.tags.includes('development') ||
                     card.tags.includes('testing') ||
                     card.category.includes('development');
            case 'perf':
              return card.tags.includes('performance') ||
                     card.tags.includes('optimization') ||
                     card.tags.includes('memory') ||
                     card.category.includes('performance');
            case 'security':
              return card.tags.includes('security') ||
                     card.tags.includes('csp') ||
                     card.tags.includes('authentication') ||
                     card.category.includes('security');
            default:
              return true;
          }
        });
      }

      return filtered;
    },
  },
  methods: {
    fuzzySearch(text, query) {
      if (!query) return { matches: true, highlightedText: text };

      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();

      // Simple substring match instead of character-by-character matching
      const matches = lowerText.includes(lowerQuery);

      return { matches: matches, highlightedText: text };
    },

    processTitle(title, searchTerm) {
      // Just return the original title since we're no longer highlighting
      return title;
    },

    handleCardClick(card, index) {
      const { id, title } = card;

      switch (id) {
        case 'electron-intro':
          ElectronIntroWindow.create();
          break;
        case 'electron-architecture':
          ElectronArchitectureWindow.create();
          break;
        case 'electron-security':
          ElectronSecurityWindow.create();
          break;
        case 'electron-packaging':
          ElectronPackagingWindow.create();
          break;
        case 'electron-native-apis':
          ElectronNativeAPIsWindow.create();
          break;
        case 'electron-performance':
          ElectronPerformanceWindow.create();
          break;
        case 'electron-development':
          ElectronDevelopmentWindow.create();
          break;
        case 'electron-versions':
          ElectronVersionsWindow.create();
          break;
        default:
          import('../services/window-factory').then(({ WindowFactory }) => {
            WindowFactory.createWindow(title);
          });
          break;
      }
    },

    clearSearch() {
      this.searchTerm = '';
    },

    setActiveTab(tabKey) {
      this.activeTab = tabKey;
    },
  },
};
</script>

<style scoped>
</style>
