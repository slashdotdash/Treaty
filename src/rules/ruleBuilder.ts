///<reference path='.\rule.ts' />
///<reference path='..\compilation\conditionVisitor.ts' />
///<reference path='.\consequences\consequence.ts' />

module Treaty {
    export module Rules {
        export interface IBuildRule {
            rule(): IConfigureRule;
        }

        export interface IConfigureRule {
            named(name: string): IConfigureRule;
            when(instanceType: string, expression: (instance) => bool): IConfigureRule;
            then(instanceType: string, expression: (instance) => void): IConfigureRule;
            build(): Rule;
        }

        export class RuleFactory implements IBuildRule {
            private expressionParser: Treaty.Compilation.ExpressionParser = new Treaty.Compilation.ExpressionParser();
            
            public rule(): IConfigureRule {
                return new RuleBuilder(this.expressionParser);
            }
        }
        
        export class RuleBuilder implements IConfigureRule {
            private name: string;
            private conditionBuilders: ConditionBuilder[] = [];
            private consequenceBuilders: ConsequenceBuilder[] = [];

            constructor (private expressionParser: Treaty.Compilation.ExpressionParser) { }
            
            public named(name: string): IConfigureRule {
                this.name = name;
                return this;
            }

            // TODO: overload when instanceType not a string, use obj.toType() function below.
            // Object.toType = function(obj) { return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase(); }

            public when(instanceType: string, expression: (instance) => bool): IConfigureRule {
                this.conditionBuilders.push(new ConditionBuilder(instanceType, expression));
                return this;
            }

            public then(instanceType: string, expression: (instance) => void ): IConfigureRule {
                this.consequenceBuilders.push(new ConsequenceBuilder(instanceType, expression));
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

                this.consequenceBuilders.forEach(builder => {
                    builder.build().forEach(consequence => {
                        consequences.push(consequence);
                    });
                });

                return new Rule(this.name, conditions, consequences);
            }
        }
        
        export class ConditionBuilder {
            private conditionParser = new Treaty.Compilation.ConditionParser();

            constructor (private instanceType: string, private expression: (instance) => bool) { }

            public build(expressionParser: Treaty.Compilation.ExpressionParser): ICondition[] {
                var script = expressionParser.parse(this.expression);

                return this.conditionParser.parse(this.instanceType, script);
            }
        }

        export class ConsequenceBuilder {
            constructor (private instanceType: string, private consequence: (instance) => void) { }

            public build(): IConsequence[] {
                var consequences = new IConsequence[];

                consequences.push(new Treaty.Rules.Consequences.DelegateConsequence(this.instanceType, this.consequence));

                return consequences;
            }
        }
    }
}