///<reference path='..\..\..\typings\jasmine-1.2.d.ts' />
///<reference path='..\..\..\lib\TypeScript\compiler\typescript.ts' />

///<reference path='..\..\compilation\compiler.ts' />
///<reference path='..\..\compilation\selectors.ts' />
///<reference path='..\..\compilation\conditionVisitor.ts' />
///<reference path='..\..\rules\nodes.ts' />
///<reference path='..\..\rules\rule.ts' />
///<reference path='..\..\rules\rulesEngineBuilder.ts' />
///<reference path='..\..\rules\ruleBuilder.ts' />
///<reference path='..\..\rules\conditions\condition.ts' />
///<reference path='..\..\rules\consequences\consequence.ts' />

///<reference path='..\..\..\lib\TypeScript\compiler\' />
///<reference path='..\..\rules\' />
///<reference path='..\..\rules\conditions\' />
///<reference path='..\..\rules\consequences\' />
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

                var rulesEngineWithCondition = (condition: Treaty.Rules.ICondition) => {
                    var conditions: Treaty.Rules.ICondition[] = [];
                    var consequences: Treaty.Rules.IConsequence[] = [];
                    var consequence = Treaty.Rules.Consequences.Consequence.delegate('Person', (p: Person) => wasCalled = true)

                    conditions.push(condition);
                    consequences.push(consequence);

                    var rule = new Treaty.Rules.Rule('Rules', conditions, consequences);

                    rulesEngineBuilder.addRule(rule);

                    subject = rulesEngineBuilder.build();
                }; 

                beforeEach(() => {
                    rulesEngineWithCondition(Treaty.Rules.Conditions.Condition.equal('Person', (p: Person) => p.name, 'Bob'));
                });
                
                it("should compile rule", () => {
                    expect(subject.alphaNodes.count).toBe(1);
                });

                describe("runtime session", () => {
                    var session: Treaty.Rules.ISession;
                    
                    var createSessionWithFact = (instanceType: string, fact: any) => {
                        wasCalled = false;

                        session = subject.createSession();
                        session.assert(instanceType, fact);
                        session.run();
                    };

                    describe("matching equal value", () => {
                        beforeEach(() => {                            
                            createSessionWithFact('Person', new Person('Bob'));
                        });

                        it("should assert fact creating an alpha node", () => {
                            expect(subject.alphaNodes.count).toBeGreaterThan(0);
                        });

                        it("should execute consequence", () => {
                            expect(wasCalled).toBeTruthy();
                        })
                    });
                    
                    describe("not matching inequal value", () => {
                        beforeEach(() => {
                            createSessionWithFact('Person', new Person('Joe'));
                        });

                        it("should not execute consequence", () => {
                            expect(wasCalled).toBeFalsy();
                        })
                    });
                });
            });
        }
    }
}