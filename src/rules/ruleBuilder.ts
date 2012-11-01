///<reference path='.\rule.ts' />
///<reference path='..\compilation\conditionVisitor.ts' />

module Treaty {
    export module Rules {
        export interface IBuildRule {
            named(name: string): IBuildRule;
            when(instanceType: string, expression: (instance) => bool): IBuildRule;
            build(): Rule;
        }

        export class RuleBuilder implements IBuildRule {
            private name: string;
            private expressionParser: Treaty.Compilation.ExpressionParser = new Treaty.Compilation.ExpressionParser();
            private conditionBuilders: ConditionBuilder[] = [];
            
            public rule(): IBuildRule {
                return this;
            }

            public named(name: string): IBuildRule {
                this.name = name;
                return this;
            }

            public when(instanceType: string, expression: (instance) => bool): IBuildRule {
                this.conditionBuilders.push(new ConditionBuilder(instanceType, expression));
                return this;
            }

            public build(): Rule {
                var conditions: ICondition[] = [];
                var consequences: IConsequence[] = [];

                this.conditionBuilders.forEach(builder => {
                    builder.build(this.expressionParser).forEach(condition => {
                        conditions.push(condition);
                    });
                });

                return new Rule(this.name, conditions, consequences);
            }
        }
        
        export class ConditionBuilder {
            constructor (private instanceType: string, private expression: (instance) => bool) { }

            public build(expressionParser: Treaty.Compilation.ExpressionParser): ICondition[] {
                console.log('this.expression:');
                console.log(this.expression);
                var script = expressionParser.parse(this.expression);
                console.log('script:');
                console.log(script);
                var conditionParser = new Treaty.Compilation.ConditionParser();
                return conditionParser.parse(script);
            }
        }        
    }
}