/**
 * Shared Module Tests
 * Tests for shared utilities, errors, and types
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { BaseError } from '../errors/base.error';
import { getAllChannels, IPC_CHANNELS } from '../ipc/channels';
import {
  Err,
  fromTry,
  isErr,
  isOk,
  map,
  mapErr,
  Ok,
  unwrap,
  unwrapOr,
} from '../result';

// ============================================================================
// BaseError Tests
// ============================================================================

describe('BaseError', () => {
  it('should create error with message', () => {
    const error = new BaseError('Something went wrong');
    expect(error.message).toBe('Something went wrong');
    expect(error.name).toBe('BaseError');
  });

  it('should create error with code', () => {
    const error = new BaseError('Error message', { code: 'TEST_ERROR' });
    expect(error.code).toBe('TEST_ERROR');
  });

  it('should create error with details', () => {
    const details = { field: 'value', count: 42 };
    const error = new BaseError('Error message', { details });
    expect(error.details).toEqual(details);
  });

  it('should create error with cause', () => {
    const cause = new Error('Original error');
    const error = new BaseError('Wrapped error', { cause });
    expect(error.cause).toBe(cause);
  });

  it('should have default code UNKNOWN_ERROR', () => {
    const error = new BaseError('Error without code');
    expect(error.code).toBe('UNKNOWN_ERROR');
  });

  it('should capture stack trace', () => {
    const error = new BaseError('Test error');
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('BaseError');
  });

  it('should serialize to JSON', () => {
    const error = new BaseError('Test error', {
      code: 'TEST_ERROR',
      details: { key: 'value' },
    });
    const json = error.toJSON();
    expect(json).toEqual({
      name: 'BaseError',
      message: 'Test error',
      code: 'TEST_ERROR',
      details: { key: 'value' },
      timestamp: expect.any(String),
      stack: expect.any(String),
    });
  });

  it('should have timestamp', () => {
    const before = Date.now();
    const error = new BaseError('Test');
    const after = Date.now();
    const errorTime = new Date(error.timestamp).getTime();
    expect(errorTime).toBeGreaterThanOrEqual(before);
    expect(errorTime).toBeLessThanOrEqual(after);
  });
});

// ============================================================================
// Result Type Tests
// ============================================================================

describe('Result Type', () => {
  describe('Ok', () => {
    it('should create Ok with value', () => {
      const result = Ok(42);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(42);
    });

    it('should create Ok with object', () => {
      const obj = { name: 'test', value: 123 };
      const result = Ok(obj);
      expect(result.ok).toBe(true);
      expect(result.value).toEqual(obj);
    });

    it('should create Ok with null', () => {
      const result = Ok(null);
      expect(result.ok).toBe(true);
      expect(result.value).toBeNull();
    });
  });

  describe('Err', () => {
    it('should create Err with Error', () => {
      const error = new Error('Test error');
      const result = Err(error);
      expect(result.ok).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should create Err with string', () => {
      const result = Err('Error message');
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Error message');
    });
  });

  describe('isOk', () => {
    it('should return true for Ok', () => {
      expect(isOk(Ok(42))).toBe(true);
    });

    it('should return false for Err', () => {
      expect(isOk(Err(new Error('test')))).toBe(false);
    });
  });

  describe('isErr', () => {
    it('should return true for Err', () => {
      expect(isErr(Err(new Error('test')))).toBe(true);
    });

    it('should return false for Ok', () => {
      expect(isErr(Ok(42))).toBe(false);
    });
  });

  describe('map', () => {
    it('should transform Ok value', () => {
      const result = Ok(5);
      const mapped = map(result, x => x * 2);
      expect(isOk(mapped)).toBe(true);
      expect((mapped as any).value).toBe(10);
    });

    it('should not transform Err', () => {
      const error = new Error('test');
      const result = Err(error);
      const mapped = map(result, x => x * 2);
      expect(isErr(mapped)).toBe(true);
      expect((mapped as any).error).toBe(error);
    });
  });

  describe('mapErr', () => {
    it('should transform Err value', () => {
      const result = Err('error');
      const mapped = mapErr(result, e => e.toUpperCase());
      expect(isErr(mapped)).toBe(true);
      expect((mapped as any).error).toBe('ERROR');
    });

    it('should not transform Ok', () => {
      const result = Ok(42);
      const mapped = mapErr(result, e => e.toUpperCase());
      expect(isOk(mapped)).toBe(true);
      expect((mapped as any).value).toBe(42);
    });
  });

  describe('unwrap', () => {
    it('should return value for Ok', () => {
      expect(unwrap(Ok(42))).toBe(42);
    });

    it('should throw for Err', () => {
      expect(() => unwrap(Err(new Error('test')))).toThrow();
    });
  });

  describe('unwrapOr', () => {
    it('should return value for Ok', () => {
      expect(unwrapOr(Ok(42), 0)).toBe(42);
    });

    it('should return default for Err', () => {
      expect(unwrapOr(Err(new Error('test')), 42)).toBe(42);
    });
  });

  describe('fromTry', () => {
    it('should return Ok for successful function', () => {
      const result = fromTry(() => 42);
      expect(isOk(result)).toBe(true);
      expect((result as any).value).toBe(42);
    });

    it('should return Err for throwing function', () => {
      const result = fromTry(() => {
        throw new Error('Test error');
      });
      expect(isErr(result)).toBe(true);
      expect((result as any).error.message).toBe('Test error');
    });
  });
});

// ============================================================================
// IPC Channels Tests
// ============================================================================

describe('IPC Channels', () => {
  it('should have FILE channels defined', () => {
    expect(IPC_CHANNELS.FILE.READ).toBe('fs:readFile');
    expect(IPC_CHANNELS.FILE.WRITE).toBe('fs:writeFile');
    expect(IPC_CHANNELS.FILE.EXISTS).toBe('fs:exists');
  });

  it('should have WINDOW channels defined', () => {
    expect(IPC_CHANNELS.WINDOW.MINIMIZE).toBe('window:minimize');
    expect(IPC_CHANNELS.WINDOW.MAXIMIZE).toBe('window:maximize');
    expect(IPC_CHANNELS.WINDOW.CLOSE).toBe('window:close');
  });

  it('should have APP channels defined', () => {
    expect(IPC_CHANNELS.APP.GET_VERSION).toBe('app:getVersion');
    expect(IPC_CHANNELS.APP.GET_NAME).toBe('app:getName');
    expect(IPC_CHANNELS.APP.QUIT).toBe('app:quit');
  });

  it('should have SYSTEM channels defined', () => {
    expect(IPC_CHANNELS.SYSTEM.GET_PLATFORM).toBe('system:getPlatform');
    expect(IPC_CHANNELS.SYSTEM.GET_ARCH).toBe('system:getArch');
  });

  it('should have USE_CASE channels defined', () => {
    expect(IPC_CHANNELS.USE_CASE.ELECTRON_INTRO).toBe(
      'use-case:electron-intro'
    );
    expect(IPC_CHANNELS.USE_CASE.ELECTRON_SECURITY).toBe(
      'use-case:electron-security'
    );
  });

  it('should extract all channels', () => {
    const channels = getAllChannels();
    expect(channels.length).toBeGreaterThan(10);
    expect(channels).toContain('fs:readFile');
    expect(channels).toContain('window:minimize');
    expect(channels).toContain('app:getVersion');
  });

  it('should have DIALOG channels', () => {
    expect(IPC_CHANNELS.DIALOG.OPEN).toBe('dialog:showOpenDialog');
    expect(IPC_CHANNELS.DIALOG.SAVE).toBe('dialog:showSaveDialog');
  });

  it('should have CLIPBOARD channels', () => {
    expect(IPC_CHANNELS.CLIPBOARD.READ_TEXT).toBe('clipboard:readText');
    expect(IPC_CHANNELS.CLIPBOARD.WRITE_TEXT).toBe('clipboard:writeText');
  });
});
