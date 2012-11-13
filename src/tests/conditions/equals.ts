///<reference path='..\..\..\typings\jasmine-1.2.d.ts' />
///<reference path='..\..\..\lib\TypeScript\compiler\typescript.ts' />

///<reference path='..\..\compilation\compiler.ts' />
///<reference path='..\..\compilation\selectors.ts' />
///<reference path='..\..\compilation\conditionVisitor.ts' />
///<reference path='..\..\rules\rule.ts' />
///<reference path='..\..\rules\rulesEngineBuilder.ts' />
///<reference path='..\..\rules\ruleBuilder.ts' />
///<reference path='..\..\rules\conditions\condition.ts' />

///<reference path='..\..\..\lib\TypeScript\compiler\' />
///<reference path='..\..\rules\' />
///<reference path='..\..\rules\conditions\' />
///<reference path='..\..\compilation\' />

module Treaty {
    module Tests {
        module Conditions {
            class Person {
                constructor (public name: string) { }
            }

            describe("equals condition", () => {
                var subject: Treaty.Rules.RulesEngine;
                var rulesEngineBuilder = new Treaty.Rules.RulesEngineBuilder();
                var ruleFactory = new Treaty.Rules.RuleFactory();
                var wasCalled = false;

                beforeEach(() => {
                    var rule = ruleFactory.rule()
                        .named('Rule')
                        .when('Person', (p: Person) => p.name == 'Bob')
                        .then('Person', (p: Person) => wasCalled = true)
                        .build();

                    rulesEngineBuilder.addRule(rule);

                    subject = rulesEngineBuilder.build();
                });

                it("should compile rule", () => {
                    expect(subject.alphaNodes.count).toBe(1);
                });

                describe("runtime session", () => {
                    var session: Treaty.Rules.ISession;
                    
                    beforeEach(() => {
                        session = subject.createSession();

                        session.assert(new Person('Bob'));
                        session.run();
                    });

                    it("should assert fact creating an alpha node", () => {
                        expect(subject.alphaNodes.count).toBe(1);
                    });

                    it("should execute consequence", () => {
                        expect(wasCalled).toBeTruthy();
                    })
                });
            });
        }
    }
}