# Biome Linter & Formatter Setup Guide

## Overview

This project uses **Biome** (formerly Rome) as the unified linter and formatter for all JavaScript, TypeScript, JSON, and Vue files. Biome is significantly faster than ESLint + Prettier and provides a consistent code style across the entire codebase.

## Quick Start

```bash
# Install dependencies (if not already installed)
bun install

# Run linter
bun run lint

# Auto-fix lint issues
bun run lint:fix

# Format all files
bun run format

# Check formatting without writing
bun run lint --formatter=enabled
```

## VS Code Integration

### Required Extension

Install the **Biome** extension:
- Extension ID: `biomejs.biome`
- [Download from Marketplace](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)

### Recommended Settings

The project includes `.vscode/settings.json` with:
- Format on save enabled
- Biome as default formatter
- Auto-fix on save
- Vue file associations

### Manual VS Code Setup

If settings aren't applied automatically, add to your VS Code settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "editor.codeActionsOnSave": {
    "source.fixAll.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[vue]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

## Configuration

### Main Config: `biome.json`

Key configuration sections:

#### 1. **Files Configuration**
```json
{
  "files": {
    "ignoreUnknown": true,
    "ignore": [
      "node_modules/**",
      "dist/**",
      "dist-ts/**",
      "build/**"
    ],
    "includes": [
      "src/**/*",
      "scripts/**/*",
      "*.vue"
    ]
  }
}
```

#### 2. **Formatter Settings**
```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80,
    "lineEnding": "lf"
  }
}
```

#### 3. **JavaScript/Vue Formatter**
```json
{
  "javascript": {
    "formatter": {
      "arrowParentheses": "asNeeded",
      "bracketSpacing": true,
      "trailingCommas": "es5",
      "semicolons": "always",
      "quoteStyle": "single",
      "jsxQuoteStyle": "double"
    }
  }
}
```

#### 4. **Linter Rules**
```json
{
  "linter": {
    "rules": {
      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": "error"
      },
      "style": {
        "useImportType": "error",
        "useSelfClosingElements": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn",
        "noArrayIndexKey": "warn"
      }
    }
  }
}
```

#### 5. **Vue-Specific Overrides**
```json
{
  "overrides": [
    {
      "include": ["*.vue"],
      "linter": {
        "rules": {
          "correctness": {
            "noUnusedImports": "off",
            "noUnusedVariables": "off"
          }
        }
      }
    }
  ]
}
```

## Code Style Guide

### JavaScript/TypeScript

```typescript
// ✅ Correct
import type { Component } from 'vue';
import { ref, computed } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);

function greet(name: string): string {
  return `Hello, ${name}!`;
}

const items = [1, 2, 3];
items.forEach(item => {
  console.log(item);
});

// ❌ Incorrect
import { Component } from 'vue'; // Should use type import
import * as Vue from 'vue'; // Avoid namespace imports

var x = 1; // Use const/let
if (x == 1) { } // Use ===
```

### Vue Components

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

// Props
interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
});

// Emits
interface Emits {
  (e: 'update', value: number): void;
}

const emit = defineEmits<Emits>();

// Reactive state
const localCount = ref(props.count);
</script>

<template>
  <div class="component">
    <h2>{{ title }}</h2>
    <p>Count: {{ localCount }}</p>
    <button @click="emit('update', localCount + 1)">
      Increment
    </button>
  </div>
</template>

<style scoped>
.component {
  padding: 16px;
}
</style>
```

### JSON Files

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "vue": "^3.5.0"
  }
}
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `lint` | `biome check .` | Check all files for issues |
| `lint:fix` | `biome check --fix .` | Auto-fix issues |
| `format` | `biome format --write .` | Format all files |
| `lint:staged` | `biome check --staged` | Check staged files only |

## Common Issues & Solutions

### 1. Vue Files Not Formatting

**Problem:** Vue files aren't being formatted correctly.

**Solution:** Ensure Biome extension is installed and Vue language support (Volar) is enabled.

### 2. Import Sorting

**Problem:** Imports aren't sorted automatically.

**Solution:** Run `biome check --fix` or enable "Organize Imports" on save in VS Code.

### 3. `any` Type Warnings

**Problem:** Getting warnings for `any` types.

**Solution:** Either use proper types or disable the rule for specific cases:

```typescript
// biome-ignore lint/suspicious/noExplicitAny: Legacy code
function legacyFunction(data: any) {
  // ...
}
```

### 4. Console.log Warnings

**Problem:** Getting warnings for `console.log` in development code.

**Solution:** Console logs are allowed in `src/renderer/` and `src/main/` directories via overrides. For other directories, use:

```typescript
// biome-ignore lint/suspicious/noConsoleLog: Debug logging
console.log('Debug info');
```

### 5. Unused Variables in Vue

**Problem:** Getting unused variable warnings in Vue components.

**Solution:** Vue files have relaxed rules for unused variables. If still occurring, prefix with underscore:

```typescript
const _unused = 'value';
```

## Migration from ESLint + Prettier

If migrating from ESLint + Prettier:

1. **Remove old dependencies:**
```bash
npm uninstall eslint prettier eslint-config-prettier eslint-plugin-vue @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

2. **Remove old config files:**
```bash
rm .eslintrc* .prettierrc* .eslintignore .prettierignore
```

3. **Install Biome:**
```bash
bun add -d @biomejs/biome
```

4. **Run Biome:**
```bash
bun run format
bun run lint:fix
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# GitHub Actions example
- name: Lint
  run: bun run lint

- name: Format Check
  run: bun run format --check
```

## Performance

Biome is significantly faster than ESLint + Prettier:

| Tool | Time (approx) |
|------|---------------|
| Biome | ~200ms |
| ESLint + Prettier | ~2000ms |

## Rules Reference

### Enabled Rules

- **Correctness:** No unused imports/variables, exhaustive deps, hooks at top level
- **Style:** Import type, self-closing elements, fragment syntax
- **Suspicious:** No explicit any (warn), no array index keys (warn)
- **Complexity:** No useless fragments, use arrow functions
- **A11y:** Recommended accessibility rules

### Disabled Rules

- `noForEach` - forEach is allowed for readability
- `noImportantStyles` - !important sometimes necessary
- `noUnknownProperty` - Vue dynamic props
- `noConsoleLog` - Allowed in dev code

## Additional Resources

- [Biome Documentation](https://biomejs.dev/)
- [Biome Rules](https://biomejs.dev/linter/rules/)
- [Biome VS Code Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- [Vue with Biome](https://biomejs.dev/guides/how-to-setup-biome/#vue-support)
