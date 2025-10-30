const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}]: ${message}`);
};

module.exports = {
  info: (message) => log(message, 'info'),
  error: (message) => log(message, 'error'),
  warn: (message) => log(message, 'warn'),
  debug: (message) => log(message, 'debug'),
};
