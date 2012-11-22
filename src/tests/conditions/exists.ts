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

///<reference path='..\..\..\lib\TypeScript\compiler\' />
///<reference path='..\..\rules\' />
///<reference path='..\..\rules\conditions\' />
///<reference path='..\..\rules\consequences\' />
///<reference path='..\..\compilation\' />

module Treaty {
    module Tests {
        module Conditions {
            class Order {
                constructor (public lines: OrderLine[]) { }
            }

            class OrderLine {
                constructor (public itemNumber: string) { }
            }

            describe("exists condition", () => {
                var subject: Treaty.Rules.RulesEngine;
                var rulesEngineBuilder = new Treaty.Rules.RulesEngineBuilder();
                var ruleFactory = new Treaty.Rules.RuleFactory();
                var wasCalled = false;

                beforeEach(() => {
                    var rule = ruleFactory.rule()
                        .named('Rule')
                        .when('Order', (o: Order) => o.lines)
                        .then('Order', (o: Order) => wasCalled = true)
                        .build();

                    rulesEngineBuilder.addRule(rule);

                    subject = rulesEngineBuilder.build();
                });
                
                it("should compile rule", () => {
                    expect(subject.alphaNodes.count).toBe(1);
                });

                describe("runtime session", () => {
                    var session: Treaty.Rules.ISession;
                    
                    describe("matching list with one item", () => {
                        beforeEach(() => {
                            wasCalled = false;
                            
                            var lines = new OrderLine[];
                            lines.push(new OrderLine('1'));
                            var order = new Order(lines);

                            session = subject.createSession();
                            session.assert('Order', order);
                            session.run();
                        });

                        it("should execute consequence", () => {
                            expect(wasCalled).toBeTruthy();
                        })
                    });
                });
            });
        }
    }
}