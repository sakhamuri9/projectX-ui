
const ClipboardFallback = {
  getString: async () => {
    console.warn('ClipboardFallback: getString called but not implemented');
    return '';
  },
  
  setString: (content) => {
    console.warn('ClipboardFallback: setString called but not implemented', content);
    return;
  }
};

export default ClipboardFallback;
