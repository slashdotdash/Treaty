///<reference path='..\..\lib\TypeScript\compiler\typescript.ts' />

/// <reference path="..\rules\rule.ts" />
/// <reference path="..\rules\ruleBuilder.ts" />
/// <reference path="..\rules\conditions\condition.ts" />

module Treaty {
    export module Compilation {
        export class ExpressionParser {
            public parseErrorMessage: string = null;
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
            
            public parse(instanceType: string, script: TypeScript.Script): Treaty.Rules.ICondition[] {
                var state: Treaty.Rules.ICondition[] = [];
                var visitor = new ConditionVisitor(instanceType);
            
                var callback = (ast, parent, walker) => visitor.visit(ast, parent, walker);
                var options = new TypeScript.AstWalkOptions();
                var walker = this.globalAstWalkerFactory.getWalker(callback, null, options, state);
                
                walker.walk(script.bod, script);
                
                return state;
            }
        }

        export class ConditionVisitor {
            private startedCollecting: bool = false;
            private parameterName: string;

            constructor (private instanceType: string) { }

            public visit(ast: TypeScript.AST, parent: TypeScript.AST, walker: TypeScript.IAstWalker): TypeScript.AST {
                switch (ast.nodeType) {
                    case TypeScript.NodeType.Return: {
                        this.startedCollecting = true;
                        break;
                    }
                    case TypeScript.NodeType.ArgDecl: {
                        var arg = <TypeScript.ArgDecl>ast;
                        this.parameterName = arg.id.text;
                        break;
                    }
                }

                if (this.startedCollecting && ast instanceof TypeScript.BinaryExpression) {
                    this.visitBinary(<TypeScript.BinaryExpression>ast, walker);
                }

                return ast;
            }

            private visitBinary(binaryExpr: TypeScript.BinaryExpression, walker: TypeScript.IAstWalker): void {
                switch (binaryExpr.nodeType) {
                    case TypeScript.NodeType.Dot: {
                        var condition = this.parseBoolean(binaryExpr);
                        this.appendCondition(walker, condition);
                        break;
                    }
                    case TypeScript.NodeType.Eq:
                    case TypeScript.NodeType.Ne:
                    case TypeScript.NodeType.Gt: 
                    case TypeScript.NodeType.Ge:
                    case TypeScript.NodeType.Lt:
                    case TypeScript.NodeType.Le:
                    {
                        var condition = this.extractPropertyCondition(binaryExpr);
                        this.appendCondition(walker, condition);
                        break;
                    }
                    case TypeScript.NodeType.LogAnd: {
                        // Logical and, joining two conditions, handled by visitor continuing to walk the tree
                        break;
                    }
                    case TypeScript.NodeType.LogOr: {
                        var leftCondition = this.extractPropertyCondition(<TypeScript.BinaryExpression>binaryExpr.operand1);
                        var rightCondition = this.extractPropertyCondition(<TypeScript.BinaryExpression>binaryExpr.operand2);

                        var orCondition = new Treaty.Rules.Conditions.OrCondition(this.instanceType, leftCondition, rightCondition);

                        this.appendCondition(walker, orCondition);
                        break;
                    }
                    default:
                        console.log('NodeType "' + binaryExpr.nodeType + '" is not yet supported');
                }
            }

            private extractPropertyCondition(binaryExpr: TypeScript.BinaryExpression): Treaty.Rules.Conditions.IPropertyCondition {
                return this.parseBinary(binaryExpr, this.propertyConditionFactoryFor(binaryExpr));
            }

            private propertyConditionFactoryFor(binaryExpr: TypeScript.BinaryExpression): (memberExpression: Treaty.Compilation.Expression, value: any) => Treaty.Rules.Conditions.IPropertyCondition {
                switch (binaryExpr.nodeType) {
                    case TypeScript.NodeType.Eq: {
                        return (memberExpression, value) => new Treaty.Rules.Conditions.PropertyEqualCondition(this.instanceType, memberExpression, value);
                    }
                    case TypeScript.NodeType.Ne: {
                        return (memberExpression, value) => new Treaty.Rules.Conditions.PropertyNotEqualCondition(this.instanceType, memberExpression, value);
                    }
                    case TypeScript.NodeType.Gt: {
                        return (memberExpression, value) => new Treaty.Rules.Conditions.PropertyGreaterThanCondition(this.instanceType, memberExpression, value);
                    }
                    case TypeScript.NodeType.Ge: {
                        return (memberExpression, value) => new Treaty.Rules.Conditions.PropertyGreaterThanOrEqualCondition(this.instanceType, memberExpression, value);
                    }
                    case TypeScript.NodeType.Lt: {
                        return (memberExpression, value) => new Treaty.Rules.Conditions.PropertyLessThanCondition(this.instanceType, memberExpression, value);
                    }
                    case TypeScript.NodeType.Le: {
                        return (memberExpression, value) => new Treaty.Rules.Conditions.PropertyLessThanOrEqualCondition(this.instanceType, memberExpression, value);
                    }                    
                    default: {
                        throw 'Not Supported';
                    }
                }
            }

