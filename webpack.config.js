const webpack = require("webpack");

module.exports = {
  resolve: {
    fallback: {
      fs: false, // ✅ Disable `fs` for browser compatibility
      path: require.resolve("path-browserify"),
      child_process: false, // ✅ Disable `child_process`
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
      assert: require.resolve("assert"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};
