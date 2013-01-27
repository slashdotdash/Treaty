///<reference path='..\references.ts' />

module Treaty {
    export module Rules {
        export interface IActivate {
            activate(context: Treaty.Rules.IActivationContext): void;
        }

        export interface IRulesEngine {
            createSession(): Treaty.Rules.ISession;
        }

        export interface IRuntimeConfiguration {
            createNode(factory: (id: number) => any): any;

            getAlphaNode(instanceType: Treaty.Type): Treaty.Rules.AlphaNode;

            matchJoinNodeOne(instanceType: Treaty.Type, left: Treaty.Rules.INode, callback: (joinNode: Treaty.Rules.INode) => void): void;

            matchJoinNodeTwo(left: Treaty.Rules.INode, right: Treaty.Rules.INode, callback: (joinNode: Treaty.Rules.INode) => void): void;

            matchLeftJoinNode(instanceType: Treaty.Type, discardType: Treaty.Type, left: Treaty.Rules.INode, callback: (joinNode: Treaty.Rules.LeftJoinNode) => void): void;

            matchOuterJoinNode(left: Treaty.Rules.INode, right: Treaty.Rules.INode, callback: (outerJoinNode: Treaty.Rules.OuterJoinNode) => void): void;
        }

        export class RulesEngine implements IRulesEngine, IRuntimeConfiguration, IActivate {
            private nextNodeId = 1;
            public alphaNodes = new Treaty.Collections.Cache();
            public objectCache = new Treaty.Collections.Cache();

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visit(this, next => this.alphaNodes.forEach((activation: IActivation) => activation.accept(next)));
            }

            public activate(context: IActivationContext): void {
                var alphaNode = <Treaty.Rules.IActivation>this.getAlphaNode(context.instanceType);
                
                alphaNode.activate(context);
            }

            public createSession(): Treaty.Rules.ISession {
                return new Treaty.Rules.RuntimeSession(this, this.objectCache);
            }

            public createNode(factory: (id: number) => any): any {
                return factory(this.nextNodeId++);
            }

            public getAlphaNode(instanceType: Treaty.Type): Treaty.Rules.AlphaNode {
                return <Treaty.Rules.AlphaNode>this.alphaNodes.getItem(instanceType.name, x => this.createAlphaNode(instanceType));
            }

            public matchJoinNodeOne(instanceType: Treaty.Type, left: Rules.INode, callback: (joinNode: Rules.INode) => void ): void {
                var node: JoinNode = _.find(left.successors, (node: JoinNode) => node.rightActivation instanceof ConstantNode);

                if (node == undefined) {
                    var rightActivation = <ConstantNode>this.createNode(id => new ConstantNode(id, instanceType));

                    node = <JoinNode>this.createNode(id => new JoinNode(id, left.instanceType, rightActivation));

                    left.addActivation(node);
                }

                if (node != null)
                    callback(node);
            }

            public matchJoinNodeTwo(left: Rules.INode, right: Rules.INode, callback: (joinNode: Rules.INode) => void ) {
                var node: JoinNode = _.find(left.successors, (node: JoinNode) => node.rightActivation.id == right.id);

                if (node == undefined) {
                    var rightActivation = <any>right;

                    node = <JoinNode>this.createNode(id => new JoinNode(id, left.instanceType, rightActivation));

                    left.addActivation(node);
                }

                if (node != null)
                    callback(node);
            }

            public matchLeftJoinNode(instanceType: Treaty.Type, discardType: Treaty.Type, left: Rules.INode, callback: (joinNode: Rules.LeftJoinNode) => void ): void {
                var node: LeftJoinNode = _.find(left.successors, (node: LeftJoinNode) => node.rightActivation instanceof ConstantNode);

                if (node == undefined) {
                    var rightActivation = <ConstantNode>this.createNode(id => new ConstantNode(id, instanceType));

                    node = <LeftJoinNode>this.createNode(id => new LeftJoinNode(id, instanceType, discardType, rightActivation));

                    left.addActivation(node);
                }

                if (node != null)
                    callback(node);
            }

            public matchOuterJoinNode(left: Treaty.Rules.INode, right: Treaty.Rules.INode, callback: (outerJoinNode: Treaty.Rules.OuterJoinNode) => void ): void {
                var node: OuterJoinNode = _.find(left.successors, (node: OuterJoinNode) => node instanceof OuterJoinNode && node.rightActivation.id == right.id);
                
                if (node == undefined) {
                    var rightActivation = <any>right;

                    node = <OuterJoinNode>this.createNode(id => new OuterJoinNode(id, left.instanceType, right.instanceType, rightActivation));

                    left.addActivation(node);
                }
                
                if (node != null)
                    callback(node);
            }

            private createAlphaNode(instanceType: Treaty.Type): Treaty.Rules.AlphaNode {
                var alphaNode = <Treaty.Rules.AlphaNode>this.createNode(id => new Treaty.Rules.AlphaNode(id, instanceType));
                
                // TODO: Add activations for each implemented interface of the given instance type

                return alphaNode;
            }
        }        
    }
}