            // Append the condition and prevent walking to children
            private appendCondition(walker: TypeScript.IAstWalker, condition: Treaty.Rules.ICondition): void {
                walker.state.push(condition);
                walker.options.goChildren = false;
            }

            private parseBoolean(binaryExpr: TypeScript.BinaryExpression): Treaty.Rules.Conditions.IPropertyCondition {
                var lhs = new LeftHandSideExpressionVisitor();                        
                
                lhs.visitMember(binaryExpr);
                
                var memberExpression = new Treaty.Compilation.Expression(this.parameterName, lhs.member);
                var value = true;
                
                return new Treaty.Rules.Conditions.PropertyEqualCondition(this.instanceType, memberExpression, value);
            }

            private parseBinary(binaryExpr: TypeScript.BinaryExpression, conditionFactory: (memberExpression: Treaty.Compilation.Expression, value: any) => Treaty.Rules.Conditions.IPropertyCondition): Treaty.Rules.Conditions.IPropertyCondition {
                var lhs = new LeftHandSideExpressionVisitor();                        
                var rhs = new RightHandSideExpressionVisitor()

                lhs.visitMember(binaryExpr.operand1);
                rhs.visitConstant(binaryExpr.operand2);

                var memberExpression = new Treaty.Compilation.Expression(this.parameterName, lhs.member);
                var value = rhs.value;

                // TODO: Convert value to member type?

                return conditionFactory(memberExpression, value);
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
                if (operand instanceof TypeScript.BinaryExpression) {
                    this.visitBinaryExpression(<TypeScript.BinaryExpression>operand);
                } else if (operand instanceof TypeScript.NumberLiteral) {
                    this.visitNumberLiteral(<TypeScript.NumberLiteral>operand);
                } else if (operand instanceof TypeScript.StringLiteral) {
                    this.visitStringLiteral(<TypeScript.StringLiteral>operand);
                }
            }

            private visitBinaryExpression(binaryExpr: TypeScript.BinaryExpression): void {
                switch (binaryExpr.nodeType) {
                    case TypeScript.NodeType.Add: {
                        this.setValueFromBinaryExpression(binaryExpr, (left, right) => left + right);
                        return;
                    }
                    case TypeScript.NodeType.Sub: {
                        this.setValueFromBinaryExpression(binaryExpr, (left, right) => left - right);
                        return;
                    }
                    case TypeScript.NodeType.Div: {
                        this.setValueFromBinaryExpression(binaryExpr, (left, right) => left / right);
                        return;
                    }
                    case TypeScript.NodeType.Mul: {
                        this.setValueFromBinaryExpression(binaryExpr, (left, right) => left * right);
                        return;
                    }
                    case TypeScript.NodeType.Mod: {
                        this.setValueFromBinaryExpression(binaryExpr, (left, right) => left % right);
                        return;
                    }
                    default: {
                        var message = 'NodeType "' + binaryExpr.nodeType + '" is not yet supported for right hand side';
                        console.log(message);
                        throw message;
                    }
                }
            }

            private setValueFromBinaryExpression(binaryExpr: TypeScript.BinaryExpression, calculateValue: (left: any, right: any) => any): void {
                var lhs = new RightHandSideExpressionVisitor();
                var rhs = new RightHandSideExpressionVisitor();

                lhs.visitConstant(binaryExpr.operand1);
                rhs.visitConstant(binaryExpr.operand2);

                this.value = calculateValue(lhs.value, rhs.value);
            }

            private visitNumberLiteral(operand: TypeScript.NumberLiteral): void {
                this.value = operand.value;
            }

            private visitStringLiteral(operand: TypeScript.StringLiteral): void {
                this.value = this.stripQuotes(operand.text);
            }

            private stripQuotes(source: string): string {
                return source.substr(1, source.length - 2);
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

        class ExpressionAdapter {
            private globalAstWalkerFactory: TypeScript.AstWalkerFactory = new TypeScript.AstWalkerFactory();

            public parse(script: TypeScript.Script): Expression {
                var state: any[] = [];
                var visitor = new ExpressionVisitor();
                var callback = (ast, parent, walker) => visitor.visit(ast, parent, walker);
                var walker = this.globalAstWalkerFactory.getWalker(callback, null, null, state);
                
                walker.walk(script.bod, script);
                
                return new Expression(state[0], state[1]);
            }
        }

        class ExpressionVisitor {
            public visit(ast: TypeScript.AST, parent: TypeScript.AST, walker: TypeScript.IAstWalker): TypeScript.AST {
                switch (ast.nodeType) {
                    case TypeScript.NodeType.Return: {
                        var returnStmt = <TypeScript.ReturnStatement>ast;
                        walker.state.push(returnStmt.returnExpression);
                        walker.options.stopWalk();
                        return;
                    }
                    case TypeScript.NodeType.ArgDecl: {
                        var arg = <TypeScript.ArgDecl>ast;
                        walker.state.push(arg.id.text);
                        return;
                    }
                }

                return ast;
            }
        }

        export class Expression {
            private static expressionAdapter = new ExpressionAdapter();

            public static parse(script: TypeScript.Script): Expression {
                return expressionAdapter.parse(script);
            }

            constructor(public parameter: string, public body: TypeScript.AST) { }
        }
    }
}