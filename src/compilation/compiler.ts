///<reference path='.\selectors.ts' />
///<reference path='..\rules\rule.ts' />
///<reference path='..\rules\rulesEngine.ts' />
///<reference path='..\rules\conditions\condition.ts' />

module Treaty {
    export module Compilation {
        export class RuleCompiler {
            constructor (private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public compile(rule: Treaty.Rules.Rule): void {
                var conditionCompiler = new ConditionCompiler(this.runtime);
                
                rule.conditions.forEach(condition => {
                    condition.accept(conditionCompiler);
                });

                rule.consequences.forEach(consequence => {

                });
            }
        }

        export class ConditionCompiler implements Rules.IVisitor {
            private alphaNodes = new ISelectNode[];

            constructor (private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public visit(condition: Rules.Conditions.PropertyEqualCondition): void {
                this.compile(condition.instanceType, condition.memberExpression, (next) => new NodeSelectorFactory(() => new EqualNodeSelector(next.create(), condition.value)));
            }

            private compile(instanceType: string, memberExpression: TypeScript.AST, selectorFactory: (factory: INodeSelectorFactory) => INodeSelectorFactory): void {
                var conditionFactory = new NodeSelectorFactory(() => new ConditionAlphaNodeSelector(node => this.alphaNodes.push(node)));
                var alphaFactory = new NodeSelectorFactory(() => new AlphaNodeSelector(conditionFactory.create()));
                var nodeFactory = selectorFactory(alphaFactory);

                new PropertyExpressionVisitor(instanceType, nodeFactory, this.runtime)
                    .createSelector(memberExpression)
                    .select();
            }
        }

        export class PropertyExpressionVisitor {
            private nodeSelector: ISelectNode;

            constructor (private instanceType: string, private nodeFactory: INodeSelectorFactory, private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public createSelector(expression: TypeScript.AST): ISelectNode {
                if (expression instanceof TypeScript.Identifier) {
                    this.visitParameter(<TypeScript.Identifier>expression);
                } else if (expression instanceof TypeScript.BinaryExpression) {
                    this.visitBinary(<TypeScript.BinaryExpression>expression);
                } else {
                    console.log('Expression type "' + typeof (expression) + '" not yet supported.');
                }

                return this.nodeSelector;
            }

            private visitParameter(parameter: TypeScript.Identifier): void {
                this.nodeSelector = new TypeNodeSelector(this.nodeFactory.create(), this.instanceType, this.runtime);
            }

            private visitBinary(binaryExpr: TypeScript.BinaryExpression): void {
                var identifier = <TypeScript.Identifier>binaryExpr.operand2;

                var propertyNodeFactory = new NodeSelectorFactory(() => new PropertyNodeSelector(this.nodeFactory.create(), this.instanceType, identifier.text, this.runtime));
                var visitor = new PropertyExpressionVisitor(this.instanceType, propertyNodeFactory, this.runtime);
                
                this.nodeSelector = visitor.createSelector(binaryExpr.operand1);
            }
        }

        export class ConsequenceCompiler {
        }
    }
}