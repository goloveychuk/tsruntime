

import * as ts from "typescript";
import Transformer from '../src/transformer';


function compile(fileNames: string[], options: ts.CompilerOptions): void {
    let program = ts.createProgram(fileNames, options);

    let emitResult = program.emit(undefined, undefined, undefined, undefined, {before: [Transformer(program)]});

    let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        if (diagnostic.file) {
            let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        } else {
            console.log(`${message}`);            
        }
    });

    let exitCode = emitResult.emitSkipped ? 1 : 0;
    console.log(`Process exiting with code '${exitCode}'.`);
    process.exit(exitCode);
}

// const a = ts.convertCompilerOptionsFromJson({}, '../../')
// const a = ts.parseCommandLine(process.argv)

compile(process.argv.slice(2), {
    noEmitOnError: true, noImplicitAny: true,
    target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS,
    emitDecoratorMetadata: true,
    strict: true,
    lib: ["lib.dom.d.ts", "lib.es2015.d.ts"],
    experimentalDecorators: true,
    outDir: "./tests/emit_output"
});