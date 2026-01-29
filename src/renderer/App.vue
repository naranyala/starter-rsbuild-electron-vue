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
        class: 'modern dark-theme',
        background: windowTheme.bg,
        border: 4,
      });

      // Set the content after the window is created using WinBox's body property
      setTimeout(() => {
        if (winbox && winbox.body) {
          const contentDiv = winbox.body.querySelector(
            '.winbox-dynamic-content'
          );
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