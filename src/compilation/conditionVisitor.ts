///<reference path='..\..\lib\TypeScript\compiler\typescript.ts' />

/// <reference path="..\rules\rule.ts" />
/// <reference path="..\rules\ruleBuilder.ts" />

module Treaty {
    export module Compilation {
        export class ConditionParser {
            private globalAstWalkerFactory: TypeScript.AstWalkerFactory = new TypeScript.AstWalkerFactory();

            public parse(script: TypeScript.Script): string[] {
                var state: string[] = [];
                var visitor = new ConditionVisitor();
                var callback = (ast, parent, walker) => visitor.visit(ast, parent, walker);
                var walker = this.globalAstWalkerFactory.getWalker(callback, null, null, state);
                
                walker.walk(script.bod, script);
                
                return state;
            }
        }

        export class ConditionVisitor {
            private startedCollecting: bool = false;
            
            public visit(ast: TypeScript.AST, parent: TypeScript.AST, walker: TypeScript.IAstWalker): TypeScript.AST {
                if (this.startedCollecting === true) {

                    if (ast instanceof TypeScript.BinaryExpression) {
                        this.visitBinary(<TypeScript.BinaryExpression>ast, walker);
                    }                    
                } else if (ast.nodeType == TypeScript.NodeType.Return) {
                    this.startedCollecting = true;
                }

                return ast;
            }

            private visitBinary(binaryExpr: TypeScript.BinaryExpression, walker: TypeScript.IAstWalker): void {
                console.log('visitBinary');
                
                switch (binaryExpr.nodeType) {
                    case TypeScript.NodeType.Eq: {

                    }
                    default:
                        console.log('NodeType "' + binaryExpr.nodeType + '" is not yet supported');                    
                }
                
                walker.state.push(binaryExpr);


            }
        }

        export class FuncSourceText implements TypeScript.ISourceText {
            private source: string;

            constructor (private func: Function) {
                this.source = 'var f = ' + func.toString() + ';';
                   
                this.source = "var f: (s: string) => bool;"
                this.source += "f = (s: string) => s.length == 1;"

                console.log('source: ' + this.source);

                //var f: (s: string) => bool;
                //f = (s: string) => s.lengthxxx == 1;
            }

            getText(start: number, end: number): string {
                return this.source.substring(start, end);
            }

            getLength(): number {
                return this.source.length;
            }
        }
    }
}