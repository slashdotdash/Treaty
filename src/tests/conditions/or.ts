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

            describe("or conditions", () => {
                var factory: Treaty.Tests.Factory;
                var wasCalled = false;

                beforeEach(() => {                    
                    factory = new Treaty.Tests.Factory()
                        .or('Person',
                            left => left.withCondition(Treaty.Rules.Conditions.Condition.equal('Person', (p: Person) => p.name, 'Ben')), 
                            right => right.withCondition(Treaty.Rules.Conditions.Condition.equal('Person', (p: Person) => p.name, 'Joe'))
                         )
                        .withConsequence('Person', (p: Person) => wasCalled = true)
                        .buildRulesEngine();
                });

                it("should compile rule", () => {
                    expect(factory.rulesEngine.alphaNodes.count).toBe(1);
                });

                it("should output to dot notation", () => {
                    console.log(factory.toDotNotation('Or'));
                });

                describe("matching two joined facts", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession()
                            .assertFact('Person', new Person('Ben'))
                            .assertFact('Person', new Person('Joe'))
                            .run();
                    });

                    it("should execute consequence", () => {
                        expect(wasCalled).toBeTruthy();
                    })
                });

                describe("matching only left hand side of or condition", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession()
                            .assertFact('Person', new Person('Ben'))
                            .run();
                    });

                    it("should execute consequence", () => {
                        expect(wasCalled).toBeTruthy();
                    })
                });

                describe("matching only right hand side of or condition", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession()
                            .assertFact('Person', new Person('Joe'))
                            .run();
                    });

                    it("should execute consequence", () => {
                        expect(wasCalled).toBeTruthy();
                    })
                });
            });
        }
    }
}