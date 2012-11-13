///<reference path='..\rule.ts' />

module Treaty {
    export module Rules {
        export module Consequences {

            export class DelegateConsequence implements Treaty.Rules.IConsequence {
                constructor (private instanceType: string, private expression: (instance) => void) { }

                public accept(visitor: IVisitor): bool {
                    return visitor.visitConsequence(this);
                }
            }
        }
    }
}