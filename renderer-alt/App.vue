<template>
  <div class="App">
    <main class="App-main-no-navbar">
      <div class="search-container-no-navbar">
        <input
          type="text"
          class="search-input"
          placeholder="Search topics..."
          v-model="searchTerm"
        />
        <div class="cards-list">
          <div
            v-for="(card, index) in filteredCards"
            :key="card.id || index"
            class="simple-card"
            @click="handleCardClick(card, index)"
          >
            <h3
              class="simple-card-title"
              v-html="processTitle(card.title, searchTerm)"
            />
          </div>
          <div v-if="filteredCards.length === 0" class="no-results">
            No matching topics found
          </div>
        </div>
      </div>
    </main>
    <footer class="App-footer">
      <p>Get started by editing <code>src/App.vue</code> and save to reload.</p>
    </footer>
  </div>
</template>

<script>
import './styles/App.css';
import 'winbox/dist/css/winbox.min.css';
import WinBox from 'winbox/src/js/winbox';
import { menuData } from './lib/menu-data';
import { generateTheme, generateWindowContent } from './lib/window-generator';

export default {
  name: 'App',
  data() {
    return {
      searchTerm: '',
    };
  },
  computed: {
    filteredCards() {
      return menuData.filter((card, index) => {
        const titleMatch = this.fuzzySearch(card.title, this.searchTerm).matches;
        return titleMatch;
      });
    },
  },
  methods: {
    fuzzySearch(text, query) {
      if (!query) return { matches: true, highlightedText: text };

      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();

      let matchFound = true;
      let highlightedText = '';
      let queryIndex = 0;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const lowerChar = char.toLowerCase();

        if (queryIndex < lowerQuery.length && lowerChar === lowerQuery[queryIndex]) {
          highlightedText += `<mark>${char}</mark>`;
          queryIndex++;
        } else {
          highlightedText += char;
        }
      }

      // Check if all query characters were found in sequence
      matchFound = queryIndex === lowerQuery.length;

      return { matches: matchFound, highlightedText };
    },

    processTitle(title, searchTerm) {
      const processedTitle = this.fuzzySearch(title, searchTerm);
      return processedTitle.matches ? processedTitle.highlightedText : title;
    },

    handleCardClick(card, index) {
      const { title, content } = card;

      // Define different themes for variety
      const themes = [
        { name: 'blue', bg: '#4a6cf7', color: 'white' },
        { name: 'green', bg: '#4ade80', color: 'black' },
        { name: 'purple', bg: '#a78bfa', color: 'white' },
        { name: 'red', bg: '#f87171', color: 'white' },
        { name: 'yellow', bg: '#fbbf24', color: 'black' },
        { name: 'indigo', bg: '#6366f1', color: 'white' },
      ];

      // Select a theme based on the index to have consistent colors
      const theme = themes[index % themes.length];

      // Generate dynamic content and theme based on the title
      const dynamicContent = generateWindowContent(title);
      const windowTheme = generateTheme(title);

      // Create a WinBox window with the generated content
      const winbox = new WinBox({
        title: title,
        html: `<div class="winbox-content"><h3 style="color: ${windowTheme.color};">${title}</h3><div style="color: ${windowTheme.color};" class="winbox-dynamic-content">Loading content...</div></div>`,
        width: '500px',
        height: '400px',
        x: 'center',
        y: 'center',
        class: 'modern',
        background: windowTheme.bg,
        border: 4,
      });

      // Set the content after the window is created using WinBox's body property
      setTimeout(() => {
        if (winbox && winbox.body) {
          const contentDiv = winbox.body.querySelector('.winbox-dynamic-content');
          if (contentDiv) {
            contentDiv.innerHTML = dynamicContent;
          } else {
            // If we can't find the specific div, replace all content in the body
            winbox.body.innerHTML = `<div class="winbox-content"><h3 style="color: ${windowTheme.color};">${title}</h3><div style="color: ${windowTheme.color};">${dynamicContent}</div></div>`;
          }
        }
      }, 10);
    },
  },
};
</script>

<style scoped>
/* Styles will be imported from the existing App.css */
</style>