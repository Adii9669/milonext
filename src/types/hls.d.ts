declare module 'hls.js' {
  export default class Hls {
    static isSupported(): boolean;
    static Events: {
      MANIFEST_PARSED: string;
      ERROR: string;
    };
    constructor(config?: any);
    loadSource(url: string): void;
    attachMedia(media: HTMLMediaElement): void;
    destroy(): void;
    on(event: string, callback: (...args: any[]) => void): void;
  }
}
