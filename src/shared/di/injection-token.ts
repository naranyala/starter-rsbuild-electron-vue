/**
 * Injection Token for Dependency Injection
 * Provides type-safe dependency identification
 */
export class InjectionToken<T> {
  public readonly name: string;
  public readonly description?: string;

  constructor(name: string, description?: string) {
    this.name = name;
    this.description = description;
  }

  toString(): string {
    return `InjectionToken<${this.name}>`;
  }
}
