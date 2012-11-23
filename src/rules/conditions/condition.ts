///<reference path='..\..\..\lib\TypeScript\compiler\typescript.ts' />

///<reference path='..\rule.ts' />
///<reference path='..\..\compilation\conditionVisitor.ts' />

///<reference path='..\..\..\lib\TypeScript\compiler\' />

module Treaty {
    export module Rules {
        export module Conditions {

            // Condition building convenience methods
            export class Condition {
                private static expressionParser: Treaty.Compilation.ExpressionParser = new Treaty.Compilation.ExpressionParser();
                private static expressionAdapter: Treaty.Compilation.ExpressionAdapter = new Treaty.Compilation.ExpressionAdapter();

                public static equal(instanceType: string, property: Function, value: any): PropertyEqualCondition {
                    var memberExpression = expressionAdapter.parse(expressionParser.parse(property));

                    return new PropertyEqualCondition(instanceType, memberExpression, value);
                }

                public static exists(instanceType: string, property: Function): PropertyExistsCondition {
                    var memberExpression = expressionAdapter.parse(expressionParser.parse(property));

                    return new PropertyExistsCondition(instanceType, memberExpression);
                }
            }

            export class PropertyEqualCondition implements Treaty.Rules.ICondition {
                constructor (public instanceType: string, public memberExpression: TypeScript.AST, public value: any) { }

                public accept(visitor: IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyExistsCondition implements Treaty.Rules.ICondition {
                constructor (public instanceType: string, public memberExpression: TypeScript.AST) { }

                public accept(visitor: IVisitor): bool {
                    return true;
                   // return visitor.visitCondition(this);
                }
            }
        }
    }
}