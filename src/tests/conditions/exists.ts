///<reference path='..\..\..\typings\jasmine-1.2.d.ts' />

///<reference path='..\factory.ts' />
///<reference path='..\..\rules\rule.ts' />
///<reference path='..\..\rules\conditions\condition.ts' />

module Treaty {
    module Tests {
        module Conditions {
            
            class OrderLine {
                constructor (public itemNumber: string) { }
            }

            export class Order {
                constructor (public lines: OrderLine[]) { }
            }

            describe("equals condition", () => {
                var factory = new Treaty.Tests.Factory();                
                var matchedOrders: Order[] = [];

                beforeEach(() => {
                    var condition = Treaty.Rules.Conditions.Condition.exists('Order', (o: Order) => o.lines);

                    factory = new Treaty.Tests.Factory()
                        .withCondition(condition)
                        .withConsequence('Order', (o: Order) => matchedOrders.push(o))
                        .buildRulesEngine();
                });
                
                it("should compile rule", () => {
                    expect(factory.rulesEngine.alphaNodes.count).toBe(1);
                });

                describe("runtime session", () => {

                    describe("matching list with one item", () => {
                        beforeEach(() => {
                            var order = new Order([new OrderLine('1')]);
                            factory.createSession().assertFact('Order', order).run();
                        });

                        it("should execute consequence", () => {
                            expect(matchedOrders.length).toBe(1);
                        })
                    });

                    xdescribe("matching list with two items", () => {
                        beforeEach(() => {
                            var order = new Order([ new OrderLine('1'), new OrderLine('2') ]);
                            factory.createSession().assertFact('Order', order).run();                            
                        });

                        it("should execute consequence", () => {
                            expect(matchedOrders.length).toBe(1);
                        })
                    });

                    xdescribe("not matching an empty list", () => {
                        beforeEach(() => {
                            factory.createSession().assertFact('Order', new Order([ ])).run();
                        });

                        it("should not execute consequence", () => {
                            expect(matchedOrders.length).toBe(0);
                        })
                    });
                });
            });
        }
    }
}