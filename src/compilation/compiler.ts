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
            private alphaNodes: ISelectNode[] = new [];

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

        export interface INodeSelectorFactory {
            create(): ISelectNode;
        }

        export interface ISelectNode {
            next: ISelectNode;

            select(): void;

            selectNode(node: Treaty.Rules.INode): void;
        }

        export interface IRuntimeVisitor {
            visit(runtime: Treaty.Rules.IRuntimeConfiguration, next: (visitor: IRuntimeVisitor) => bool): bool;
        }

        class NullNodeSelector implements ISelectNode {
            public next: ISelectNode = null;

            public select(): void { }

            public selectNode(node: Treaty.Rules.INode): void { }
        }

        class NodeSelectorFactory implements INodeSelectorFactory {
            constructor (private factory: () => ISelectNode) { }

            public create(): ISelectNode {
                var node = this.factory();
                
                if (node == null) 
                    node = this.createNullSelector();

                return node;
            }

            private createNullSelector(): ISelectNode {
                return new NullNodeSelector();
            }
        }

        class ConditionAlphaNodeSelector implements ISelectNode {
            public next: ISelectNode = null;

            constructor (private nodeCallback: (node: ISelectNode) => void) { }

            public select(): void { }

            public selectNode(node: Treaty.Rules.INode): void { }
        }

        class AlphaNodeSelector implements ISelectNode {
            constructor (public next: ISelectNode) { }

            public select(): void { }

            public selectNode(node: Treaty.Rules.INode): void { }
        }

        class EqualNodeSelector implements ISelectNode {
            constructor (public next: ISelectNode, private value: any) { }

            public select(): void { }

            public selectNode(node: Treaty.Rules.INode): void { }
        }

        export class TypeNodeSelector implements ISelectNode {
            constructor (public next: ISelectNode, public instanceType: string, private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public select(): void {
                var alphaNode = this.runtime.getAlphaNode(this.instanceType);

                this.next.selectNode(alphaNode);
            }

            public selectNode(node: Treaty.Rules.INode): void {
                throw 'not implemented';
            }
        }

        export class PropertyNodeSelector implements ISelectNode, IRuntimeVisitor {
            private propertyNode: Rules.PropertyNode;

            constructor (public next: ISelectNode, public instanceType: string, public memberName: string, private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public select(): void { 
                throw 'not implemented';
            }

            public selectNode(node: Treaty.Rules.INode): void { 
                node.accept(this);
                
                if (this.propertyNode == null) {
                    this.propertyNode = <Rules.PropertyNode>this.runtime.createNode(id => new Rules.PropertyNode(id, this.instanceType, this.memberName));

                    node.addActivation(this.propertyNode);
                }

                this.next.selectNode(this.propertyNode);
            }

            public visit(runtime: Treaty.Rules.IRuntimeConfiguration, next: (visitor: IRuntimeVisitor) => bool): bool {
                return true;
            }
        }
        
        export class ConsequenceCompiler {
        }
    }
}