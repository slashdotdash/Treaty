///<reference path='..\..\lib\TypeScript\compiler\typescript.ts' />

/// <reference path="..\rules\rule.ts" />
/// <reference path="..\rules\ruleBuilder.ts" />
/// <reference path="..\rules\conditions\condition.ts" />

module Treaty {
    export module Compilation {
        export class ExpressionParser {
            private parseErrorMessage: string = null;
            private parser: TypeScript.Parser;
            private filename = 'tmp.ts';

            constructor () {
                this.parser = new TypeScript.Parser();

                this.parser.errorCallback = (minChar: number, charLen: number, message: string, unit: number) => {
                    console.log('Parsing failed: ' + message);
                    this.parseErrorMessage = message;
                };
            }

            public parse(expression: Function): TypeScript.Script {
                var sourceText = new Treaty.Compilation.FuncSourceText(expression);
                
                return this.parser.parse(sourceText, this.filename, 0, TypeScript.AllowedElements.Global);
            }            
        }

        export class ConditionParser {
            private globalAstWalkerFactory: TypeScript.AstWalkerFactory = new TypeScript.AstWalkerFactory();

            public parse(script: TypeScript.Script): Treaty.Rules.ICondition[] {
                var state: Treaty.Rules.ICondition[] = [];
                var visitor = new ConditionVisitor();
                var callback = (ast, parent, walker) => visitor.visit(ast, parent, walker);
                var walker = this.globalAstWalkerFactory.getWalker(callback, null, null, state);
                
                walker.walk(script.bod, script);
                
                console.log('state: '+state);

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
                switch (binaryExpr.nodeType) {
                    case TypeScript.NodeType.Eq: {
                        var condition = this.parseEq(binaryExpr);

                        walker.state.push(condition);
                    }
                    default:
                        console.log('NodeType "' + binaryExpr.nodeType + '" is not yet supported');
                }
            }

            private parseEq(binaryExpr: TypeScript.BinaryExpression): Treaty.Rules.ICondition {
                var lhs = new LeftHandSideExpressionVisitor();                        
                var rhs = new RightHandSideExpressionVisitor()
                        
                lhs.visitMember(binaryExpr.operand1);
                rhs.visitConstant(binaryExpr.operand2);

                var member = lhs.member;
                var value = rhs.value;

                // TODO: Convert value to member type?

                return new Treaty.Rules.Conditions.PropertyEqualCondition(member, value);
            }
        }

        class LeftHandSideExpressionVisitor {
            public member: string;
            public symbol: TypeScript.Symbol;

            public visitMember(operand: TypeScript.AST): void {
                if (operand instanceof TypeScript.BinaryExpression) {
                    var binaryExpr = <TypeScript.BinaryExpression>operand;
                    var memberExpr = <TypeScript.Identifier>binaryExpr.operand2;
                    
                    this.member = memberExpr.text;
                    this.symbol = memberExpr.sym;
                }
            }
        }

        class RightHandSideExpressionVisitor {
            public value: any;

            public visitConstant(operand: TypeScript.AST): void {
                if (operand instanceof TypeScript.NumberLiteral) {
                    this.visitNumberLiteral(<TypeScript.NumberLiteral>operand);
                }
            }

            private visitNumberLiteral(operand: TypeScript.NumberLiteral): void {
                this.value = operand.value;
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