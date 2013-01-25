///<reference path='..\testReferences.ts' />
 
module Treaty {
    module Tests {
        module Conditions {
            class Order {
                constructor (public amount: number) { }
            }

            describe("less than or equal condition", () => {
                var factory: Treaty.Tests.Factory;
                var wasCalled = false;

                beforeEach(() => {
                    var condition = Treaty.Rules.Conditions.Condition.lessThanOrEqual('Order', (o: Order) => o.amount, 100);

                    factory = new Treaty.Tests.Factory()
                        .withCondition(condition)
                        .withConsequence('Order', (o: Order) => wasCalled = true)
                        .buildRulesEngine();
                });

                describe("matching less than value", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Order', new Order(99)).run();
                    });

                    it("should execute consequence", () => {
                        expect(wasCalled).toBeTruthy();
                    })
                });

                describe("matching equal value", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Order', new Order(100)).run();
                    });

                    it("should not execute consequence", () => {
                        expect(wasCalled).toBeTruthy();
                    })
                });

                describe("not matching greater than value", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Order', new Order(101)).run();
                    });

                    it("should not execute consequence", () => {
                        expect(wasCalled).toBeFalsy();
                    })
                });
            });
        }
    }
}