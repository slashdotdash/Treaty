///<reference path='..\testReferences.ts' />

module Treaty {
    module Tests {
        module Conditions {
            class Order {
                constructor(public amount: number) { }
            }            

            describe("parsing basic math functions", () => {
                var subject: Treaty.Rules.ConditionBuilder;
                var conditions: Treaty.Rules.ICondition[];

                describe("number member expression greater than and equal", () => {
                    beforeEach(() => {
                        subject = new Treaty.Rules.ConditionBuilder(Treaty.Type.create('Order'), (order: Order) => order.amount > 3 + 4 && order.amount == 16/2);
                        conditions = subject.build(new Treaty.Compilation.ExpressionParser());
                    });
                
                    it("should parse conditions", () => {
                        expect(conditions.length).toBe(2);
                    });

                    it("should create two property conditions", () => {
                        expect(conditions[0] instanceof Treaty.Rules.Conditions.PropertyGreaterThanCondition).toBeTruthy();
                        expect(conditions[1] instanceof Treaty.Rules.Conditions.PropertyEqualCondition).toBeTruthy();
                    });

                    it("should extract condition properties from first expression", () => {
                        var condition = <Treaty.Rules.Conditions.PropertyGreaterThanCondition>conditions[0];
                        expect(condition.instanceType).toBe(Treaty.Type.create('Order'));
                        expect(condition.memberExpression).toNotBe(null);
                        expect(condition.value).toBe(7);
                    });

                    it("should extract condition properties from second expression", () => {
                        var condition = <Treaty.Rules.Conditions.PropertyEqualCondition>conditions[1];
                        expect(condition.instanceType).toBe(Treaty.Type.create('Order'));
                        expect(condition.memberExpression).toNotBe(null);
                        expect(condition.value).toBe(8);
                    });
                });
            });
        }
    }
}