///<reference path='.\rulesEngine.ts' />
///<reference path='..\compilation\compiler.ts' />

module Treaty {
    export module Rules {
        export interface IActivation {
            accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool;
        }

        export interface INode {
            accept(visitor: Treaty.Compilation.IRuntimeVisitor): void;

            addActivation(activation: Treaty.Rules.IActivation): void;
        }

        export class AlphaNode implements INode {
            private memoryNode = new MemoryNode();

            constructor (public id: number, private instanceType: string) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): void {
                this.memoryNode.accept(visitor);
            }

            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.memoryNode.addActivation(activation);
            }
        }

        export class PropertyNode implements INode, IActivation {
            private memoryNode = new MemoryNode();
            
            constructor (public id: number, public instanceType: string, public memberName: string) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitPropertyNode(this, next => this.memoryNode.visitAll(next));
            }
            
            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.memoryNode.addActivation(activation);
            }
        }

        export class DelegateProductionNode implements IActivation {
            constructor (public id: number, private callback: (instance) => void) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitDelegateNode(this, next => true);
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