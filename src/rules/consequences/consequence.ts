///<reference path='..\rule.ts' />

module Treaty {
    export module Rules {
        export module Consequences {

            export class DelegateConsequence implements Treaty.Rules.IConsequence {
                constructor (public instanceType: string, public callback: (instance) => void) { }

                public accept(visitor: IVisitor): bool {
                    return visitor.visitConsequence(this);
                }
            }
        }
    }
}