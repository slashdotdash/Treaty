///<reference path='..\..\references.ts' />

module Treaty {
    export module Rules {
        export module Consequences {

            // Condition building convenience methods
            export class Consequence {
                public static delegate(instanceType: string, callback: (instance) => void): DelegateConsequence {
                    return new DelegateConsequence(Type.create(instanceType), callback);
                }

                public static addFact(instanceType: string, newFactType: string, fact: (instance) => any): AddFactConsequence {
                    return new AddFactConsequence(Type.create(instanceType), Type.create(newFactType), fact);
                }
            }

            export class DelegateConsequence implements Treaty.Rules.IConsequence {
                constructor (public instanceType: Treaty.Type, public callback: (instance) => void) { }

                public accept(visitor: IVisitor): bool {
                    return visitor.visitConsequence(this);
                }
            }

            export class AddFactConsequence implements Treaty.Rules.IConsequence {
                constructor (public instanceType: Treaty.Type, public newFactType: Treaty.Type, public fact: (instance) => any) { }

                public accept(visitor: IVisitor): bool {
                    return visitor.visitConsequence(this);
                }
            }
        }
    }
}