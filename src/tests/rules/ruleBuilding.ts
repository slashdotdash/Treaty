/// <reference path="..\..\..\typings\jasmine-1.2.d.ts" />
/// <reference path="..\..\rules\ruleBuilder.ts" />
/// <reference path="..\..\rules\rule.ts" />
/// <reference path="..\..\rules\conditions\condition.ts" />

///<reference path='..\..\..\lib\TypeScript\compiler\' />
///<reference path='..\..\rules\' />
///<reference path='..\..\rules\conditions\' />
///<reference path='..\..\compilation\' />

module Treaty {
    module Tests {
        module Rules {
            class Person {
                constructor (public name: string) { }
            }
            
            describe("ruleBuilder", function () {
                var subject = new Treaty.Rules.RuleFactory();               

                it("should build named rule", function () {
                    var rule = subject.rule().named("name").build();

                    expect(rule.name).toEqual("name");
                });
                
                describe("with condition", function () { 
                    it("should support basic conditions", function () {
                        var rule = subject.rule().named("rule")
                            .when('Person', (person: Person) => person.name == "Bob")
                            .build();

                        expect(rule.conditions.length).toEqual(1);
                    });
                });
                
                describe("with consequence", () => {
                    it("should support simple consequences", function () {
                        var rule = subject.rule().named("rule")
                            .when("Person", (person: Person) => true)
                            .then("Person", (person: Person) => { })
                            .build();

                        expect(rule.consequences.length).toEqual(1);
                    });
                });

                describe("with property equals condition", () => {
                    var rule: Treaty.Rules.Rule;

                    beforeEach(() => {
                        rule = subject.rule().named("Rule")
                            .when("Person", (p: Person) => p.name == "Bob")
                            .then("Person", (p: Person) => console.log("consequence"))
                            .build();
                    });

                    it("should create a single condition", function () {                       
                        expect(rule.conditions.length).toEqual(1);
                    });

                    it("should create property equal condition", function () {
                        expect(rule.conditions[0] instanceof Treaty.Rules.Conditions.PropertyEqualCondition).toBeTruthy();
                    });

                    it("should match expected value", function () {
                        var condition = <Treaty.Rules.Conditions.PropertyEqualCondition>rule.conditions[0];
                        expect(condition.value).toEqual("Bob");
                    });
                });
                
                //rule.named("Issue Adult Bus Pass")
	            //	.when(instanceof(Person), p => IsAdult(p))
	            //    .then(p => insertLogical(new AdultBusPass(p));
            });
        }
    }
}