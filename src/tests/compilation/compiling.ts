///<reference path='..\..\..\typings\jasmine-1.2.d.ts' />
///<reference path='..\..\..\lib\TypeScript\compiler\typescript.ts' />

///<reference path='..\..\compilation\compiler.ts' />
///<reference path='..\..\compilation\selectors.ts' />
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
            class NullNodeSelectorFactory implements Treaty.Compilation.INodeSelectorFactory {
                public create(): Treaty.Compilation.ISelectNode {
                    return null;
                }
            }

            class Example {
                public other: Other = new Other();
            }

            class Other {
                public another: Another = new Another();
            }

            class Another { 
                public andOneMore: OneMore = new OneMore(); 
            }

            class OneMore { }

            describe("compiling rules", () => {
                var subject: Treaty.Compilation.PropertyExpressionVisitor;
                var runtime: Treaty.Rules.IRuntimeConfiguration;
                var expressionParser: Treaty.Compilation.ExpressionParser;
                var selector: Treaty.Compilation.ISelectNode;

                beforeEach(() => {
                    console.log('xxx');
                    runtime = new Treaty.Rules.RulesEngine();
                    console.log('runtime: ');console.log(runtime);
                    subject = new Treaty.Compilation.PropertyExpressionVisitor('Example', new NullNodeSelectorFactory(), runtime);
                    console.log('subject: ');console.log(subject);
                    expressionParser = new Treaty.Compilation.ExpressionParser();
                });                

                describe("no level property", () => {
                    beforeEach(() => {
                        var script = expressionParser.parse((example: Example) => example);
                    console.log('script: ');console.log(script);
                        var expression = new Treaty.Compilation.ExpressionAdapter().parse(script);
                    console.log('expression: ');console.log(expression);

                        selector = subject.createSelector(expression);
                    });

                    it("should access no level property", () => {
                        expect(selector instanceof Treaty.Compilation.TypeNodeSelector).toBeTruthy();
                    });

                    it("should select expected type", () => {
                        var typeNodeSelector = <Treaty.Compilation.TypeNodeSelector>selector;
                        expect(typeNodeSelector.instanceType).toBe('Example');
                    });

                    it("should have no next", () => {
                        expect(selector.next).toBeNull();
                    });
                });

                describe("first level property", () => {
                    beforeEach(() => {
                        var script = expressionParser.parse((example: Example) => example.other);
                        var expression = new Treaty.Compilation.ExpressionAdapter().parse(script);
                        
                        selector = subject.createSelector(expression);
                    });

                    it("should access no level property", () => {
                        expect(selector instanceof Treaty.Compilation.TypeNodeSelector).toBeTruthy();
                    });

                    it("should select expected type", () => {
                        var typeNodeSelector = <Treaty.Compilation.TypeNodeSelector>selector;
                        expect(typeNodeSelector.instanceType).toBe('Example');
                    });

                    it("should access first level property", () => {
                        expect(selector.next instanceof Treaty.Compilation.PropertyNodeSelector).toBeTruthy();
                    });

                    it("should select expected property", () => {
                        var propertyNodeSelector = <Treaty.Compilation.PropertyNodeSelector>selector.next;
                        expect(propertyNodeSelector.memberName).toBe('other');
                    });

                    it("should have no next", () => {
                        expect(selector.next.next).toBeNull();
                    });
                });

                describe("second level property", () => {
                    beforeEach(() => {
                        var script = expressionParser.parse((example: Example) => example.other.another);
                        var expression = new Treaty.Compilation.ExpressionAdapter().parse(script);
                        
                        selector = subject.createSelector(expression);
                    });

                    it("should access no level property", () => {
                        expect(selector instanceof Treaty.Compilation.TypeNodeSelector).toBeTruthy();
                    });

                    it("should access first level property", () => {
                        expect(selector.next instanceof Treaty.Compilation.PropertyNodeSelector).toBeTruthy();
                    });

                    it("should access third level property", () => {
                        expect(selector.next.next instanceof Treaty.Compilation.PropertyNodeSelector).toBeTruthy();
                    });

                    it("should select expected property", () => {
                        var propertyNodeSelector = <Treaty.Compilation.PropertyNodeSelector>selector.next.next;
                        expect(propertyNodeSelector.memberName).toBe('another');
                    });

                    it("should have no next", () => {
                        expect(selector.next.next.next).toBeNull();
                    });
                });

                describe("third level property", () => {
                    beforeEach(() => {
                        var script = expressionParser.parse((example: Example) => example.other.another.andOneMore);
                        var expression = new Treaty.Compilation.ExpressionAdapter().parse(script);
                        
                        selector = subject.createSelector(expression);
                    });

                    it("should access no level property", () => {
                        expect(selector instanceof Treaty.Compilation.TypeNodeSelector).toBeTruthy();
                    });

                    it("should access first level property", () => {
                        expect(selector.next instanceof Treaty.Compilation.PropertyNodeSelector).toBeTruthy();
                    });

                    it("should access third level property", () => {
                        expect(selector.next.next instanceof Treaty.Compilation.PropertyNodeSelector).toBeTruthy();
                    });
                    
                    it("should access fourth level property", () => {
                        expect(selector.next.next.next instanceof Treaty.Compilation.PropertyNodeSelector).toBeTruthy();
                    });

                    it("should select expected property", () => {
                        var propertyNodeSelector = <Treaty.Compilation.PropertyNodeSelector>selector.next.next.next;
                        expect(propertyNodeSelector.memberName).toBe('andOneMore');
                    });

                    it("should have no next", () => {
                        expect(selector.next.next.next.next).toBeNull();
                    });
                });
            });
        }
    }
}