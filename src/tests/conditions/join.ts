///<reference path='..\testReferences.ts' />

module Treaty {
    module Tests {
        module Conditions {
            class Person {
                constructor(public name: string) { }
            }

            class Order {
                constructor(public amount: number) { }
            }

            describe("join conditions", () => {
                var factory: Treaty.Tests.Factory;
                var wasCalled = false;

                beforeEach(() => {                    
                    factory = new Treaty.Tests.Factory()
                        .join('Person', 'Order', 
                            left => left.withCondition(Treaty.Rules.Conditions.Condition.equal('Person', (p: Person) => p.name, 'Ben')), 
                            right => right.withCondition(Treaty.Rules.Conditions.Condition.greaterThan('Order', (o: Order) => o.amount, 1000)),
                            consequence => consequence.withConsequence((p: Person, o: Order) => {
                                wasCalled = true;
                                expect(p.name).toBe('Ben');
                                expect(o.amount).toBe(1001);
                            }))
                        .buildRulesEngine();
                });

                it("should compile rule", () => {
                    expect(factory.rulesEngine.alphaNodes.count).toBe(2);
                });

                it("should output to dot notation", () => {
                    console.log(factory.toDotNotation('Join'));
                });

                describe("matching two joined facts", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession()
                            .assertFact('Person', new Person('Ben'))
                            .assertFact('Order', new Order(1001))
                            .run();
                    });

                    it("should execute consequence", () => {
                        expect(wasCalled).toBeTruthy();
                    })
                });

                describe("not matching only left hand side of join", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession()
                            .assertFact('Person', new Person('Ben'))
                            .run();
                    });

                    it("should not execute consequence", () => {
                        expect(wasCalled).toBeFalsy();
                    })
                });

                describe("not matching only right hand side of join", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession()
                            .assertFact('Order', new Order(1001))
                            .run();
                    });

                    it("should not execute consequence", () => {
                        expect(wasCalled).toBeFalsy();
                    })
                });
            });
        }
    }
}