///<reference path='.\rulesEngine.ts' />
///<reference path='..\compilation\compiler.ts' />

module Treaty {
    export module Rules {
        export interface INode {
            accept(visitor: Treaty.Compilation.IRuntimeVisitor): void;

            addActivation(activation: IActivation): void;
        }

        export interface IActivation {

        }

        export class AlphaNode implements INode {
            private memoryNode = new MemoryNode();

            constructor (public id: number, private instanceType: string) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): void {
            }

            public addActivation(activation: IActivation): void {
                this.memoryNode.addActivation(activation);
            }
        }

        export class PropertyNode implements INode {
            private memoryNode = new MemoryNode();
            
            constructor (public id: number, private instanceType: string, private memberName: string) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): void {
            }

            public addActivation(activation: IActivation): void {
                this.memoryNode.addActivation(activation);
            }
        }

        class MemoryNode implements INode {
            private successors = new IActivation[];

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): void {
            }

            public addActivation(activation: IActivation): void {
                this.successors.push(activation);
            }
        }
    }
}