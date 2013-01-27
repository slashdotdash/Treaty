///<reference path='..\testReferences.ts' />

module Treaty {
    module Tests {
        module Rules {
            describe("rules engine building", function () {
                var subject = new Treaty.Rules.RulesEngineBuilder();

                it("should add rules", function () {
                    subject.addRule(new Treaty.Rules.Rule('rule', [], []));
                });
            });
        }
    }
}