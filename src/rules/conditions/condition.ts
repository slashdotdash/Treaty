///<reference path='..\..\..\lib\TypeScript\compiler\typescript.ts' />

///<reference path='..\rule.ts' />

module Treaty {
    export module Rules {
        export module Conditions {

            export class PropertyEqualCondition implements Treaty.Rules.ICondition {
                constructor (public memberExpression: TypeScript.AST, public value: any) {
                    console.log('memberExpression: ');
                    console.log(memberExpression);
                    console.log('value: ');
                    console.log(value);
                }

                public accept(visitor: IVisitor): void {
                    visitor.visit(this);
                }
            }
        }
    }
}