///<reference path='..\..\..\typings\jasmine-1.2.d.ts' />
///<reference path='..\..\..\lib\TypeScript\compiler\typescript.ts' />

///<reference path='..\..\compilation\conditionVisitor.ts' />
///<reference path='..\..\rules\rule.ts' />
///<reference path='..\..\rules\ruleBuilder.ts' />
///<reference path='..\..\rules\conditions\condition.ts' />

///<reference path='..\..\..\lib\TypeScript\compiler\' />
///<reference path='..\..\rules\' />
///<reference path='..\..\rules\conditions\' />
///<reference path='..\..\compilation\' />

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
                        state = conditionParser.parse('string', script);
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