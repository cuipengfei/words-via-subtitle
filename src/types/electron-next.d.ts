declare module 'electron-next' {
  function prepareNext(dir: string): Promise<void>;
  export = prepareNext;
}
