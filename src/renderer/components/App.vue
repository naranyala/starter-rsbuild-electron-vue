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

      <div class="cards-list">
        <div
          v-for="(card, index) in filteredCards"
          :key="card.id || index"
          class="card"
          @click="handleCardClick(card, index)"
        >
          <div class="card-content">
            <h3 class="card-title" v-html="processTitle(card.title, searchTerm)"/>
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
    };
  },
  computed: {
    filteredCards() {
      return menuData.filter(card => {
        const titleMatch = this.fuzzySearch(
          card.title,
          this.searchTerm
        ).matches;
        return titleMatch;
      });
    },
  },
  methods: {
    fuzzySearch(text, query) {
      if (!query) return { matches: true, highlightedText: text };

      const lowerQuery = query.toLowerCase();
      let matchFound = true;
      let highlightedText = '';
      let queryIndex = 0;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const lowerChar = char.toLowerCase();

        if (
          queryIndex < lowerQuery.length &&
          lowerChar === lowerQuery[queryIndex]
        ) {
          highlightedText += `<mark>${char}</mark>`;
          queryIndex++;
        } else {
          highlightedText += char;
        }
      }

      matchFound = queryIndex === lowerQuery.length;

      return { matches: matchFound, highlightedText };
    },

    processTitle(title, searchTerm) {
      const processedTitle = this.fuzzySearch(title, searchTerm);
      return processedTitle.matches ? processedTitle.highlightedText : title;
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
  },
};
</script>

<style scoped>
</style>
