///<reference path='..\testReferences.ts' />

module Treaty {
    module Tests {
        module Compilation {
            describe("compiling", () => {
                var subject: Treaty.Compilation.ExpressionParser;
                var script: TypeScript.Script;

                beforeEach(() => {
                    subject = new Treaty.Compilation.ExpressionParser();
                    script = subject.parse((s: string) => s.length == 1);
                });

                it("should compile simple function", () => {
                    expect(script).toNotBe(null);
                    expect(subject.parseErrorMessage).toBeNull();
                });

                it("should compile as Script", () => {
                    expect(script.nodeType).toEqual(TypeScript.NodeType.Script);
                });

                describe("visiting conditions", () => {
                    var conditionParser: Treaty.Compilation.ConditionParser;
                    var state: Treaty.Rules.ICondition[];

                    beforeEach(() => {
                        conditionParser = new Treaty.Compilation.ConditionParser();
                        state = conditionParser.parse(Treaty.Type.stringType, script);
                    });

                    it("should allow traversing compiled AST", () => {
                        expect(state.length).toBe(1);
                    });

                    it("should construct conditions from AST", () => {
                        var condition = state.pop();
                        expect(condition instanceof Treaty.Rules.Conditions.PropertyEqualCondition).toBeTruthy();
                    });

                    it("should set property equal value", () => {
                        var propertyEqualCondition = <Treaty.Rules.Conditions.PropertyEqualCondition>state.pop();
                        expect(propertyEqualCondition.value).toBe(1)
                    });
                });
            });
        }
    }
}