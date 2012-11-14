///<reference path='.\rulesEngine.ts' />
///<reference path='..\compilation\compiler.ts' />

module Treaty {
    export module Rules {
        export interface IActivation extends IActivate {
            accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool;
        }

        export interface INode {
            accept(visitor: Treaty.Compilation.IRuntimeVisitor): void;

            addActivation(activation: Treaty.Rules.IActivation): void;

            getSuccessors(): Rules.IActivation[];
        }

        export class AlphaNode implements INode, IActivation {
            private memoryNode: MemoryNode;
            
            constructor (public id: number, private instanceType: string) {
                this.memoryNode = new MemoryNode(id);
            }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                this.memoryNode.accept(visitor);
                return true;
            }

            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.memoryNode.addActivation(activation);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                this.memoryNode.activate(context);
            }

            public getSuccessors(): Rules.IActivation[] { return this.memoryNode.successors; }
        }

        export class PropertyNode implements INode, IActivation {
            private memoryNode: MemoryNode;
            
            constructor (public id: number, public instanceType: string, public memberName: string) {
                this.memoryNode = new MemoryNode(id);
            }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitPropertyNode(this, next => this.memoryNode.visitAll(next));
            }
            
            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.memoryNode.addActivation(activation);
            }

            public activate(context: Treaty.Rules.IActivationContext): void { }

            public getSuccessors(): Rules.IActivation[] { return this.memoryNode.successors; }
        }

        export class JoinNode implements INode {
            private memoryNode: MemoryNode;            
            
            constructor (public id: number, public rightActivation: Rules.IActivation) {
                this.memoryNode = new MemoryNode(id);
            }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitJoinNode(this, next => this.rightActivation.accept(next) && this.memoryNode.visitAll(next));
            }
            
            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.memoryNode.addActivation(activation);
            }

            public getSuccessors(): Rules.IActivation[] { return this.memoryNode.successors; }
        }

        export class DelegateProductionNode implements IActivation {
            constructor (public id: number, private callback: (instance) => void) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitDelegateNode(this, next => true);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                context.schedule(session => this.callback(context.fact));
            }
        }

        export class MemoryNode implements INode {
            public successors = new IActivation[];

            constructor (private id: number) { }

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

            public activate(context: Treaty.Rules.IActivationContext): void {
                context.access(this.id, memory => memory.activate(context));

                context.schedule(session => {
                    this.successors.forEach(successor => successor.activate(context));
                });
            }

            public getSuccessors(): Rules.IActivation[] { return this.successors; }
        }
    }
}