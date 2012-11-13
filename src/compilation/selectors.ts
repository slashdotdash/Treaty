///<reference path='.\compiler.ts' />
///<reference path='..\rules\rule.ts' />
///<reference path='..\rules\rulesEngine.ts' />
///<reference path='..\rules\conditions\condition.ts' />

module Treaty {
    export module Compilation {
        export interface INodeSelectorFactory {
            create(): ISelectNode;
        }

        export interface ISelectNode {
            next: ISelectNode;

            select(): void;

            selectNode(node: Treaty.Rules.INode): void;
        }

        export interface ISelectRuleNode {
            select(callback: (node: Treaty.Rules.INode) => void);
        }

        export interface IRuntimeVisitor {
            visit(runtime: Treaty.Rules.IRuntimeConfiguration, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitPropertyNode(node: Treaty.Rules.PropertyNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitDelegateNode(node: Treaty.Rules.DelegateProductionNode, next: (visitor: IRuntimeVisitor) => bool): bool;
        }

        export class NodeSelectorFactory implements INodeSelectorFactory {
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

        export class RuleNodeSelector implements ISelectRuleNode {
            constructor (private node: Treaty.Rules.INode) { }

            public select(callback: (node: Treaty.Rules.INode) => void) { }
        }

        export class NullNodeSelector implements ISelectNode {
            public next: ISelectNode = null;

            public select(): void { }

            public selectNode(node: Treaty.Rules.INode): void { }

            public selectCallback(callback: (node: Treaty.Rules.INode) => void) { }
        }        

        export class ConditionAlphaNodeSelector implements ISelectNode {
            public next: ISelectNode = null;
            
            constructor (private nodeCallback: (node: ISelectRuleNode) => void) { }

            public select(): void { }

            public selectNode(node: Treaty.Rules.INode): void {
                var alphaNode = <Treaty.Rules.AlphaNode>node;

                this.nodeCallback(new RuleNodeSelector(alphaNode));
            }
        }
                
        export class AlphaNodeSelector implements ISelectNode {
            constructor (public next: ISelectNode) { }

            public select(): void { }

            public selectNode(node: Treaty.Rules.INode): void { }
        }

        export class EqualNodeSelector implements ISelectNode {
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

        export class RuntimeVisitor implements IRuntimeVisitor {
            public visit(runtime: Treaty.Rules.IRuntimeConfiguration, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitPropertyNode(node: Treaty.Rules.PropertyNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitDelegateNode(node: Treaty.Rules.DelegateProductionNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }
        }

        export class PropertyNodeSelector extends RuntimeVisitor implements ISelectNode, IRuntimeVisitor {
            private propertyNode: Rules.PropertyNode;

            constructor (public next: ISelectNode, public instanceType: string, public memberName: string, private runtime: Treaty.Rules.IRuntimeConfiguration) {
                super();
            }

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

            public visitPropertyNode(node: Treaty.Rules.PropertyNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                if (this.memberName == node.memberName) {
                    this.propertyNode = node;
                    return false;
                }

                return super.visitPropertyNode(node, next);
            }
        }
    }
}