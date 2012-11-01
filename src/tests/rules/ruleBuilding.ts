/// <reference path="..\..\..\typings\jasmine-1.2.d.ts" />
/// <reference path="..\..\rules\ruleBuilder.ts" />
/// <reference path="..\..\rules\rule.ts" />

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
                var subject = new Treaty.Rules.RuleBuilder();

                it("should build named rule", function () {
                    var rule = subject.rule().named("name").build();
                });
                
                describe("with condition", function () { 
                    it("should support basic conditions", function () {
                        var rule = subject.rule()
                            .named("rule")
                            .when(typeof (Person), (person: Person) => person.name == "Bob")
                            .build();
                    });
                });
                
                //rule.named("Issue Adult Bus Pass")
	            //	.when(instanceof(Person), p => IsAdult(p))
	            //    .then(p => insertLogical(new AdultBusPass(p));
            });
        }
    }
}