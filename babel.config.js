module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    '@babel/preset-react'
  ],
  plugins: [
    '@babel/plugin-transform-flow-strip-types',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime'
  ]
};
