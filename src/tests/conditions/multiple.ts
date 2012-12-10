///<reference path='..\..\..\typings\jasmine-1.2.d.ts' />

///<reference path='..\factory.ts' />
///<reference path='..\..\rules\rule.ts' />
///<reference path='..\..\rules\conditions\condition.ts' />

///<reference path='..\..\..\lib\TypeScript\compiler\' />
///<reference path='..\..\rules\' />
///<reference path='..\..\rules\conditions\' />
///<reference path='..\..\compilation\' />
 
module Treaty {
    module Tests {
        module Conditions {
            class Order {
                constructor(public name: string, public amount: number) { }
            }

            describe("with two conditions", () => {
                var factory: Treaty.Tests.Factory;
                var wasCalled = false;

                beforeEach(() => {                    
                    factory = new Treaty.Tests.Factory()
                        .withCondition(Treaty.Rules.Conditions.Condition.equal('Order', (o: Order) => o.name, 'Bob'))
                        .withCondition(Treaty.Rules.Conditions.Condition.greaterThan('Order', (o: Order) => o.amount, 1000))
                        .withConsequence('Order', (o: Order) => wasCalled = true)
                        .buildRulesEngine();
                });

                it("should compile rule", () => {
                    expect(factory.rulesEngine.alphaNodes.count).toBe(1);
                });

                describe("matching equal value", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Order', new Order('Bob', 1001)).run();
                    });

                    it("should execute consequence", () => {
                        expect(wasCalled).toBeTruthy();
                    })
                });

                describe("not activate when matching only one side", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Order', new Order('Bob', 999)).run();
                    });

                    it("should not execute consequence", () => {
                        expect(wasCalled).toBeFalsy();
                    })
                });

                describe("not activate when matching only other side", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Order', new Order('John', 1001)).run();
                    });

                    it("should not execute consequence", () => {
                        expect(wasCalled).toBeFalsy();
                    })
                });
            });
        }
    }
}