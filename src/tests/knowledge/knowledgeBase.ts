///<reference path='..\..\..\typings\jasmine-1.2.d.ts' />

///<reference path='..\..\knowledge\knowledgeBase.ts' />
///<reference path='..\..\rules\ruleBuilder.ts' />
///<reference path='..\..\rules\rule.ts' />

module Treaty {
    module Tests {
        module Knowledge {
            describe("ruleBuilder", function () {
                var subject = new Treaty.Knowlegde.KnowledgeBuilder();

                it("should add rules", function () {
                    subject.add(new Treaty.Rules.Rule('rule', new Treaty.Rules.ICondition[], new Treaty.Rules.IConsequence[]));
                });
            });
        }
    }
}