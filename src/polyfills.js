
// Polyfills for node modules in browser environment
import { Buffer } from 'buffer';

window.global = window;
window.Buffer = Buffer;
window.process = { env: {} };
