/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";
var resolve = require("path").resolve;

module.exports = {
  mode: "production",
  entry: ["regenerator-runtime/runtime", resolve(__dirname, "src/index.js")],
  devtool: "source-map",
  output: {
    path: resolve(__dirname, "lib"),
    filename: "web.js",
    library: "jsC8",
    libraryTarget: "umd"
  },
  module: {
    rules: [
      // NOTE: these rules apply in reverse order
      {
        test: /\.(ts|js)$/,
        loader: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".web.js", ".web.ts", ".js", ".ts", ".json"],
    symlinks: false,
    fallback: {
      "path": require.resolve("path-browserify"),
      "url": require.resolve("url"),
      "querystring": require.resolve("querystring-es3")
    },
  }
};
