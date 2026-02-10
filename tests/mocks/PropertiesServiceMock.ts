/**
 * PropertiesService モック
 * Google Apps ScriptのPropertiesServiceをテスト用にシミュレート
 */

export interface MockProperties {
  getProperty(key: string): string | null;
  setProperty(key: string, value: string): MockProperties;
  deleteProperty(key: string): MockProperties;
  getProperties(): Record<string, string>;
  setProperties(properties: Record<string, string>, deleteAllOthers?: boolean): MockProperties;
  deleteAllProperties(): MockProperties;
  getKeys(): string[];
}

class MockPropertiesImpl implements MockProperties {
  private properties: Map<string, string> = new Map();

  getProperty(key: string): string | null {
    return this.properties.get(key) || null;
  }

  setProperty(key: string, value: string): MockProperties {
    this.properties.set(key, value);
    return this;
  }

  deleteProperty(key: string): MockProperties {
    this.properties.delete(key);
    return this;
  }

  getProperties(): Record<string, string> {
    const result: Record<string, string> = {};
    this.properties.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  setProperties(
    properties: Record<string, string>,
    deleteAllOthers: boolean = false
  ): MockProperties {
    if (deleteAllOthers) {
      this.properties.clear();
    }
    Object.entries(properties).forEach(([key, value]) => {
      this.properties.set(key, value);
    });
    return this;
  }

  deleteAllProperties(): MockProperties {
    this.properties.clear();
    return this;
  }

  getKeys(): string[] {
    return Array.from(this.properties.keys());
  }

  reset(): void {
    this.properties.clear();
  }
}

// PropertiesService モッククラス
export class PropertiesServiceMock {
  private static scriptProperties: MockPropertiesImpl = new MockPropertiesImpl();
  private static userProperties: MockPropertiesImpl = new MockPropertiesImpl();
  private static documentProperties: MockPropertiesImpl = new MockPropertiesImpl();

  static reset(): void {
    this.scriptProperties.reset();
    this.userProperties.reset();
    this.documentProperties.reset();
  }

  static getScriptProperties(): MockProperties {
    return this.scriptProperties;
  }

  static getUserProperties(): MockProperties {
    return this.userProperties;
  }

  static getDocumentProperties(): MockProperties {
    return this.documentProperties;
  }

  static setupScriptProperties(properties: Record<string, string>): void {
    this.scriptProperties.setProperties(properties, true);
  }

  static setupUserProperties(properties: Record<string, string>): void {
    this.userProperties.setProperties(properties, true);
  }
}
