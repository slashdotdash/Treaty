///<reference path='.\rule.ts' />
///<reference path='.\nodes.ts' />
///<reference path='.\rulesEngine.ts' />
///<reference path='.\runtimeSession.ts' />
///<reference path='.\consequences\consequence.ts' />
///<reference path='..\compilation\conditionVisitor.ts' />
///<reference path='..\collections\cache.ts' />

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

            getAlphaNode(instanceType: string): Treaty.Rules.AlphaNode;

            matchJoinNodeOne(left: Rules.INode, callback: (joinNode: Rules.INode) => void): void;

            matchJoinNodeTwo(left: Rules.INode, right: Rules.INode, callback: (joinNode: Rules.INode) => void): void;

            matchLeftJoinNode(left: Rules.INode, callback: (joinNode: Rules.LeftJoinNode) => void): void;
        }

        export class RulesEngine implements IRulesEngine, IRuntimeConfiguration, IActivate {
            private nextNodeId = 1;
            public alphaNodes = new Treaty.Collections.Cache();
            public objectCache = new Treaty.Collections.Cache();

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

            public getAlphaNode(instanceType: string): Treaty.Rules.AlphaNode {
                return <Treaty.Rules.AlphaNode>this.alphaNodes.getItem(instanceType, x => this.createAlphaNode(instanceType));
            }

            public matchJoinNodeOne(left: Rules.INode, callback: (joinNode: Rules.INode) => void ): void {
                var node: JoinNode = _.find(left.successors, (node: JoinNode) => node.rightActivation instanceof ConstantNode);

                if (node == undefined) {
                    var rightActivation = <ConstantNode>this.createNode(id => new ConstantNode(id));

                    node = <JoinNode>this.createNode(id => new JoinNode(id, rightActivation));

                    left.addActivation(node);
                }

                if (node != null)
                    callback(node);
            }

            public matchJoinNodeTwo(left: Rules.INode, right: Rules.INode, callback: (joinNode: Rules.INode) => void ) {
                var node: JoinNode = _.find(left.successors, (node: JoinNode) => node.rightActivation.id == right.id);

                if (node == undefined) {
                    var rightActivation = <any>right;

                    node = <JoinNode>this.createNode(id => new JoinNode(id, rightActivation));

                    left.addActivation(node);
                }

                if (node != null)
                    callback(node);

                //var joinNode: JoinNode = null;

                //// TODO: Find existing join node if one exists

                //var rightActivation = <IActivation>right.successors[0];

                //joinNode = <JoinNode>this.createNode(id => new JoinNode(id, rightActivation));

                //if (joinNode != null)
                //    callback(joinNode);
            }

            public matchLeftJoinNode(left: Rules.INode, callback: (joinNode: Rules.LeftJoinNode) => void ): void {
                var node: LeftJoinNode = _.find(left.successors, (node: LeftJoinNode) => node.rightActivation instanceof ConstantNode);

                if (node == undefined) {
                    var rightActivation = <ConstantNode>this.createNode(id => new ConstantNode(id));

                    node = <LeftJoinNode>this.createNode(id => new LeftJoinNode(id, rightActivation));

                    left.addActivation(node);
                }

                if (node != null)
                    callback(node);
            }            

            private createAlphaNode(instanceType: string): Treaty.Rules.AlphaNode {
                var alphaNode = <Treaty.Rules.AlphaNode>this.createNode(id => new Treaty.Rules.AlphaNode(id, instanceType));
                
                // TODO: Add activations for each implemented interface of the given instance type

                return alphaNode;
            }
        }        
    }
}