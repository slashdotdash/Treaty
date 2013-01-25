///<reference path='..\testReferences.ts' />
 
module Treaty {
    module Tests {
        module Conditions {
            class Order {
                constructor (public amount: number) { }
            }

            describe("greater than condition", () => {
                var factory: Treaty.Tests.Factory;
                var wasCalled = false;

                beforeEach(() => {
                    var condition = Treaty.Rules.Conditions.Condition.greaterThan('Order', (o: Order) => o.amount, 100);

                    factory = new Treaty.Tests.Factory()
                        .withCondition(condition)
                        .withConsequence('Order', (o: Order) => wasCalled = true)
                        .buildRulesEngine();
                });
                
                it("should compile rule", () => {
                    expect(factory.rulesEngine.alphaNodes.count).toBe(1);
                });

                describe("matching greater than value", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Order', new Order(101)).run();
                    });

                    it("should execute consequence", () => {
                        expect(wasCalled).toBeTruthy();
                    })
                });

                describe("not matching equal value", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Order', new Order(100)).run();
                    });

                    it("should not execute consequence", () => {
                        expect(wasCalled).toBeFalsy();
                    })
                });

                describe("not matching less than value", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Order', new Order(99)).run();
                    });

                    it("should not execute consequence", () => {
                        expect(wasCalled).toBeFalsy();
                    })
                });
            });
        }
    }
}