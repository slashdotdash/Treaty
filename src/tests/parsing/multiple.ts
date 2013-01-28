///<reference path='..\testReferences.ts' />

module Treaty {
    module Tests {
        module Conditions {
            class Entity {
                constructor(public name: string, public gender: string) { }
            }            

            describe("parsing multiple predicate expressions", () => {
                var subject: Treaty.Rules.ConditionBuilder;
                var conditions: Treaty.Rules.ICondition[];

                describe("string member expression equals", () => {
                    beforeEach(() => {
                        subject = new Treaty.Rules.ConditionBuilder(Treaty.Type.create('Entity'), (entity: Entity) => entity.name == 'Ben' && entity.gender == 'M');
                        conditions = subject.build(new Treaty.Compilation.ExpressionParser());
                    });
                
                    it("should parse conditions", () => {
                        expect(conditions.length).toBe(2);
                    });

                    it("should create two property equal conditions", () => {
                        expect(conditions[0] instanceof Treaty.Rules.Conditions.PropertyEqualCondition).toBeTruthy();
                        expect(conditions[1] instanceof Treaty.Rules.Conditions.PropertyEqualCondition).toBeTruthy();
                    });

                    it("should extract condition properties from first expression", () => {
                        var condition = <Treaty.Rules.Conditions.PropertyEqualCondition>conditions[0];
                        expect(condition.instanceType).toBe(Treaty.Type.create('Entity'));
                        expect(condition.memberExpression).toNotBe(null);
                        expect(condition.value).toBe('Ben');
                    });

                    it("should extract condition properties from second expression", () => {
                        var condition = <Treaty.Rules.Conditions.PropertyEqualCondition>conditions[1];
                        expect(condition.instanceType).toBe(Treaty.Type.create('Entity'));
                        expect(condition.memberExpression).toNotBe(null);
                        expect(condition.value).toBe('M');
                    });
                });
            });
        }
    }
}