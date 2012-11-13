/// <reference path="..\..\..\typings\jasmine-1.2.d.ts" />
/// <reference path="..\..\rules\ruleBuilder.ts" />
/// <reference path="..\..\rules\rulesEngineBuilder.ts" />
/// <reference path="..\..\rules\rule.ts" />

///<reference path='..\..\..\lib\TypeScript\compiler\' />
///<reference path='..\..\rules\' />
///<reference path='..\..\rules\conditions\' />
///<reference path='..\..\compilation\' />

module Treaty {
    module Tests {
        module Rules {
            describe("rules engine building", function () {
                var subject = new Treaty.Rules.RulesEngineBuilder();
                
                it("should add rules", function () {
                    subject.addRule(new Treaty.Rules.Rule('rule', new Treaty.Rules.ICondition[], new Treaty.Rules.IConsequence[]));
                });
            });
        }
    }
}