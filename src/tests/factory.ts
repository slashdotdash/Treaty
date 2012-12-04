///<reference path='..\..\typings\jasmine-1.2.d.ts' />
///<reference path='..\..\lib\TypeScript\compiler\typescript.ts' />

///<reference path='..\compilation\compiler.ts' />
///<reference path='..\rules\rule.ts' />
///<reference path='..\rules\rulesEngineBuilder.ts' />
///<reference path='..\rules\ruleBuilder.ts' />
///<reference path='..\rules\conditions\condition.ts' />
///<reference path='..\rules\consequences\consequence.ts' />

module Treaty {
    export module Tests {
        export class Factory {
            private conditions: Treaty.Rules.ICondition[] = [];
            private consequences: Treaty.Rules.IConsequence[] = [];
            private rules: Treaty.Rules.Rule[] = [];

            public rulesEngine: Treaty.Rules.RulesEngine;

            private session: Treaty.Rules.ISession;

            public withCondition(condition: Treaty.Rules.ICondition): Factory {
                this.conditions.push(condition);                    
                return this;
            }

            public withConsequence(instanceType: string, callback: (instance: any) => void ): Factory {
                var consequence = Treaty.Rules.Consequences.Consequence.delegate(instanceType, callback);
                this.consequences.push(consequence);
                return this;
            }

            public buildRule(): Factory {
                this.rules.push(new Treaty.Rules.Rule('Rules', this.conditions, this.consequences));

                this.conditions = [];
                this.consequences = [];
                return this;
            }
            
            public buildRulesEngine(): Factory {
                var rulesEngineBuilder = new Treaty.Rules.RulesEngineBuilder();

                if (this.conditions.length > 0 || this.consequences.length > 0) {
                    this.buildRule();
                }

                _.each(this.rules, (rule: Treaty.Rules.Rule) => rulesEngineBuilder.addRule(rule));

                this.rulesEngine = rulesEngineBuilder.build();
                return this;
            }

            public createSession(): Factory {
                this.session = this.rulesEngine.createSession();
                return this;
            }

            public assertFact(instanceType: string, fact: any): Factory {
                this.session.assert(instanceType, fact);
                return this;
            }

            public run(): void {
                this.session.run();
            }
        }
    }
}