module.exports = function (api) {
  api.cache(true);

  // Plugin configuration - removes console in production only
  const plugins = [];
  
  if (process.env.NODE_ENV === 'production') {
    plugins.push([
      'transform-remove-console',
      { 
        exclude: ['error', 'warn'] // Keeps console.error and console.warn
      }
    ]);
  }

  return {
    presets: [
      'react-app' // This uses CRA's default presets
    ],
    plugins: plugins
  };
};