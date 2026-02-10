/**
 * Jest テストセットアップ
 * GASグローバルオブジェクトのモック設定
 */

import { SpreadsheetAppMock } from './mocks/SpreadsheetAppMock';
import { DriveAppMock } from './mocks/DriveAppMock';
import { PropertiesServiceMock } from './mocks/PropertiesServiceMock';
import { UtilitiesMock } from './mocks/UtilitiesMock';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).SpreadsheetApp = SpreadsheetAppMock;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).DriveApp = DriveAppMock;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).PropertiesService = PropertiesServiceMock;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Utilities = UtilitiesMock;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Logger = {
  log: jest.fn(),
  clear: jest.fn(),
  getLog: jest.fn().mockReturnValue(''),
};

// 各テスト前にモックをリセット
beforeEach(() => {
  jest.clearAllMocks();
  SpreadsheetAppMock.reset();
  DriveAppMock.reset();
  PropertiesServiceMock.reset();
});
