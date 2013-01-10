///<reference path='..\..\..\lib\TypeScript\compiler\typescript.ts' />

///<reference path='..\..\extensions\object.ts' />
///<reference path='..\rule.ts' />
///<reference path='..\..\compilation\conditionVisitor.ts' />

module Treaty {
    export module Rules {
        export module Conditions {

            // Condition building convenience methods
            export class Condition {
                private static expressionParser: Treaty.Compilation.ExpressionParser = new Treaty.Compilation.ExpressionParser();

                public static equal(instanceType: string, property: Function, value: any): PropertyEqualCondition {
                    return new PropertyEqualCondition(Type.create(instanceType), parseExpression(property), value, Type.of(value));
                }

                public static notEqual(instanceType: string, property: Function, value: any): PropertyNotEqualCondition {
                    return new PropertyNotEqualCondition(Type.create(instanceType), parseExpression(property), value, Type.of(value));
                }

                public static exists(instanceType: string, property: Function): PropertyExistsCondition {
                    return new PropertyExistsCondition(Type.create(instanceType), parseExpression(property));
                }

                public static greaterThan(instanceType: string, property: Function, value: number): PropertyGreaterThanCondition {
                    return new PropertyGreaterThanCondition(Type.create(instanceType), parseExpression(property), value);
                }

                public static greaterThanOrEqual(instanceType: string, property: Function, value: number): PropertyGreaterThanOrEqualCondition {
                    return new PropertyGreaterThanOrEqualCondition(Type.create(instanceType), parseExpression(property), value);
                }

                public static lessThan(instanceType: string, property: Function, value: number): PropertyLessThanCondition {
                    return new PropertyLessThanCondition(Type.create(instanceType), parseExpression(property), value);
                }

                public static lessThanOrEqual(instanceType: string, property: Function, value: number): PropertyLessThanOrEqualCondition {
                    return new PropertyLessThanOrEqualCondition(Type.create(instanceType), parseExpression(property), value);
                }

                public static each(instanceType: string, property: Function, itemType: string): PropertyEachCondition {
                    return new PropertyEachCondition(Type.create(instanceType), parseExpression(property), Type.create(itemType));
                }

                private static parseExpression(property: Function): Treaty.Compilation.Expression {
                    return Treaty.Compilation.Expression.parse(expressionParser.parse(property));
                }
            }

            export interface IPropertyCondition extends Treaty.Rules.ICondition {
                memberExpression: Treaty.Compilation.Expression;

                valueType: Treaty.Type;
            }

            export class PropertyEqualCondition implements IPropertyCondition {
                constructor (public instanceType: Treaty.Type, public memberExpression: Treaty.Compilation.Expression, public value: any, public valueType: Treaty.Type) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyNotEqualCondition implements IPropertyCondition {
                constructor (public instanceType: Treaty.Type, public memberExpression: Treaty.Compilation.Expression, public value: any, public valueType: Treaty.Type) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyExistsCondition implements IPropertyCondition {
                public valueType: Treaty.Type;

                constructor (public instanceType: Treaty.Type, public memberExpression: Treaty.Compilation.Expression) { 
                    this.valueType = this.instanceType;
                }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyGreaterThanCondition implements IPropertyCondition {
                public valueType: Type = Type.numberType;

                constructor (public instanceType: Treaty.Type, public memberExpression: Treaty.Compilation.Expression, public value: number) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyGreaterThanOrEqualCondition implements IPropertyCondition {
                public valueType: Type = Type.numberType;

                constructor (public instanceType: Treaty.Type, public memberExpression: Treaty.Compilation.Expression, public value: number) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyLessThanCondition implements IPropertyCondition {
                public valueType: Type = Type.numberType;

                constructor (public instanceType: Treaty.Type, public memberExpression: Treaty.Compilation.Expression, public value: number) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyLessThanOrEqualCondition implements IPropertyCondition {
                public valueType: Type = Type.numberType;

                constructor (public instanceType: Treaty.Type, public memberExpression: Treaty.Compilation.Expression, public value: number) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class PropertyEachCondition implements IPropertyCondition {
                constructor (public instanceType: Treaty.Type, public memberExpression: Treaty.Compilation.Expression, public valueType: Treaty.Type) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitCondition(this);
                }
            }

            export class OrCondition implements Treaty.Rules.ICondition {
                constructor (public instanceType: Treaty.Type, public leftCondition: IPropertyCondition, public rightCondition: IPropertyCondition) { }

                public accept(visitor: Treaty.Rules.IVisitor): bool {
                    return visitor.visitOrCondition(this);
                }
            }
        }
    }
}