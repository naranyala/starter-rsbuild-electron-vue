<template>
  <div class="app">
    <main class="app-main">
      <div class="container">
        <section class="hero-section">
          <h2 class="section-title">Electron Development</h2>
          <p class="section-description">
            Explore Electron capabilities and desktop application development
          </p>
        </section>

        <section class="cards-section">
          <CardList :cards="cardsData" :on-card-click="openCardDetail" />
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CardList from './CardList.vue';
import winboxService from './services/winbox-service.js';

// Sample detailed content for each card
const cardDetails = {
  Electron:
    'Electron is a framework for building cross-platform desktop applications using web technologies like HTML, CSS, and JavaScript. It combines the Chromium rendering engine and the Node.js runtime to create native-like experiences.',
  'Desktop Development':
    'Creating desktop applications that run natively on Windows, macOS, and Linux using familiar web technologies.',
  'Native APIs':
    'Access to native operating system features like file systems, notifications, and hardware through JavaScript APIs.',
  'Multi-platform':
    'Write once and deploy to multiple operating systems with a single codebase.',
  'Chromium Engine':
    'Leverages the power of Chromium for rendering, providing modern web standards support.',
  'Node.js Integration':
    'Full access to Node.js APIs and npm packages within the desktop application environment.',
  'Auto Updates':
    'Built-in mechanisms for automatically updating applications in the background.',
  'Tray Applications':
    'Create system tray applications that run in the background with minimal UI.',
  'Native Menus':
    'Create native application menus and context menus for each platform.',
  'File System Access':
    "Direct access to the user's file system for reading and writing files.",
  'Hardware Integration':
    'Access to hardware components like cameras, microphones, and sensors.',
  'Packaging Tools':
    'Tools to package applications for distribution on different platforms.',
};

const cardsData = ref([
  { title: 'Electron' },
  { title: 'Desktop Development' },
  { title: 'Native APIs' },
  { title: 'Multi-platform' },
  { title: 'Chromium Engine' },
  { title: 'Node.js Integration' },
  { title: 'Auto Updates' },
  { title: 'Tray Applications' },
  { title: 'Native Menus' },
  { title: 'File System Access' },
  { title: 'Hardware Integration' },
  { title: 'Packaging Tools' },
]);

// Function to handle card click and open winbox window
const openCardDetail = async cardTitle => {
  try {
    await winboxService.createWindowWithTitle(cardTitle, {
      id: `winbox-${cardTitle.replace(/\s+/g, '-').toLowerCase()}`,
      width: '600px',
      height: '500px',
      enableMaximize: true,
      enableMinimize: true,
    });
  } catch (error) {
    console.error('Failed to open WinBox window:', error);
    alert(`Could not open window for ${cardTitle}. WinBox failed to load.`);
  }
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #2d2d2d 0%, #1e1e1e 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.app-main {
  flex: 1;
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.section-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.cards-section {
  margin-bottom: 3rem;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .container {
    padding: 0 1.5rem;
  }

  .section-title {
    font-size: 2.25rem;
  }
}

@media (max-width: 768px) {
  .app-main {
    padding: 2rem 0;
  }

  .container {
    padding: 0 1rem;
    max-width: 100%;
  }

  .section-title {
    font-size: 2rem;
  }

  .section-description {
    font-size: 1rem;
    padding: 0 0.5rem;
  }

  .hero-section {
    margin-bottom: 2rem;
  }

  .cards-section {
    margin-bottom: 2rem;
  }
}

@media (max-width: 480px) {
  .app-main {
    padding: 1.5rem 0;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .section-description {
    font-size: 0.9rem;
  }
}

/* Large desktop screens */
@media (min-width: 1400px) {
  .container {
    max-width: 1400px;
    padding: 0 3rem;
  }

  .section-title {
    font-size: 3rem;
  }
}
</style>