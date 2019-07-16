module.exports = {
  comments: false,
  presets: [['@babel/preset-env'], ['@babel/preset-react']],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    'transform-remove-console',
    'transform-flow-strip-types',
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
      },
    ],
  ],
  env: {
    node: {
      sourceMaps: 'both',
    },
  },
  ignore: ['node_modules'],
};
