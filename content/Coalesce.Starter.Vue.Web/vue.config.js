module.exports = {
  lintOnSave: false,
  outputDir: 'wwwroot',
  publicPath: "/",

  // https://vuetifyjs.com/en/getting-started/quick-start#ie11-safari-9-support
  // No clue which one of these is correct.
  // Note that running in dev mode with HMR will not work in IE.
  // The dependency transpilation seems to not do anything with HMR.
  transpileDependencies:[
    'vuetify', 
    /node_modules[/\\]vuetify[/\\]/, 
    /node_modules[/\\\\]vuetify[/\\\\]/
  ],
}