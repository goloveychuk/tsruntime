const tsRuntimeBuilder = require('./dist/transformer').default;

function getCustomTransformers() {
  return {
    before: [
      tsRuntimeBuilder({
        decoratorNames: ['Reflective', 'UserDecorator']
      })
    ]
  }
}


module.exports = function (options) {
return {
   devtool: '#inline-source-map',

   resolve: {
      extensions: ['.ts', '.js'],
   },

   module: {

      rules: [
         // Typescript
         {
            test: /\.ts$/,
            use: [
               {
                  loader: 'awesome-typescript-loader',
                  options: {
                     getCustomTransformers: getCustomTransformers,
                  }
               },
            ],
         },
      ],
   }
};

};
