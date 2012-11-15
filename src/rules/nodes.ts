///<reference path='.\rulesEngine.ts' />
///<reference path='..\compilation\compiler.ts' />

///<reference path='..\..\typings\underscore-typed-1.4.d.ts' />
///<reference path='..\..\lib\Underscore.js\underscore.js' />

module Treaty {
    export module Rules {
        export interface IActivation extends IActivate {
            accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool;
        }

        export interface INode {
            successors: Rules.IActivation[];

            accept(visitor: Treaty.Compilation.IRuntimeVisitor): void;

            addActivation(activation: Treaty.Rules.IActivation): void;
        }

        export class AlphaNode implements INode, IActivation {
            public successors = new IActivation[];
            
            constructor (public id: number, private instanceType: string) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitAlphaNode(this, next => _.all(this.successors, (activation: IActivation) => activation.accept(next)));
            }

            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.successors.push(activation);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                context.access(this.id, memory => memory.activate(context));
                context.schedule(session => this.successors.forEach(successor => successor.activate(context)));
            }
        }

        export class PropertyNode implements INode, IActivation {
            public successors = new IActivation[];
            
            constructor (public id: number, public instanceType: string, public memberName: string) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitPropertyNode(this, next => _.all(this.successors, (activation: IActivation) => activation.accept(next)));
            }
            
            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.successors.push(activation);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                if (context.fact.hasOwnProperty(this.memberName)) {
                    var value = context.fact[this.memberName];
                    var activationToken = new Rules.ActivationToken(this.instanceType, typeof (value));

                    var propertyContext = context.createContext('ActivationToken', activationToken);

                    _.each(this.successors, (activation: IActivation) => activation.activate(propertyContext));
                }
            }
        }

        export class JoinNode implements INode {
            public successors = new IActivation[];
            
            constructor (public id: number, public rightActivation: Rules.IActivation) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitJoinNode(this, next => this.rightActivation.accept(next) && _.all(this.successors, (activation: IActivation) => activation.accept(next)));
            }
            
            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.successors.push(activation);
            }
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
    }
}