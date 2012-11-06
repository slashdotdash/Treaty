///<reference path='..\..\..\typings\jasmine-1.2.d.ts' />
///<reference path='..\..\..\lib\TypeScript\compiler\typescript.ts' />

///<reference path='..\..\compilation\compiler.ts' />
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

            }

            describe("compiling rules", () => {
                var subject: Treaty.Compilation.PropertyExpressionVisitor;
                var selector: Treaty.Compilation.ISelectNode;

                beforeEach(() => {
                    subject = new Treaty.Compilation.PropertyExpressionVisitor(new NullNodeSelectorFactory());
                    //selector = subject.createSelector((example: Example) => example);
                    selector = subject.createSelector('prop');
                });

                it("should access no level property", () => {
                    expect(selector instanceof Treaty.Compilation.TypeNodeSelector).toBeTruthy();
                });

                it("should have no next", () => {
                    expect(selector.next).toBeNull();
                });
            });
        }
    }
}
/*Expression<Func<A, A>> propertyExpression = (A a) => a;

PropertyExpressionVisitor visitor = new PropertyExpressionVisitor<A>(_configurator);

NodeSelector selector = visitor.CreateSelector(propertyExpression.Body);

selector.ConsoleWriteLine();

Assert.IsInstanceOf<TypeNodeSelector<A>>(selector);
Assert.IsNull(selector.Next);*?