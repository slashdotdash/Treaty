///<reference path='..\rules\rule.ts' />
///<reference path='..\rules\conditions\condition.ts' />

module Treaty {
    export module Compilation {
        export class RuleCompiler {
            public compile(rule: Treaty.Rules.Rule): void {
                var conditionCompiler = new ConditionCompiler();

                rule.conditions.forEach(condition => {
                    condition.accept(conditionCompiler);
                });

                rule.consequences.forEach(consequence => {

                });
            }
        }

        export class ConditionCompiler implements Rules.IVisitor {
            private alphaNodes: ISelectNode[] = new [];

            public visit(condition: Rules.Conditions.PropertyEqualCondition): void {
                this.compile(condition.instanceType, condition.memberExpression, (next) => new NodeSelectorFactory(() => new EqualNodeSelector(next.create(), condition.value)));
            }

            private compile(instanceType: string, memberExpression: TypeScript.AST, selectorFactory: (factory: INodeSelectorFactory) => INodeSelectorFactory): void {
                var conditionFactory = new NodeSelectorFactory(() => new ConditionAlphaNodeSelector(node => this.alphaNodes.push(node)));
                var alphaFactory = new NodeSelectorFactory(() => new AlphaNodeSelector(conditionFactory.create()));
                var nodeFactory = selectorFactory(alphaFactory);

                new PropertyExpressionVisitor(instanceType, nodeFactory)
                    .createSelector(memberExpression)
                    .select();
            }
        }

        export class PropertyExpressionVisitor {
            private nodeSelector: ISelectNode;

            constructor (private instanceType: string, private nodeFactory: INodeSelectorFactory) { }

            public createSelector(expression: TypeScript.AST): ISelectNode {
                console.log('expression:');
                console.log(expression);

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
                this.nodeSelector = new TypeNodeSelector(this.nodeFactory.create(), this.instanceType);
            }

            private visitBinary(binaryExpr: TypeScript.BinaryExpression): void {
                var identifier = <TypeScript.Identifier>binaryExpr.operand2;

                var propertyNodeFactory = new NodeSelectorFactory(() => new PropertyNodeSelector(this.nodeFactory.create(), identifier.text));
                var visitor = new PropertyExpressionVisitor(this.instanceType, propertyNodeFactory);
                
                this.nodeSelector = visitor.createSelector(binaryExpr.operand1);
            }
        }

        export interface INodeSelectorFactory {
            create(): ISelectNode;
        }

        export interface ISelectNode {
            next: ISelectNode;

            select(): void;
        }

        class NodeSelectorFactory implements INodeSelectorFactory {
            constructor (private factory: () => ISelectNode) { }

            create(): ISelectNode {
                return this.factory();
            }
        }

        class ConditionAlphaNodeSelector implements ISelectNode {
            public next: ISelectNode = null;

            constructor (private nodeCallback: (node: ISelectNode) => void) { }

            public select(): void { }
        }

        class AlphaNodeSelector implements ISelectNode {
            constructor (public next: ISelectNode) { }

            public select(): void { }
        }

        class EqualNodeSelector implements ISelectNode {
            constructor (public next: ISelectNode, private value: any) { }

            public select(): void { }
        }

        export class TypeNodeSelector implements ISelectNode {
            constructor (public next: ISelectNode, public instanceType: string) { }

            public select(): void { }
        }

        export class PropertyNodeSelector implements ISelectNode {
            constructor (public next: ISelectNode, public memberName: string) { }

            public select(): void { }
        }
        
        export class ConsequenceCompiler {
        }
    }
}