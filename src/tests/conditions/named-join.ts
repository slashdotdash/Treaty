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
            //class Person {
            //    constructor(public name: string) { }
            //}

            //class Order {
            //    constructor(public amount: number, public orderedBy: Person) { }
            //}

            class Cheese {
                constructor(public name: string) { }
            }

            class Person {
                constructor(public favouriteCheese: string) { }
            }

            describe("join conditions", () => {
                var factory: Treaty.Tests.Factory;
                var wasCalled = false;

                beforeEach(() => {                    
                    factory = new Treaty.Tests.Factory()                        
                        .rule(rule => rule
                            .withCondition(Treaty.Rules.Conditions.Condition.equal('Cheese', ($cheddar: Cheese) => $cheddar.name, 'cheddar'))
                            //.withCondition(Treaty.Rules.Conditions.Condition.equal('Cheese', ($stilton: Cheese) => $stilton.name, 'stilton'))
                            .withConsequence('Cheese', ($cheddar: Cheese) => { console.log('$cheddar: '+$cheddar); wasCalled = true; }))
                        //.joinWithConstraint('Cheese', 'Person',
		                //    left => left.withCondition(Treaty.Rules.Conditions.Condition.equal('Cheese', (c: Cheese) => c.name, 'cheddar')), 
                        //    right => { },
                        //    constraint => constraint.where((c: Cheese, p: Person) => c.name == p.favouriteCheese),
		                //    consequence => consequence.withConsequence((c: Cheese, p: Person) => {
			            //        wasCalled = true;
			            //        expect(c.name).toBe('cheddar');
			            //        expect(p.favouriteCheese).toBe('cheddar');
		                //    }))                        
                        .buildRulesEngine();
                });

                xit("should compile rule", () => {
                    expect(factory.rulesEngine.alphaNodes.count).toBe(2);
                });

                xit("should output to dot notation", () => {
                    console.log(factory.toDotNotation('Join'));
                });

                describe("matching named binding", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession()
                            .assertFact('Cheese', new Cheese('cheddar'))
                            .run();
                    });

                    it("should execute consequence", () => {
                        expect(wasCalled).toBeTruthy();
                    })
                });

                xdescribe("matching two joined facts", () => {
                    beforeEach(() => {
                        wasCalled = false;
                        factory.createSession()
                            .assertFact('Cheese', new Cheese('cheddar'))
                            .assertFact('Person', new Person('cheddar'))
                            .run();
                    });

                    it("should execute consequence", () => {
                        expect(wasCalled).toBeTruthy();
                    })
                });

                //describe("not matching only left hand side of join", () => {
                //    beforeEach(() => {
                //        wasCalled = false;
                //        factory.createSession()
                //            .assertFact('Person', new Person('Ben'))
                //            .run();
                //    });

                //    it("should not execute consequence", () => {
                //        expect(wasCalled).toBeFalsy();
                //    })
                //});

                //describe("not matching only right hand side of join", () => {
                //    beforeEach(() => {
                //        wasCalled = false;
                //        factory.createSession()
                //            .assertFact('Order', new Order(1001, new Person('Ben')))
                //            .run();
                //    });

                //    it("should not execute consequence", () => {
                //        expect(wasCalled).toBeFalsy();
                //    })
                //});
            });
        }
    }
}