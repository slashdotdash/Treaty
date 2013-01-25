///<reference path='..\testReferences.ts' />

module Treaty {
    module Tests {
        module Conditions {
            class Entity {
                constructor(public name: string, public flag: bool, public age: number) { }
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

                describe("string member expression not equal", () => {
                    beforeEach(() => {
                        subject = new Treaty.Rules.ConditionBuilder('Entity', (entity: Entity) => entity.name != 'Ben');
                        conditions = subject.build(new Treaty.Compilation.ExpressionParser());
                    });
                
                    it("should parse condition", () => {
                        expect(conditions.length).toBe(1);
                    });

                    it("should create property equal condition", () => {
                        expect(conditions[0] instanceof Treaty.Rules.Conditions.PropertyNotEqualCondition).toBeTruthy();
                    });

                    it("should extract condition properties", () => {
                        var propertyEqualCondition = <Treaty.Rules.Conditions.PropertyNotEqualCondition>conditions[0];
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

                describe("number member expression greater than", () => {
	                beforeEach(() => {
		                subject = new Treaty.Rules.ConditionBuilder('Entity', (entity: Entity) => entity.age > 18);
		                conditions = subject.build(new Treaty.Compilation.ExpressionParser());
	                });

	                it("should parse condition", () => {
		                expect(conditions.length).toBe(1);
	                });

	                it("should create property greater than condition", () => {
		                expect(conditions[0] instanceof Treaty.Rules.Conditions.PropertyGreaterThanCondition).toBeTruthy();
	                });

	                it("should extract condition properties", () => {
		                var condition = <Treaty.Rules.Conditions.PropertyGreaterThanCondition>conditions[0];
		                expect(condition.instanceType).toBe('Entity');
		                expect(condition.memberExpression).toNotBe(null);
		                expect(condition.value).toBe(18);
	                });
                });

                describe("number member expression greater than or equal", () => {
	                beforeEach(() => {
		                subject = new Treaty.Rules.ConditionBuilder('Entity', (entity: Entity) => entity.age >= 18);
		                conditions = subject.build(new Treaty.Compilation.ExpressionParser());
	                });

	                it("should parse condition", () => {
		                expect(conditions.length).toBe(1);
	                });

	                it("should create property greater than condition", () => {
		                expect(conditions[0] instanceof Treaty.Rules.Conditions.PropertyGreaterThanOrEqualCondition).toBeTruthy();
	                });

	                it("should extract condition properties", () => {
		                var condition = <Treaty.Rules.Conditions.PropertyGreaterThanOrEqualCondition>conditions[0];
		                expect(condition.instanceType).toBe('Entity');
		                expect(condition.memberExpression).toNotBe(null);
		                expect(condition.value).toBe(18);
	                });
                });

                describe("number member expression less than", () => {
	                beforeEach(() => {
		                subject = new Treaty.Rules.ConditionBuilder('Entity', (entity: Entity) => entity.age < 21);
		                conditions = subject.build(new Treaty.Compilation.ExpressionParser());
	                });

	                it("should parse condition", () => {
		                expect(conditions.length).toBe(1);
	                });

	                it("should create property greater than condition", () => {
		                expect(conditions[0] instanceof Treaty.Rules.Conditions.PropertyLessThanCondition).toBeTruthy();
	                });

	                it("should extract condition properties", () => {
		                var condition = <Treaty.Rules.Conditions.PropertyLessThanCondition>conditions[0];
		                expect(condition.instanceType).toBe('Entity');
		                expect(condition.memberExpression).toNotBe(null);
		                expect(condition.value).toBe(21);
	                });
                });

                describe("number member expression less than or equal", () => {
	                beforeEach(() => {
		                subject = new Treaty.Rules.ConditionBuilder('Entity', (entity: Entity) => entity.age <= 21);
		                conditions = subject.build(new Treaty.Compilation.ExpressionParser());
	                });

	                it("should parse condition", () => {
		                expect(conditions.length).toBe(1);
	                });

	                it("should create property greater than condition", () => {
		                expect(conditions[0] instanceof Treaty.Rules.Conditions.PropertyLessThanOrEqualCondition).toBeTruthy();
	                });

	                it("should extract condition properties", () => {
		                var condition = <Treaty.Rules.Conditions.PropertyLessThanOrEqualCondition>conditions[0];
		                expect(condition.instanceType).toBe('Entity');
		                expect(condition.memberExpression).toNotBe(null);
		                expect(condition.value).toBe(21);
	                });
                });
            });
        }
    }
}