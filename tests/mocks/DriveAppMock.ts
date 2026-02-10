/**
 * DriveApp モック
 * Google Apps ScriptのDriveAppをテスト用にシミュレート
 */

export interface MockFile {
  getId(): string;
  getName(): string;
  getMimeType(): string;
  getBlob(): MockBlob;
  setTrashed(trashed: boolean): MockFile;
  getUrl(): string;
  getParents(): MockFolderIterator;
}

export interface MockFolder {
  getId(): string;
  getName(): string;
  createFile(name: string, content: string, mimeType?: string): MockFile;
  createFile(blob: MockBlob): MockFile;
  getFiles(): MockFileIterator;
  getFolders(): MockFolderIterator;
  getFilesByName(name: string): MockFileIterator;
  getFoldersByName(name: string): MockFolderIterator;
  createFolder(name: string): MockFolder;
  setTrashed(trashed: boolean): MockFolder;
}

export interface MockBlob {
  getDataAsString(): string;
  getContentType(): string;
  getName(): string;
  setName(name: string): MockBlob;
  getBytes(): number[];
}

export interface MockFileIterator {
  hasNext(): boolean;
  next(): MockFile;
}

export interface MockFolderIterator {
  hasNext(): boolean;
  next(): MockFolder;
}

class MockBlobImpl implements MockBlob {
  private content: string;
  private contentType: string;
  private name: string;

  constructor(content: string, contentType: string, name: string) {
    this.content = content;
    this.contentType = contentType;
    this.name = name;
  }

  getDataAsString(): string {
    return this.content;
  }

  getContentType(): string {
    return this.contentType;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): MockBlob {
    this.name = name;
    return this;
  }

  getBytes(): number[] {
    return Array.from(this.content).map((c) => c.charCodeAt(0));
  }
}

class MockFileImpl implements MockFile {
  private id: string;
  private name: string;
  private mimeType: string;
  private content: string;
  private trashed: boolean = false;
  private parentFolder: MockFolderImpl | null = null;

  constructor(
    id: string,
    name: string,
    content: string,
    mimeType: string,
    parent?: MockFolderImpl
  ) {
    this.id = id;
    this.name = name;
    this.content = content;
    this.mimeType = mimeType;
    this.parentFolder = parent || null;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getMimeType(): string {
    return this.mimeType;
  }

  getBlob(): MockBlob {
    return new MockBlobImpl(this.content, this.mimeType, this.name);
  }

  setTrashed(trashed: boolean): MockFile {
    this.trashed = trashed;
    return this;
  }

  isTrashed(): boolean {
    return this.trashed;
  }

  getUrl(): string {
    return `https://drive.google.com/file/d/${this.id}/view`;
  }

  getParents(): MockFolderIterator {
    const parents = this.parentFolder ? [this.parentFolder] : [];
    let index = 0;
    return {
      hasNext: () => index < parents.length,
      next: () => parents[index++],
    };
  }
}

class MockFolderImpl implements MockFolder {
  private id: string;
  private name: string;
  private files: Map<string, MockFileImpl> = new Map();
  private folders: Map<string, MockFolderImpl> = new Map();
  private trashed: boolean = false;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  createFile(nameOrBlob: string | MockBlob, content?: string, mimeType?: string): MockFile {
    let fileName: string;
    let fileContent: string;
    let fileMimeType: string;

    if (typeof nameOrBlob === 'string') {
      fileName = nameOrBlob;
      fileContent = content || '';
      fileMimeType = mimeType || 'text/plain';
    } else {
      fileName = nameOrBlob.getName();
      fileContent = nameOrBlob.getDataAsString();
      fileMimeType = nameOrBlob.getContentType();
    }

    const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const file = new MockFileImpl(id, fileName, fileContent, fileMimeType, this);
    this.files.set(id, file);
    return file;
  }

  getFiles(): MockFileIterator {
    const filesArray = Array.from(this.files.values()).filter((f) => !f.isTrashed());
    let index = 0;
    return {
      hasNext: () => index < filesArray.length,
      next: () => filesArray[index++],
    };
  }

  getFolders(): MockFolderIterator {
    const foldersArray = Array.from(this.folders.values());
    let index = 0;
    return {
      hasNext: () => index < foldersArray.length,
      next: () => foldersArray[index++],
    };
  }

  getFilesByName(name: string): MockFileIterator {
    const filesArray = Array.from(this.files.values()).filter(
      (f) => f.getName() === name && !f.isTrashed()
    );
    let index = 0;
    return {
      hasNext: () => index < filesArray.length,
      next: () => filesArray[index++],
    };
  }

  getFoldersByName(name: string): MockFolderIterator {
    const foldersArray = Array.from(this.folders.values()).filter(
      (f) => f.getName() === name
    );
    let index = 0;
    return {
      hasNext: () => index < foldersArray.length,
      next: () => foldersArray[index++],
    };
  }

  createFolder(name: string): MockFolder {
    const id = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const folder = new MockFolderImpl(id, name);
    this.folders.set(id, folder);
    return folder;
  }

  setTrashed(trashed: boolean): MockFolder {
    this.trashed = trashed;
    return this;
  }
}

// DriveApp モッククラス
export class DriveAppMock {
  private static rootFolder: MockFolderImpl | null = null;
  private static folders: Map<string, MockFolderImpl> = new Map();
  private static files: Map<string, MockFileImpl> = new Map();

  static reset(): void {
    this.rootFolder = new MockFolderImpl('root', 'My Drive');
    this.folders.clear();
    this.files.clear();
    this.folders.set('root', this.rootFolder);
  }

  static getRootFolder(): MockFolder {
    if (!this.rootFolder) {
      this.reset();
    }
    return this.rootFolder!;
  }

  static getFolderById(id: string): MockFolder {
    const folder = this.folders.get(id);
    if (!folder) {
      throw new Error(`Folder with id "${id}" not found`);
    }
    return folder;
  }

  static getFileById(id: string): MockFile {
    const file = this.files.get(id);
    if (!file) {
      throw new Error(`File with id "${id}" not found`);
    }
    return file;
  }

  static createFile(name: string, content: string, mimeType?: string): MockFile {
    if (!this.rootFolder) {
      this.reset();
    }
    return this.rootFolder!.createFile(name, content, mimeType);
  }

  static createFolder(name: string): MockFolder {
    if (!this.rootFolder) {
      this.reset();
    }
    const folder = this.rootFolder!.createFolder(name) as MockFolderImpl;
    this.folders.set(folder.getId(), folder);
    return folder;
  }

  static setupFolder(id: string, name: string): MockFolderImpl {
    const folder = new MockFolderImpl(id, name);
    this.folders.set(id, folder);
    return folder;
  }
}

// 初期化
DriveAppMock.reset();
