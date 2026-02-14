/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

// Service Worker types
declare global {
  interface Window {
    __WB_MANIFEST: Array<{
      revision: string | null
      url: string
    }>
  }
}

export {}
