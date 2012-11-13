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
            activate(context: IActivationContext): void;
        }

        export interface IRulesEngine {
            createSession(): Treaty.Rules.ISession;
        }

        export interface IRuntimeConfiguration {
            createNode(factory: (id: number) => any): any;

            getAlphaNode(instanceType: string): AlphaNode;
        }

        export class RulesEngine implements IRulesEngine, IRuntimeConfiguration, IActivate {
            private nextNodeId = 1;
            public alphaNodes = new Treaty.Collections.Cache();
            public objectCache = new Treaty.Collections.Cache();

            public activate(context: IActivationContext): void {
                var instanceType = typeof (context.fact);
                var alphaNode = this.alphaNodes.getItem(instanceType, x => this.createAlphaNode(instanceType));
            }

            public createSession(): Treaty.Rules.ISession {
                return new Treaty.Rules.RuntimeSession(this, this.objectCache);
            }

            public createNode(factory: (id: number) => any): any {
                return factory(this.nextNodeId++);
            }

            public getAlphaNode(instanceType: string): AlphaNode {
                return <AlphaNode>this.alphaNodes.getItem(instanceType, x => this.createAlphaNode(instanceType));
            }

            private createAlphaNode(instanceType: string): INode {
                var alphaNode = <AlphaNode>this.createNode(id => new AlphaNode(id, instanceType));
                
                // TODO: Add activations for each implemented interface of the given instance type

                return alphaNode;
            }
        }        
    }
}