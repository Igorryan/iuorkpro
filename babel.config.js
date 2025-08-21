module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@routes': './src/routes',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@theme': './src/theme',
            '@config': './src/config',
          },
        },
      ],
    ],
  };
};


