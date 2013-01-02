///<reference path='..\..\..\lib\TypeScript\compiler\typescript.ts' />

///<reference path='..\rule.ts' />
///<reference path='..\..\compilation\conditionVisitor.ts' />

module Treaty {
    export module Rules {
        export module Conditions {

            // Condition building convenience methods
            export class Condition {
                private static expressionParser: Treaty.Compilation.ExpressionParser = new Treaty.Compilation.ExpressionParser();

                public static equal(instanceType: string, property: Function, value: any): PropertyEqualCondition {
                    return new PropertyEqualCondition(instanceType, parseExpression(property), value);
                }

                public static notEqual(instanceType: string, property: Function, value: any): PropertyNotEqualCondition {
                    return new PropertyNotEqualCondition(instanceType, parseExpression(property), value);
                }

                public static exists(instanceType: string, property: Function): PropertyExistsCondition {
                    return new PropertyExistsCondition(instanceType, parseExpression(property));
                }

                public static greaterThan(instanceType: string, property: Function, value: number): PropertyGreaterThanCondition {
                    return new PropertyGreaterThanCondition(instanceType, parseExpression(property), value);
                }

                public static greaterThanOrEqual(instanceType: string, property: Function, value: number): PropertyGreaterThanOrEqualCondition {
                    return new PropertyGreaterThanOrEqualCondition(instanceType, parseExpression(property), value);
                }

                public static lessThan(instanceType: string, property: Function, value: number): PropertyLessThanCondition {
                    return new PropertyLessThanCondition(instanceType, parseExpression(property), value);
                }

                public static lessThanOrEqual(instanceType: string, property: Function, value: number): PropertyLessThanOrEqualCondition {
                    return new PropertyLessThanOrEqualCondition(instanceType, parseExpression(property), value);
                }

                private static parseExpression(property: Function): Treaty.Compilation.Expression {
                    return Treaty.Compilation.Expression.parse(expressionParser.parse(property));
                }

                public static each(instanceType: string, property: Function): PropertyEachCondition {
                    return new PropertyEachCondition(instanceType, parseExpression(property));
                }
            }

            export interface IPropertyCondition extends Treaty.Rules.ICondition {
                memberExpression: Treaty.Compilation.Expression;
            }

            export class PropertyEqualCondition implements IPropertyCondition {
                constructor (public instanceType: string, public memberExpression: Treaty.Compilation.Expression, public value: any) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyNotEqualCondition implements IPropertyCondition {
                constructor (public instanceType: string, public memberExpression: Treaty.Compilation.Expression, public value: any) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyExistsCondition implements IPropertyCondition {
                constructor (public instanceType: string, public memberExpression: Treaty.Compilation.Expression) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyGreaterThanCondition implements IPropertyCondition {
                constructor (public instanceType: string, public memberExpression: Treaty.Compilation.Expression, public value: number) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyGreaterThanOrEqualCondition implements IPropertyCondition {
                constructor (public instanceType: string, public memberExpression: Treaty.Compilation.Expression, public value: number) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyLessThanCondition implements IPropertyCondition {
                constructor (public instanceType: string, public memberExpression: Treaty.Compilation.Expression, public value: number) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyLessThanOrEqualCondition implements IPropertyCondition {
                constructor (public instanceType: string, public memberExpression: Treaty.Compilation.Expression, public value: number) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyEachCondition implements IPropertyCondition {
                constructor (public instanceType: string, public memberExpression: Treaty.Compilation.Expression) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class OrCondition implements Treaty.Rules.ICondition {
                constructor (public instanceType: string, public leftCondition: IPropertyCondition, public rightCondition: IPropertyCondition) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitOrCondition(this);
                }
            }
        }
    }
}