///<reference path='..\testReferences.ts' />
 
module Treaty {
    module Tests {
        module Conditions {
            class Person {
                constructor (public name: string) { }
            }

            describe("not equal condition", () => {
                var factory: Treaty.Tests.Factory;
                var wasCalled = false;

                beforeEach(() => {
                    var condition = Treaty.Rules.Conditions.Condition.notEqual('Person', (p: Person) => p.name, 'Bob');

                    factory = new Treaty.Tests.Factory()
                        .withCondition(condition)
                        .withConsequence('Person', (p: Person) => wasCalled = true)
                        .buildRulesEngine();
                });
                
                it("should compile rule", () => {
                    expect(factory.rulesEngine.alphaNodes.count).toBe(1);
                });

                describe("matching not equal value", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Person', new Person('Joe')).run();
                    });

                    it("should execute consequence", () => {
                        expect(wasCalled).toBeTruthy();
                    })
                });
                    
                describe("not matching equal value", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Person', new Person('Bob')).run();
                    });

                    it("should not execute consequence", () => {
                        expect(wasCalled).toBeFalsy();
                    })
                });
            });
        }
    }
}