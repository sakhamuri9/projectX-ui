
let Clipboard;

try {
  Clipboard = require('@react-native-clipboard/clipboard').default;
} catch (error) {
  console.warn('Native clipboard module not available, using fallback');
  Clipboard = require('./ClipboardFallback').default;
}

export default Clipboard;
