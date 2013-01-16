///<reference path='..\..\..\typings\jasmine-1.2.d.ts' />

///<reference path='..\factory.ts' />
///<reference path='..\..\rules\rule.ts' />
///<reference path='..\..\rules\conditions\condition.ts' />

///<reference path='..\..\..\lib\TypeScript\compiler\' />
///<reference path='..\..\rules\' />
///<reference path='..\..\rules\conditions\' />
///<reference path='..\..\compilation\' />
///<reference path='..\..\graphing\' />

module Treaty {
    module Tests {
        module Conditions {
            
            class OrderLine {
                constructor (public itemNumber: string) { }
            }

            export class Order {
                constructor (public lines: OrderLine[]) { }
            }

            describe("exists condition", () => {
                var factory: Treaty.Tests.Factory;
                var wasCalled = false;

                beforeEach(() => {
                    factory = new Treaty.Tests.Factory()
                        .rule(rule => rule
                            .withCondition(Treaty.Rules.Conditions.Condition.exists('Order', (o: Order) => o))
                            .withConsequence('Order', (o: Order) => wasCalled = true))
                        .buildRulesEngine();
                });

                it("should compile rule", () => {
                    expect(factory.rulesEngine.alphaNodes.count).toBe(1);
                });

                it("should output to dot notation", () => {
                    console.log(factory.toDotNotation('Exists'));
                });

                describe("runtime session", () => {
                    describe("matching not null item", () => {
                        beforeEach(() => {
                            wasCalled = false;
                            factory.createSession().assertFact('Order', new Order([])).run();
                        });

                        it("should execute consequence", () => {
                            expect(wasCalled).toBe(true);
                        });                        
                    });
                });
            });

            describe("list exists condition", () => {
                var factory: Treaty.Tests.Factory;                
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
                        var order: Order;
                        
                        beforeEach(() => {
                            matchedOrders = [];
                            order = new Order([new OrderLine('1')]);
                            factory.createSession().assertFact('Order', order).run();
                        });

                        it("should execute consequence", () => {
                            expect(matchedOrders.length).toBe(1);
                        });

                        it("should add matched order to list", () => {
                            expect(matchedOrders[0]).toEqual(order);
                        });
                    });

                    describe("matching list with two items", () => {
                        var order: Order;

                        beforeEach(() => {
                            matchedOrders = [];
                            order = new Order([ new OrderLine('1'), new OrderLine('2') ]);
                            factory.createSession().assertFact('Order', order).run();                            
                        });

                        it("should execute consequence", () => {
                            expect(matchedOrders.length).toBe(1);
                        });

                        it("should add matched order to list", () => {
                            expect(matchedOrders[0]).toEqual(order);
                        });
                    });

                    describe("not matching an empty list", () => {
                        beforeEach(() => {
                            matchedOrders = [];
                            factory.createSession().assertFact('Order', new Order([ ])).run();
                        });

                        it("should not execute consequence", () => {
                            expect(matchedOrders.length).toBe(0);
                        });
                    });
                });
            });
        }
    }
}