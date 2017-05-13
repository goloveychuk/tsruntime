
const TsRuntimeTransformerBuilder = require('./dist/transformer').default;



function CustomTransformersBuilder(program) {
  const tsruntimeTrans = TsRuntimeTransformerBuilder(program)
  return () => ({
    before: [
      tsruntimeTrans
    ]
  })
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
                     getCustomTransformers: CustomTransformersBuilder,
                  }
               },
            ],
         },
      ],
   }
};

};
