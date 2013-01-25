///<reference path='..\testReferences.ts' />

module Treaty {
    module Tests {
        module Runtime {
            class Person {
                constructor (public name: string) { }
            }

            describe("exists condition", () => {
                var subject: Treaty.Rules.RulesEngine;
                var rulesEngineBuilder = new Treaty.Rules.RulesEngineBuilder();
                var ruleFactory = new Treaty.Rules.RuleFactory();
                var wasCalled = false;

                beforeEach(() => {
                    var rule = ruleFactory.rule()
                        .named('Rule')
                        .when('Person', (p: Person) => p.name == 'Ben')
                        .then('Person', (p: Person) => wasCalled = true)
                        .build();

                    rulesEngineBuilder.addRule(rule);

                    subject = rulesEngineBuilder.build();
                });

                describe("runtime session", () => {
                    var session: Treaty.Rules.ISession;
                    var person: Person;
                    var factHandle: Treaty.Rules.FactHandle;

                    describe("asserting new fact", () => {
                        beforeEach(() => {
                            wasCalled = false;                            
                            session = subject.createSession();
                            person = new Person('Ben');

                            factHandle = session.assert(Treaty.Type.create('Person'), person);
                            session.run();
                        });

                        it("should return fact handle for inserted fact", () => {
                            expect(factHandle).toNotBe(null);
                            expect(factHandle instanceof Treaty.Rules.FactHandle).toBeTruthy();
                        })

                        it("should relate handle to asserted fact", () => {
                            expect(factHandle.fact).toBe(person);
                        });
                    });
                });
            });
        }
    }
}