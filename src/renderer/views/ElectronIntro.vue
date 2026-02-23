<template>
  <div class="winbox-content">
    <h3 style="color: var(--theme-color);">{{ title }}</h3>
    <div v-if="loading" style="color: var(--theme-color);" class="winbox-dynamic-content">
      <p>Loading content...</p>
    </div>
    <div v-else-if="content" style="color: var(--theme-color);" class="winbox-dynamic-content">
      <div v-html="content"></div>
    </div>
    <div v-else style="color: var(--theme-color);" class="winbox-dynamic-content">
      <p>Error loading content.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ElectronIntro',
  props: {
    title: {
      type: String,
      default: 'What is Electron?',
    },
  },
  data() {
    return {
      content: null,
      loading: true,
    };
  },
  async mounted() {
    // Set theme color dynamically based on title
    this.setThemeColor();

    // Fetch content from backend
    await this.fetchContent();
  },
  methods: {
    async fetchContent() {
      try {
        // Call the backend handler to get content
        const response = await window.electronAPI.ipc.invoke(
          'use-case:electron-intro'
        );
        if (response.success) {
          this.content = response.data.content;
        } else {
          console.error('Failed to fetch content:', response.error);
          this.content = '<p>Failed to load content.</p>';
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        this.content = '<p>Error loading content.</p>';
      } finally {
        this.loading = false;
      }
    },
    setThemeColor() {
      // Generate a consistent theme based on the title
      const theme = this.generateTheme(this.title);
      this.$el.style.setProperty('--theme-bg', theme.bg);
      this.$el.style.setProperty('--theme-color', theme.color);
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
.winbox-content {
  padding: 15px;
  height: 100%;
  overflow-y: auto;
}
</style>