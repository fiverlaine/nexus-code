/// <reference types="vite/client" />

// Declaração de tipos para o Facebook Pixel
interface Window {
  fbq?: (
    command: 'track' | 'trackCustom' | 'init',
    eventName: string,
    parameters?: Record<string, any>
  ) => void;
  _fbq?: any;
} 