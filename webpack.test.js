
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

   // note: not used by karma, but can be used
   //   to help debug transform code by running webpack directly
   entry: './tests/spec-bundle.js',
   output: {
     filename: './tests/build/test.bundle.js'
   },

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
