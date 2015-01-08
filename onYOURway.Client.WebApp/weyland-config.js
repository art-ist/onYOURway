exports.config = function (weyland) {
  weyland.build('main')
      .task.jshint({
        include: 'App/**/*.js'
      })
      .task.uglifyjs({
        include: ['App/**/*.js']
      })
      .task.rjs({
        include: ['App/**/*.{js,html}'],
        loaderPluginExtensionMaps: {
          '.html': 'text'
        },
        rjs: {
          name: 'App/onYOURway-built', //to deploy with require.js, use the build's name here instead
          insertRequire: ['main'], //not needed for require
          baseUrl: 'App',
          wrap: true, //not needed for require
          paths: {
            'text': './_libraries/text',
            'durandal': './_libraries/durandal',
            'plugins': './_libraries/durandal/plugins',
            'transitions': './_libraries/durandal/transitions',
            'knockout': './_libraries/knockout-3.0.0',
            'jquery': './_libraries/jquery-2.0.1',
            'bootstrap': './_libraries/bootstrap',
            'services': './services',
            'providers': './services/providers'
          },
          inlineText: true,
          optimize: 'none',
          pragmas: {
            build: true
          },
          stubModules: ['text'],
          keepBuildDir: true,
          out: 'App/onYOURway-built.js'
        }
      });
}