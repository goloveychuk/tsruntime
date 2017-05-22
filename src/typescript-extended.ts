
import * as ts from 'typescript'


export enum TypeReferenceSerializationKind {
    Unknown,                            // The TypeReferenceNode could not be resolved. The type name
    // should be emitted using a safe fallback.
    TypeWithConstructSignatureAndValue, // The TypeReferenceNode resolves to a type with a constructor
    // function that can be reached at runtime (e.g. a `class`
    // declaration or a `var` declaration for the static side
    // of a type, such as the global `Promise` type in lib.d.ts).
    VoidNullableOrNeverType,            // The TypeReferenceNode resolves to a Void-like, Nullable, or Never type.
    NumberLikeType,                     // The TypeReferenceNode resolves to a Number-like type.
    StringLikeType,                     // The TypeReferenceNode resolves to a String-like type.
    BooleanType,                        // The TypeReferenceNode resolves to a Boolean-like type.
    ArrayLikeType,                      // The TypeReferenceNode resolves to an Array-like type.
    ESSymbolType,                       // The TypeReferenceNode resolves to the ESSymbol type.
    Promise,                            // The TypeReferenceNode resolved to the global Promise constructor symbol.
    TypeWithCallSignature,              // The TypeReferenceNode resolves to a Function type or a type
    // with call signatures.
    ObjectType,                         // The TypeReferenceNode resolves to any other type.
}

export interface EmitResolver {
    isReferencedAliasDeclaration(node: ts.Node, checkChildren?: boolean): boolean;
    hasGlobalName(name: string): boolean;
    getReferencedExportContainer(node: ts.Identifier, prefixLocals?: boolean): ts.SourceFile | ts.ModuleDeclaration | ts.EnumDeclaration;
    getReferencedImportDeclaration(node: ts.Identifier): ts.Declaration;
    getReferencedDeclarationWithCollidingName(node: ts.Identifier): ts.Declaration;

    getReferencedValueDeclaration(reference: ts.Identifier): ts.Declaration;
    getTypeReferenceSerializationKind(typeName: ts.EntityName, location?: ts.Node): TypeReferenceSerializationKind;
    isOptionalParameter(node: ts.ParameterDeclaration): boolean;
    getExternalModuleFileFromDeclaration(declaration: ts.ImportEqualsDeclaration | ts.ImportDeclaration | ts.ExportDeclaration | ts.ModuleDeclaration): SourceFile;
    getTypeReferenceDirectivesForEntityName(name: ts.EntityNameOrEntityNameExpression): string[];
    isLiteralConstDeclaration(node: ts.VariableDeclaration | ts.PropertyDeclaration | ts.PropertySignature | ts.ParameterDeclaration): boolean;
}


export interface Node {
    symbol?: ts.Symbol
    original?: ts.Node
}
export interface Identifier extends ts.Identifier, Node {

}
export interface ClassDeclaration extends ts.ClassDeclaration, Node { }
export interface SourceFile extends ts.SourceFile, Node { }
export interface PropertyDeclaration extends ts.PropertyDeclaration, Node { }
export interface TransformationContext extends ts.TransformationContext {
    getEmitResolver(): EmitResolver
}

// export interface NewCallExpression {
//     expression: ts.LeftHandSideExpression;
//     typeArguments?: ts.NodeArray<ts.TypeNode>;
// }