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
        module Conditions {
            
            class OrderLine {
                constructor (public itemNumber: string) { }
            }

            class Order {
                constructor (public lines: OrderLine[]) { }
            }

            describe("each condition", () => {
                var factory = new Treaty.Tests.Factory();
                var matchedLines: OrderLine[] = [];

                beforeEach(() => {
                    var condition = Treaty.Rules.Conditions.Condition.each('Order', (o: Order) => o.lines);

                    factory = new Treaty.Tests.Factory()
                        .withCondition(condition)
                        .withConsequence('OrderLine', (l: OrderLine) => matchedLines.push(l))
                        .buildRulesEngine();
                });
                
                describe("matching list with one item", () => {
                    var order: Order;
                    var line: OrderLine;

                    beforeEach(() => {
                        matchedLines = [];
                        line = new OrderLine('1');
                        order = new Order([ line ]);
                        factory.createSession().assertFact('Order', order).run();
                    });

                    it("should execute consequence", () => {
                        expect(matchedLines.length).toBe(1);
                    });

                    it("should add matched order to list", () => {
                        expect(matchedLines[0]).toEqual(line);
                    });
                });

                describe("matching list with two items", () => {
                    var order: Order;
                    var line1: OrderLine;
                    var line2: OrderLine;

                    beforeEach(() => {
                        matchedLines = [];
                        line1 = new OrderLine('1');
                        line2 = new OrderLine('2');
                        order = new Order([ line1, line2 ]);
                        factory.createSession().assertFact('Order', order).run();                            
                    });

                    it("should execute consequence", () => {
                        expect(matchedLines.length).toBe(2);
                    });

                    it("should add matched order to list twice", () => {
                        expect(matchedLines[0]).toEqual(line1);
                        expect(matchedLines[1]).toEqual(line2);
                    });
                });

                describe("not matching an empty list", () => {
                    beforeEach(() => {
                        matchedLines = [];
                        factory.createSession().assertFact('Order', new Order([])).run();
                    });

                    it("should not execute consequence", () => {
                        expect(matchedLines.length).toBe(0);
                    });
                });
            });
        }
    }
}