///<reference path='..\..\..\typings\jasmine-1.2.d.ts' />
///<reference path='..\..\..\lib\TypeScript\compiler\typescript.ts' />

///<reference path='..\..\compilation\compiler.ts' />
///<reference path='..\..\compilation\selectors.ts' />
///<reference path='..\..\compilation\conditionVisitor.ts' />
///<reference path='..\..\rules\nodes.ts' />
///<reference path='..\..\rules\rule.ts' />
///<reference path='..\..\rules\rulesEngineBuilder.ts' />
///<reference path='..\..\rules\ruleBuilder.ts' />
///<reference path='..\..\rules\conditions\condition.ts' />

///<reference path='..\..\..\lib\TypeScript\compiler\' />
///<reference path='..\..\rules\' />
///<reference path='..\..\rules\conditions\' />
///<reference path='..\..\rules\consequences\' />
///<reference path='..\..\compilation\' />

module Treaty {
    module Tests {
        module Conditions {
            class Entity {
                constructor(public name: string, public flag: bool) { }
            }            

            describe("parsing predicate expressions", () => {
                var subject: Treaty.Rules.ConditionBuilder;
                var conditions: Treaty.Rules.ICondition[];

                describe("string member expression equals", () => {
                    beforeEach(() => {
                        subject = new Treaty.Rules.ConditionBuilder('Entity', (entity: Entity) => entity.name == 'Ben');
                        conditions = subject.build(new Treaty.Compilation.ExpressionParser());
                    });
                
                    it("should parse condition", () => {
                        expect(conditions.length).toBe(1);
                    });

                    it("should create property equal condition", () => {
                        expect(conditions[0] instanceof Treaty.Rules.Conditions.PropertyEqualCondition).toBeTruthy();
                    });

                    it("should extract condition properties", () => {
                        var propertyEqualCondition = <Treaty.Rules.Conditions.PropertyEqualCondition>conditions[0];
                        expect(propertyEqualCondition.instanceType).toBe('Entity');
                        expect(propertyEqualCondition.memberExpression).toNotBe(null);
                        expect(propertyEqualCondition.value).toBe('Ben');
                    });
                });

                describe("boolean member expression", () => {
                    beforeEach(() => {
                        subject = new Treaty.Rules.ConditionBuilder('Entity', (entity: Entity) => entity.flag);
                        conditions = subject.build(new Treaty.Compilation.ExpressionParser());
                    });
                
                    it("should parse condition", () => {
                        expect(conditions.length).toBe(1);
                    });

                    it("should create property equal condition", () => {
                        expect(conditions[0] instanceof Treaty.Rules.Conditions.PropertyEqualCondition).toBeTruthy();
                    });

                    it("should extract condition properties", () => {
                        var propertyEqualCondition = <Treaty.Rules.Conditions.PropertyEqualCondition>conditions[0];
                        expect(propertyEqualCondition.instanceType).toBe('Entity');
                        expect(propertyEqualCondition.memberExpression).toNotBe(null);
                        expect(propertyEqualCondition.value).toBeTruthy();
                    });
                });
            });
        }
    }
}