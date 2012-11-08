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
                var sourceText = new Treaty.Compilation.ExpressionSource(expression);

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

                var memberExpression = lhs.member;
                var value = rhs.value;

                // TODO: Convert value to member type?

                return new Treaty.Rules.Conditions.PropertyEqualCondition(memberExpression, value);
            }
        }

        class LeftHandSideExpressionVisitor {
            public member: TypeScript.AST;
            
            public visitMember(operand: TypeScript.AST): void {
                this.member = operand;
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

        export class ExpressionSource implements TypeScript.ISourceText {
            private source: string;

            constructor (private expression: Function) {
                this.source = 'var f = ' + expression.toString() + ';';
            }

            getText(start: number, end: number): string {
                return this.source.substring(start, end);
            }

            getLength(): number {
                return this.source.length;
            }
        }

        export class ExpressionAdapter {
            private globalAstWalkerFactory: TypeScript.AstWalkerFactory = new TypeScript.AstWalkerFactory();

            public parse(script: TypeScript.Script): TypeScript.AST {
                var state: TypeScript.AST[] = [];
                var visitor = new ExpressionVisitor();
                var callback = (ast, parent, walker) => visitor.visit(ast, parent, walker);
                var walker = this.globalAstWalkerFactory.getWalker(callback, null, null, state);
                
                walker.walk(script.bod, script);
                
                return state[0];
            }
        }

        class ExpressionVisitor {
            private startedCollecting: bool = false;
            
            public visit(ast: TypeScript.AST, parent: TypeScript.AST, walker: TypeScript.IAstWalker): TypeScript.AST {
                if (this.startedCollecting === true) {
                    walker.state.push(ast);
                } else if (ast.nodeType == TypeScript.NodeType.Return) {
                    this.startedCollecting = true;
                }

                return ast;
            }
        }
    }
}