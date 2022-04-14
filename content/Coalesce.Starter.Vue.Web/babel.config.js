module.exports = {
  // This babel config is used for the jest tests to be able consume ESM files
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
};
