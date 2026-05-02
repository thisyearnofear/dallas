declare module '@jest/globals' {
  export const describe: any;
  export const it: any;
  export const test: any;
  export const expect: any;
  export const beforeAll: any;
  export const beforeEach: any;
  export const afterAll: any;
  export const afterEach: any;
  export const jest: any;
}

interface EventTarget {
  value?: any;
  checked?: any;
}

interface ImportMetaEnv {
  readonly [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
