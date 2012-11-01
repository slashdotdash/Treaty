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
                var parseErrorMessage: string = null;
                var subject: TypeScript.Parser;
                var sourceText: Treaty.Compilation.FuncSourceText;
                var filename = 'tmp.ts';
                var script: TypeScript.Script;

                var globalAstWalkerFactory: TypeScript.AstWalkerFactory = new TypeScript.AstWalkerFactory();

                beforeEach(() => {
                    subject = new TypeScript.Parser();

                    subject.errorCallback = (minChar: number, charLen: number, message: string, unit: number) => {
                        console.log('Parsing failed: ' + message);
                        parseErrorMessage = message;
                    };

                    var func = (s: string) => s.length == 1;
                    sourceText = new Treaty.Compilation.FuncSourceText(func);

                    script = subject.parse(sourceText, filename, 0, TypeScript.AllowedElements.Global);
                });

                it("should compile simple function", () => {
                    expect(script).toNotBe(null);
                    expect(parseErrorMessage).toBeNull();
                });

                it("should compile as Script", () => {
                    expect(script.nodeType).toEqual(TypeScript.NodeType.Script);
                });

                describe("visiting conditions", () => {
                    var conditionParser: Treaty.Compilation.ConditionParser;
                    var state: Treaty.Rules.ICondition[];

                    beforeEach(() => {
                        conditionParser = new Treaty.Compilation.ConditionParser();
                        state = conditionParser.parse(script);
                    });

                    it("should allow traversing compiled AST", () => {
                        console.log('state: ');
                        console.log(state);

                        expect(state.length).toNotBe(0);
                    });

                    it("should construct conditions from AST", () => {
                        var condition = state.pop();
                        expect(condition instanceof Treaty.Rules.Conditions.PropertyEqualCondition).toBeTruthy();
                    });
                });
            });
        }
    }
}

/*// <reference path='..\..\..\typings\lib.d.ts' />*/
//var script: Script = this.parser.parse(sourceText, filename, this.units.length, AllowedElements.Global);