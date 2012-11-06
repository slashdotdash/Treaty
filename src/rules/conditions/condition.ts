///<reference path='..\rule.ts' />

module Treaty {
    export module Rules {
        export module Conditions {

            export class PropertyEqualCondition implements Treaty.Rules.ICondition {
                constructor (public memberName: string, public value: any) {
                    console.log('memberName: ' + memberName);
                    console.log('value: ' + value);
                }

                public accept(visitor: IVisitor): void {
                    visitor.visit(this);
                }
            }
        }
    }
}