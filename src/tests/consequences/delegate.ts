///<reference path='..\testReferences.ts' />
 
module Treaty {
    module Tests {
        module Consequences {
            class Order {
                constructor (public id: string, public amount: number) { }
            }

            class Violation {
                constructor (public value: string, public description: string) { }
            }

            describe("add fact consequence", () => {
                var factory: Treaty.Tests.Factory;
                var violation: Violation;

                beforeEach(() => {
                    factory = new Treaty.Tests.Factory()
                        .rule(rule => rule
                            .withCondition(Treaty.Rules.Conditions.Condition.greaterThan('Order', (o: Order) => o.amount, 10000))
                            .withAddFactConsequence('Order', (o: Order) => new Violation(o.id, 'Large order on hold')))
                        .rule(rule => rule
                            .withCondition(Treaty.Rules.Conditions.Condition.equal('Violation', (v: Violation) => v.value, '123'))
                            .withConsequence('Violation', (v: Violation) => violation = v))
                        .buildRulesEngine();
                });

                it("should output to dot notation", () => {
                    console.log(factory.toDotNotation('Delegate Consequence'));
                });

                describe("matching condition", () => {
                    beforeEach(() => {
                        violation = null;
                        factory.createSession().assertFact('Order', new Order('123', 10001)).run();
                    });

                    it("should execute consequence asserting new fact", () => {
                        expect(factory.session.factsOfType(Treaty.Type.create('Violation')).length).toBe(1);
                    });

                    it("should execute delegate consequence with asserted new fact", () => {
                        expect(violation).toNotBe(null);
                        expect(violation.value).toBe('123');
                        expect(violation.description).toBe('Large order on hold');
                    });
                });

                describe("not matching newly asserted fact", () => {
                    beforeEach(() => {
                        violation = null;
                        factory.createSession().assertFact('Order', new Order('456', 10001)).run();
                    });

                    it("should assert new fact", () => {
                        expect(factory.session.factsOfType(Treaty.Type.create('Violation')).length).toBe(1);
                    });

                    it("should not execute delegate consequence with asserted new fact", () => {
                        expect(violation).toBe(null);
                    });
                });
            });
        }
    }
}