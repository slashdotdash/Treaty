///<reference path='..\rule.ts' />

module Treaty {
    export module Rules {
        export module Consequences {

            // Condition building convenience methods
            export class Consequence {
                public static delegate(instanceType: string, callback: (instance) => void): DelegateConsequence {
                    return new DelegateConsequence(instanceType, callback, extractParameterName(callback));
                }

                public static addFact(instanceType: string, fact: (instance) => any): AddFactConsequence {
                    return new AddFactConsequence(instanceType, fact);
                }

                private static extractParameterName(func: Function): string {
                    var f = func.toString();
                    f = f.substr(f.indexOf('(') + 1);

                    return f.substr(0, f.indexOf(')'));
                }
            }

            export class DelegateConsequence implements Treaty.Rules.IConsequence {
                constructor (public instanceType: string, public callback: (instance) => void, public parameterName: string) { }

                public accept(visitor: IVisitor): bool {
                    return visitor.visitConsequence(this);
                }
            }

            export class AddFactConsequence implements Treaty.Rules.IConsequence {
                constructor (public instanceType: string, public fact: (instance) => any) { }

                public accept(visitor: IVisitor): bool {
                    return visitor.visitConsequence(this);
                }
            }
        }
    }
}