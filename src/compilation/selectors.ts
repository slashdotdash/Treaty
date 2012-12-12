///<reference path='.\compiler.ts' />
///<reference path='.\runtimeVisitor.ts' />
///<reference path='..\rules\rule.ts' />
///<reference path='..\rules\rulesEngine.ts' />
///<reference path='..\rules\comparison.ts' />
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
            select(instanceType: string, callback: (node: Treaty.Rules.INode) => void): bool;
        }

        export interface ISelectLeftJoinRuleNode {
            match(callback: (node: Treaty.Rules.LeftJoinNode) => void): void;
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

        export class RuleNodeSelector implements ISelectRuleNode, ISelectLeftJoinRuleNode {
            private parent: ISelectRuleNode;

            constructor (private instanceType: string, private node: Treaty.Rules.INode, private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public select(instanceType: string, callback: (node: Treaty.Rules.INode) => void): bool {
                if (this.node instanceof Treaty.Rules.AlphaNode) {
                    var alphaNode = <Treaty.Rules.AlphaNode>this.node;
                    
                    if (alphaNode.instanceType == instanceType || alphaNode.instanceType == 'Array') {
                        callback(this.node);
                        return true;
                    }
                }

                if (this.parent == undefined) {
                    this.parent = new DiscardRuleNodeSelector(this.instanceType, this, this.runtime);
                }

                return this.parent.select(instanceType, callback);
            }

            public match(callback: (node: Treaty.Rules.LeftJoinNode) => void ): void {
                this.runtime.matchLeftJoinNode(this.node, callback);
            }
        }

        export class TupleNodeSelector implements ISelectRuleNode {
            private parent: ISelectRuleNode;
            private node: Treaty.Rules.OuterJoinNode;

            constructor (private leftInstanceType: string, private rightInstanceType: string, private next: Treaty.Compilation.ConditionCompiler, private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public select(instanceType: string, callback: (node: Treaty.Rules.INode) => void ): bool {
                if (this.node == undefined) {
                    this.next.matchJoinNode(this.leftInstanceType, left => {
                        this.next.matchJoinNode(this.rightInstanceType, right => {
                            this.runtime.matchOuterJoinNode(left, right, outerJoin => {
                                this.node = outerJoin;
                            });
                        });
                    });
                }

                if (this.node != undefined) {
                    callback(this.node);
                    return true;
                }

                return false;
            }
        }

        export class DiscardRuleNodeSelector implements ISelectRuleNode, ISelectLeftJoinRuleNode {
            private parent: ISelectRuleNode;
            private leftJoinNode: Treaty.Rules.LeftJoinNode;

            constructor (private instanceType: string, private left: ISelectLeftJoinRuleNode, private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public select(instanceType: string, callback: (node: Treaty.Rules.INode) => void ): bool {
                if (this.instanceType == instanceType && this.leftJoinNode == undefined) {
                    this.left.match(node => this.leftJoinNode = node);
                }

                if (this.leftJoinNode != null && this.instanceType == instanceType) {
                    callback(this.leftJoinNode);
                    return true;
                }

                if (this.parent == undefined) {
                    if (this.instanceType != instanceType) {
                        return false;
                    }

                    this.parent = new DiscardRuleNodeSelector(this.instanceType, this, this.runtime);
                }

                return this.parent.select(instanceType, callback);
            }

            public match(callback: (node: Treaty.Rules.LeftJoinNode) => void ): void {
                if (this.leftJoinNode == undefined) {
                    this.left.match(node => this.leftJoinNode = node);
                }

                this.runtime.matchLeftJoinNode(this.leftJoinNode, callback);
            }
        }

        export class NullNodeSelector implements ISelectNode {
            public next: ISelectNode = null;

            public select(): void { }

            public selectNode(node: Treaty.Rules.INode): void { }

            public selectCallback(callback: (node: Treaty.Rules.INode) => void) { }
        }        

        export class ConditionAlphaNodeSelector implements ISelectNode {
            public next: ISelectNode = null;
            
            constructor (private instanceType: string, private nodeCallback: (node: ISelectRuleNode) => void, private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public select(): void {
                throw 'not implemented';
            }

            public selectNode(node: Treaty.Rules.INode): void {
                var alphaNode = <Treaty.Rules.AlphaNode>node;

                this.nodeCallback(new RuleNodeSelector(this.instanceType, alphaNode, this.runtime));
            }
        }

        export class AlphaNodeSelector extends Treaty.Compilation.RuntimeVisitor implements ISelectNode, IRuntimeVisitor {
            private alphaNode: Treaty.Rules.AlphaNode;

            constructor (public next: ISelectNode, private instanceType: string, private runtime: Treaty.Rules.IRuntimeConfiguration) {
                super();
            }

            public select(): void {
                this.alphaNode = this.runtime.getAlphaNode(this.instanceType);
                this.next.selectNode(this.alphaNode);
            }

            public selectNode(node: Treaty.Rules.INode): void {
                this.alphaNode = null;
                node.accept(this);
                
                if (this.alphaNode == null) {
                    this.alphaNode = <Rules.AlphaNode>this.runtime.createNode(id => new Rules.AlphaNode(id, node.instanceType));

                    node.addActivation(this.alphaNode);
                }

                this.next.selectNode(this.alphaNode);
            }
        }

        export class EqualNodeSelector extends Treaty.Compilation.RuntimeVisitor implements ISelectNode, IRuntimeVisitor {
            private equalNode: Rules.EqualNode;

            constructor (public next: ISelectNode, private value: any, private runtime: Treaty.Rules.IRuntimeConfiguration) {
                super();
            }

            public select(): void {
                throw 'not implemented';            
            }

            public selectNode(node: Treaty.Rules.INode): void {
                this.equalNode = null;
                                
                node.accept(this);

                if (this.equalNode == null) {
                    this.equalNode = <Rules.EqualNode>this.runtime.createNode(id => new Rules.EqualNode(id, TypeDescriptor.toType(this.value)));

                    node.addActivation(this.equalNode);
                }

                var valueNode = this.equalNode.findOrCreate(this.value, () => this.runtime.createNode(id => new Rules.ValueNode(id, TypeDescriptor.toType(this.value), this.value)));

                this.next.selectNode(valueNode);
            }

            public visitEqualNode(node: Treaty.Rules.EqualNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                this.equalNode = node;
                return false;
            }
        }

        export class NotEqualNodeSelector extends Treaty.Compilation.RuntimeVisitor implements ISelectNode, IRuntimeVisitor {
            private notEqualNode: Rules.NotEqualNode;

            constructor (public next: ISelectNode, private value: any, private runtime: Treaty.Rules.IRuntimeConfiguration) {
                super();
            }

            public select(): void {
                throw 'not implemented';            
            }

            public selectNode(node: Treaty.Rules.INode): void {
                this.notEqualNode = null;
                                
                node.accept(this);

                if (this.notEqualNode == null) {
                    this.notEqualNode = <Rules.NotEqualNode>this.runtime.createNode(id => new Treaty.Rules.NotEqualNode(id, TypeDescriptor.toType(this.value)));

                    node.addActivation(this.notEqualNode);
                }

                var valueNode = this.notEqualNode.findOrCreate(this.value, () => this.runtime.createNode(id => new Rules.ValueNode(id, TypeDescriptor.toType(this.value), this.value)));

                this.next.selectNode(valueNode);
            }

            public visitNotEqualNode(node: Treaty.Rules.NotEqualNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                this.notEqualNode = node;
                return false;
            }
        }

        export class ExistsNodeSelector extends Treaty.Compilation.RuntimeVisitor implements ISelectNode, IRuntimeVisitor {
            private existsNode: Rules.ExistsNode;

            constructor (public next: ISelectNode, private runtime: Treaty.Rules.IRuntimeConfiguration) {
                super();
            }

            public select(): void {
                throw 'not implemented';            
            }

            public selectNode(node: Treaty.Rules.INode): void {
                this.existsNode = null;
                                
                node.accept(this);

                if (this.existsNode == null) {
                    this.existsNode = <Rules.ExistsNode>this.runtime.createNode(id => new Rules.ExistsNode(id, 'Exists'));

                    node.addActivation(this.existsNode);
                }

                this.next.selectNode(this.existsNode);
            }

            public visitExistsNode(node: Treaty.Rules.ExistsNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                this.existsNode = node;
                return false;
            }
        }

        export class CompareNodeSelector extends Treaty.Compilation.RuntimeVisitor implements ISelectNode, IRuntimeVisitor {
            private compareNode: Treaty.Rules.CompareNode;

            constructor (public next: ISelectNode, private comparator: Treaty.Rules.IComparator, private value: number, private runtime: Treaty.Rules.IRuntimeConfiguration) {
                super();
            }

            public select(): void {
                throw 'not implemented';            
            }

            public selectNode(node: Treaty.Rules.INode): void {
                this.compareNode = null;
                                
                node.accept(this);

                if (this.compareNode == null) {
                    this.compareNode = <Treaty.Rules.CompareNode>this.runtime.createNode(id => new Treaty.Rules.CompareNode(id, TypeDescriptor.toType(this.value), this.comparator, this.value));

                    node.addActivation(this.compareNode);
                }

                this.next.selectNode(this.compareNode);
            }

            public visitCompareNode(node: Treaty.Rules.CompareNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                this.compareNode = node;
                return false;
            }
        }

        export class EachNodeSelector extends Treaty.Compilation.RuntimeVisitor implements ISelectNode, IRuntimeVisitor {
            private eachNode: Rules.EachNode;

            constructor (public next: ISelectNode, private runtime: Treaty.Rules.IRuntimeConfiguration) {
                super();
            }

            public select(): void {
                throw 'not implemented';            
            }

            public selectNode(node: Treaty.Rules.INode): void {
                this.eachNode = null;

                node.accept(this);

                if (this.eachNode == null) {
                    this.eachNode = <Rules.EachNode>this.runtime.createNode(id => new Rules.EachNode(id, 'Array', this.forEach));

                    node.addActivation(this.eachNode);
                }
                
                this.next.selectNode(this.eachNode);
            }

            public visitEachNode(node: Treaty.Rules.EachNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                this.eachNode = node;
                return false;
            }

            private forEach(list: any[], callback: (item: any) => void ) {
                _.each(list, item => callback(item));
            }
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

        export class PropertyNodeSelector extends Treaty.Compilation.RuntimeVisitor implements ISelectNode, IRuntimeVisitor {
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