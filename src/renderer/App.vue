<template>
  <div class="App">
    <main class="App-main-no-navbar">
      <div class="search-container-no-navbar">
        <input
          type="text"
          class="search-input"
          placeholder="Search topics..."
          v-model="searchTerm"
          autocomplete="off"
          spellcheck="false"
        />
        <div class="cards-list">
          <div
            v-for="(card, index) in filteredCards"
            :key="card.id || card.index"
            class="simple-card"
            @click="handleCardClick(card, card.index)"
            :title="`Click to view details about ${card.title}`"
          >
            <h3
              class="simple-card-title"
              v-html="card.highlightedTitle"
            />
          </div>
          <div v-if="filteredCards.length === 0" class="no-results">
            No matching topics found
          </div>
        </div>
      </div>
    </main>
    <footer class="App-footer">
      <p>Electron + Vue Starter | <code>renderer-alt</code> | Desktop Application</p>
    </footer>
  </div>
</template>

<script>
import './styles/App.css';
import 'winbox/dist/css/winbox.min.css';
import WinBox from 'winbox/src/js/winbox';
import { menuData } from './lib/menu-data';
import { useCaseComponentObjects } from './use-cases';

export default {
  name: 'App',
  data() {
    return {
      searchTerm: '',
    };
  },
  computed: {
    filteredCards() {
      return menuData
        .map((card, index) => {
          const searchResult = this.fuzzySearch(card.title, this.searchTerm);
          return {
            ...card,
            index,
            searchScore: searchResult.score,
            highlightedTitle: searchResult.highlightedText,
            matches: searchResult.matches,
          };
        })
        .filter(card => card.matches)
        .sort((a, b) => b.searchScore - a.searchScore);
    },
  },
  methods: {
    fuzzySearch(text, query) {
      if (!query || query.trim() === '')
        return { matches: true, highlightedText: text, score: 1 };

      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase().trim();

      // Prioritize exact word matches first
      if (lowerText === lowerQuery) {
        return {
          matches: true,
          highlightedText: `<mark>${text}</mark>`,
          score: 2,
        };
      }

      // Check for exact substring match (highest priority)
      if (lowerText.includes(lowerQuery)) {
        const startIndex = lowerText.indexOf(lowerQuery);
        const endIndex = startIndex + lowerQuery.length;
        const beforeMatch = text.substring(0, startIndex);
        const match = text.substring(startIndex, endIndex);
        const afterMatch = text.substring(endIndex);
        const highlightedText = `${beforeMatch}<mark>${match}</mark>${afterMatch}`;
        return { matches: true, highlightedText, score: 1.5 };
      }

      // Fuzzy character matching as last resort
      const queryChars = lowerQuery.split('');
      let textIndex = 0;
      let queryIndex = 0;
      const matches = [];
      let score = 0;

      while (textIndex < lowerText.length && queryIndex < queryChars.length) {
        if (lowerText[textIndex] === queryChars[queryIndex]) {
          matches.push(textIndex);
          score += 1; // Basic match score

          // Bonus for consecutive matches
          if (queryIndex > 0 && matches[queryIndex - 1] === textIndex - 1) {
            score += 2;
          }

          queryIndex++;
        }
        textIndex++;
      }

      if (queryIndex === queryChars.length) {
        // All characters found - create highlighted text
        let highlightedText = '';
        let lastIndex = 0;

        matches.forEach((matchIndex, i) => {
          highlightedText += text.substring(lastIndex, matchIndex);
          highlightedText += `<mark>${text[matchIndex]}</mark>`;
          lastIndex = matchIndex + 1;
        });
        highlightedText += text.substring(lastIndex);

        // Normalize score
        score = score / (queryChars.length * 3);

        return { matches: true, highlightedText, score };
      }

      return { matches: false, highlightedText: text, score: 0 };
    },

    processTitle(title, searchTerm) {
      const processedTitle = this.fuzzySearch(title, searchTerm);
      return processedTitle.matches ? processedTitle.highlightedText : title;
    },

    async handleCardClick(card, index) {
      const { id, title } = card;

      // Generate theme based on the title
      const windowTheme = this.generateTheme(title);

      // Create a WinBox window with an empty container
      const winbox = new WinBox({
        title: title,
        html: `<div class="winbox-content-container" style="width: 100%; height: 100%;"></div>`,
        width: '500px',
        height: '400px',
        x: 'center',
        y: 'center',
        class: 'modern dark-theme',
        background: windowTheme.bg,
        border: 4,
      });

      // Dynamically import and mount the component after the window is created
      try {
        const componentModule = await useCaseComponentObjects[id]();
        const ComponentConstructor = componentModule.default;

        // Wait a bit for the window to be fully created
        setTimeout(async () => {
          if (winbox && winbox.body) {
            // Create a container element for the Vue component
            const container = winbox.body.querySelector(
              '.winbox-content-container'
            );

            if (container) {
              // Create a temporary Vue instance to render the component
              const tempDiv = document.createElement('div');
              container.appendChild(tempDiv);

              // Import Vue to create the component instance
              const { createApp } = await import('vue');

              // Create the component with props
              const app = createApp(ComponentConstructor, {
                title: title,
              });

              // Mount the component
              app.mount(tempDiv);
            }
          }
        }, 10);
      } catch (error) {
        console.error(`Failed to load component for card ID: ${id}`, error);

        // Fallback: show an error message in the window
        setTimeout(() => {
          if (winbox && winbox.body) {
            winbox.body.innerHTML = `<div class="winbox-content"><h3 style="color: white;">Error</h3><p style="color: white;">Could not load content for "${title}".</p></div>`;
          }
        }, 10);
      }
    },

    generateTheme(title) {
      const lowerTitle = title.toLowerCase();
      const themes = [
        { name: 'blue', bg: '#4a6cf7', color: 'white' },
        { name: 'green', bg: '#4ade80', color: 'black' },
        { name: 'purple', bg: '#a78bfa', color: 'white' },
        { name: 'red', bg: '#f87171', color: 'white' },
        { name: 'yellow', bg: '#fbbf24', color: 'black' },
        { name: 'indigo', bg: '#6366f1', color: 'white' },
        { name: 'pink', bg: '#ec4899', color: 'white' },
        { name: 'teal', bg: '#14b8a6', color: 'white' },
        { name: 'orange', bg: '#f97316', color: 'white' },
        { name: 'gray', bg: '#6b7280', color: 'white' },
      ];

      // Create a simple hash of the title to consistently select the same theme for the same title
      let hash = 0;
      for (let i = 0; i < lowerTitle.length; i++) {
        hash = lowerTitle.charCodeAt(i) + ((hash << 5) - hash);
      }

      const index = Math.abs(hash) % themes.length;
      return themes[index];
    },
  },
};
</script>

<style scoped>
/* Styles will be imported from the existing App.css */
</style>
