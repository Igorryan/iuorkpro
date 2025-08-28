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
            '@components': './src/components',
            '@functions': './src/functions',
            '@api': './src/api',
          },
        },
      ],
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};


