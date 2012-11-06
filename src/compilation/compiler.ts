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
                this.compile(condition.memberName, (next) => new NodeSelectorFactory(() => new EqualNodeSelector(next.create(), condition.value)));
            }

            private compile(memberName: string, selectorFactory: (factory: INodeSelectorFactory) => INodeSelectorFactory): void {
                var conditionFactory = new NodeSelectorFactory(() => new ConditionAlphaNodeSelector(node => this.alphaNodes.push(node)));
                var alphaFactory = new NodeSelectorFactory(() => new AlphaNodeSelector(conditionFactory.create()));
                var nodeFactory = selectorFactory(alphaFactory);

                new PropertyExpressionVisitor(nodeFactory)
                    .createSelector(memberName)
                    .select();
            }
        }

        export class PropertyExpressionVisitor {
            private nodeSelector: ISelectNode;

            constructor (private nodeFactory: INodeSelectorFactory) { }

            public createSelector(memberName: string): ISelectNode {
                this.nodeSelector = new PropertyNodeSelector(memberName, this.nodeFactory.create());

                this.visitParameter(memberName);

                return this.nodeSelector;
            }

            private visitParameter(memberName: string): void {
                this.nodeSelector = new TypeNodeSelector(this.nodeFactory.create());
            }
        }

        class PropertyNodeSelector implements ISelectNode {
            constructor (private memberName: string, public next: ISelectNode) { }

            public select(): void { }
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

            public select(): ISelectNode {
                return null;
            }
        }

        class EqualNodeSelector implements ISelectNode {
            constructor (public next: ISelectNode, private value: any) { }

            public select(): void { }
        }

        export class TypeNodeSelector implements ISelectNode {
            constructor (public next: ISelectNode) { }

            public select(): void {
            }
        }

        export class ConsequenceCompiler {
        }
    }
}