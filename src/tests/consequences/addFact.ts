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
        module Consequences {
            class Person {
                constructor (public name: string, public age: number) { }
            }

            class EligibleToVote {
                constructor (public person: Person) { }
            }

            describe("add fact consequence", () => {
                var factory: Treaty.Tests.Factory;
                
                beforeEach(() => {
                    var condition = Treaty.Rules.Conditions.Condition.greaterThanOrEqual('Person', (p: Person) => p.age, 18);

                    factory = new Treaty.Tests.Factory()
                        .withCondition(condition)
                        .withAddFactConsequence('Person', (p: Person) => new EligibleToVote(p))
                        .buildRulesEngine();
                });

                describe("matching condition", () => {
                    beforeEach(() => {
                        factory.createSession().assertFact('Person', new Person('Ben', 30)).run();
                    });

                    it("should execute consequence asserting new fact", () => {
                        expect(factory.session.factsOfType(Treaty.Type.create('EligibleToVote')).length).toBe(1);
                    });
                });

                describe("not matching condition", () => {
                    beforeEach(() => {
                        factory.createSession().assertFact('Person', new Person('Joe', 17)).run();
                    });

                    it("should not execute consequence", () => {
                        expect(factory.session.factsOfType(Treaty.Type.create('EligibleToVote')).length).toBe(0);
                    });
                });
            });

            describe("add fact consequence matching rule", () => {
                var factory: Treaty.Tests.Factory;
                var wasCalled: bool;

                beforeEach(() => {
                    factory = new Treaty.Tests.Factory()
                        .rule(rule => rule
                            .withCondition(Treaty.Rules.Conditions.Condition.greaterThanOrEqual('Person', (p: Person) => p.age, 18))
                            .withAddFactConsequence('Person', (p: Person) => new EligibleToVote(p)))
                        .rule(rule => rule
                            .withCondition(Treaty.Rules.Conditions.Condition.equal('EligibleToVote', (e: EligibleToVote) => e.person.name, 'Ben'))
                            .withConsequence('EligibleToVote', (e: EligibleToVote) => wasCalled = true))
                        .buildRulesEngine();
                });

                describe("matching condition", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Person', new Person('Ben', 30)).run();
                    });

                    it("should execute consequence asserting new fact", () => {
                        expect(factory.session.factsOfType(Treaty.Type.create('EligibleToVote')).length).toBe(1);
                    });

                    it("should execute second consequence activated by new fact", () => {
                        expect(wasCalled).toBeTruthy();
                    });
                });

                describe("not matching condition", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession().assertFact('Person', new Person('John', 19)).run();
                    });

                    it("should execute consequence asserting new fact", () => {
                        expect(factory.session.factsOfType(Treaty.Type.create('EligibleToVote')).length).toBe(1);
                    });

                    it("should not execute second consequence", () => {
                        expect(wasCalled).toBeFalsy();
                    });
                });
            });
        }
    }
}