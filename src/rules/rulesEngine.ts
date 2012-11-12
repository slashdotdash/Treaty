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
            private nextNodeId = 1;
            public alphaNodes = new NodeCache();

            public createNode(factory: (id: number) => INode): INode {
                return factory(this.nextNodeId++);
            }

            public getAlphaNode(instanceType: string): AlphaNode {
                return <AlphaNode>this.alphaNodes.getItem(instanceType, x => this.createAlphaNode(instanceType));
            }

            private createAlphaNode(instanceType: string): INode {
                var alphaNode = this.createNode(id => new AlphaNode(id, instanceType));
                
                // TODO: Add activations for each implemented interface of the given instance type

                return alphaNode;
            }
        }

        class NodeCache {
            private items = {};
            public count: number = 0;

            public getItem(key: string, createWhenMissing: (k: string) => any): any {
                if (this.items.hasOwnProperty(key)) {
                    return this.items[key];
                }
                
                var item = createWhenMissing(key);
                this.count++;
                this.items[key] = item;

                return item;
            }
        }
    }
}