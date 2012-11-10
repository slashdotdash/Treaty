///<reference path='.\rule.ts' />
///<reference path='.\nodes.ts' />
///<reference path='..\compilation\conditionVisitor.ts' />
///<reference path='.\consequences\consequence.ts' />

module Treaty {
    export module Rules {
        export interface IRuntimeConfiguration {
            createNode(factory: (id: number) => INode): INode;

            getAlphaNode(instanceType: string): AlphaNode;
        }

        export class RulesEngine implements IRuntimeConfiguration {
            private nextNodeId: number = 1;
            private alphaNodes = new Cache();

            public createNode(factory: (id: number) => INode): INode {
                return factory(this.nextNodeId++);
            }

            public getAlphaNode(instanceType: string): AlphaNode {
                return <AlphaNode>this.alphaNodes.get(instanceType, this.createAlphaNode);
            }

            private createAlphaNode(instanceType: string): INode {
                var alphaNode = this.createNode(id => new AlphaNode(id, instanceType));
                
                // TODO: Add activations for each implemented interface of the given instance type

                return alphaNode;
            }
        }

        class Cache {
            private items = new [];

            public get(key: string, createWhenMissing: (k: string) => any): any {
                var item = this.items[key];

                if (item == null) {
                    item = createWhenMissing(key);
                    this.items[key] = item;
                }

                return item;
            }
        }
    }
}