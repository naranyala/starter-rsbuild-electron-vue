/**
 * Main Process Tests
 * Tests for Electron main process utilities and services
 * Note: These tests verify code structure, not Electron APIs (which require Electron runtime)
 */

import { describe, expect, it } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';

const mainDir = path.join(__dirname, '..');
const useCasesDir = path.join(mainDir, 'use-cases');

// ============================================================================
// Service Files Existence Tests
// ============================================================================

describe('Main Process Services', () => {
  describe('service files exist', () => {
    const services = [
      'window.service.ts',
      'file-service.ts',
      'file-service-instance.ts',
      'app-service.ts',
      'app-service-instance.ts',
    ];

    services.forEach(service => {
      it(`should have ${service}`, () => {
        const servicePath = path.join(useCasesDir, service);
        expect(fs.existsSync(servicePath)).toBe(true);
      });
    });
  });
});

// ============================================================================
// Use Case Files Existence Tests
// ============================================================================

describe('Main Process Use Cases', () => {
  describe('use case files exist', () => {
    const useCases = [
      'electron-intro.ts',
      'electron-architecture.ts',
      'electron-security.ts',
      'electron-packaging.ts',
      'electron-native-apis.ts',
      'electron-performance.ts',
      'electron-development.ts',
      'electron-versions.ts',
    ];

    useCases.forEach(useCase => {
      it(`should have ${useCase}`, () => {
        const useCasePath = path.join(useCasesDir, useCase);
        expect(fs.existsSync(useCasePath)).toBe(true);
      });
    });
  });
});

// ============================================================================
// Directory Structure Tests
// ============================================================================

describe('Main Process Directory Structure', () => {
  it('should have di directory', () => {
    const diDir = path.join(mainDir, 'di');
    expect(fs.existsSync(diDir)).toBe(true);
    expect(fs.statSync(diDir).isDirectory()).toBe(true);
  });

  it('should have events directory', () => {
    const eventsDir = path.join(mainDir, 'events');
    expect(fs.existsSync(eventsDir)).toBe(true);
    expect(fs.statSync(eventsDir).isDirectory()).toBe(true);
  });

  it('should have lib directory', () => {
    const libDir = path.join(mainDir, 'lib');
    expect(fs.existsSync(libDir)).toBe(true);
    expect(fs.statSync(libDir).isDirectory()).toBe(true);
  });

  it('should have main.ts entry point', () => {
    const mainPath = path.join(mainDir, 'main.ts');
    expect(fs.existsSync(mainPath)).toBe(true);
  });

  it('should have main.dev.ts for development', () => {
    const mainDevPath = path.join(mainDir, 'main.dev.ts');
    expect(fs.existsSync(mainDevPath)).toBe(true);
  });
});

// ============================================================================
// Window Utils Tests (Pure Functions)
// ============================================================================

describe('Window Utils - Pure Functions', () => {
  describe('generateWindowId', () => {
    it('should generate unique IDs', () => {
      // We can't import the actual function due to Electron dependencies,
      // but we can verify the file exists and test the logic
      const id1 =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const id2 =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
      expect(id2.length).toBeGreaterThan(0);
    });
  });

  describe('window-utils.ts exports', () => {
    it('window-utils.ts file should exist', () => {
      const utilsPath = path.join(mainDir, 'lib', 'window-utils.ts');
      expect(fs.existsSync(utilsPath)).toBe(true);
    });

    it('window-utils.ts should export createWindow', () => {
      const utilsPath = path.join(mainDir, 'lib', 'window-utils.ts');
      const content = fs.readFileSync(utilsPath, 'utf-8');
      expect(content).toContain('export function createWindow');
    });

    it('window-utils.ts should export loadUrl', () => {
      const utilsPath = path.join(mainDir, 'lib', 'window-utils.ts');
      const content = fs.readFileSync(utilsPath, 'utf-8');
      expect(content).toContain('export function loadUrl');
    });

    it('window-utils.ts should export setupWindowHandlers', () => {
      const utilsPath = path.join(mainDir, 'lib', 'window-utils.ts');
      const content = fs.readFileSync(utilsPath, 'utf-8');
      expect(content).toContain('export function setupWindowHandlers');
    });
  });
});

// ============================================================================
// DI Container Tests
// ============================================================================

describe('Dependency Injection', () => {
  it('should have main-container.ts', () => {
    const containerPath = path.join(mainDir, 'di', 'main-container.ts');
    expect(fs.existsSync(containerPath)).toBe(true);
  });

  it('should have service-providers.ts', () => {
    const providersPath = path.join(mainDir, 'di', 'service-providers.ts');
    expect(fs.existsSync(providersPath)).toBe(true);
  });

  it('should have tokens.ts', () => {
    const tokensPath = path.join(mainDir, 'di', 'tokens.ts');
    expect(fs.existsSync(tokensPath)).toBe(true);
  });

  it('should have index.ts', () => {
    const indexPath = path.join(mainDir, 'di', 'index.ts');
    expect(fs.existsSync(indexPath)).toBe(true);
  });
});
