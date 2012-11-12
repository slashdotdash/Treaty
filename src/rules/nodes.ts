///<reference path='.\rulesEngine.ts' />
///<reference path='..\compilation\compiler.ts' />

module Treaty {
    export module Rules {
        export interface INode {
            accept(visitor: Treaty.Compilation.IRuntimeVisitor): void;

            addActivation(activation: IActivation): void;
        }

        export interface IActivation {
            accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool;
        }

        export class AlphaNode implements INode {
            private memoryNode = new MemoryNode();

            constructor (public id: number, private instanceType: string) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): void {
                this.memoryNode.accept(visitor);
            }

            public addActivation(activation: IActivation): void {
                this.memoryNode.addActivation(activation);
            }
        }

        export class PropertyNode implements INode, IActivation {
            private memoryNode = new MemoryNode();
            
            constructor (public id: number, public instanceType: string, public memberName: string) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitPropertyNode(this, visitor => this.memoryNode.visitAll(visitor));
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

            public visitAll(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                var satisfied = true;

                this.successors.forEach(activation => {
                    satisfied = satisfied && activation.accept(visitor);
                });

                return satisfied;
            }
        }
    }
}