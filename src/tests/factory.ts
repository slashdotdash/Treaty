///<reference path='..\..\typings\jasmine-1.2.d.ts' />
///<reference path='..\..\lib\TypeScript\compiler\typescript.ts' />

///<reference path='..\compilation\compiler.ts' />
///<reference path='..\rules\rule.ts' />
///<reference path='..\rules\configuration.ts' />
///<reference path='..\rules\rulesEngineBuilder.ts' />
///<reference path='..\rules\ruleBuilder.ts' />
///<reference path='..\rules\conditions\condition.ts' />
///<reference path='..\rules\consequences\consequence.ts' />

///<reference path='..\graphing\graphingVisitor.ts' />
///<reference path='..\graphing\exporter.ts' />

module Treaty {
    export module Tests {
        
        export class Factory {
            private conditions: Treaty.Rules.ConditionConfiguration;
            private consequences: Treaty.Rules.ConsequenceConfiguration;
            private rules: Treaty.Rules.Rule[] = [];

            public rulesEngine: Treaty.Rules.RulesEngine;

            public session: Treaty.Rules.ISession;

            public withCondition(condition: Treaty.Rules.ICondition): Factory {
                this.conditions = this.conditions || new Treaty.Rules.ConditionConfiguration(condition.instanceType);
                this.conditions.withCondition(condition);
                return this;
            }

            public withConsequence(instanceType: string, callback: (instance: any) => void ): Factory {
                this.consequences = this.consequences || new Treaty.Rules.ConsequenceConfiguration();
                this.consequences.withConsequence(instanceType, callback);
                return this;
            }

            public withAddFactConsequence(instanceType: string, fact: (instance: any) => any ): Factory {
                this.consequences = this.consequences || new Treaty.Rules.ConsequenceConfiguration();
                this.consequences.withAddFactConsequence(instanceType, fact);
                return this;
            }

            public join(leftType: string, rightType: string, 
                configureLeft: (config: Treaty.Rules.ConditionConfiguration) => void, 
                configureRight: (config: Treaty.Rules.ConditionConfiguration) => void,
                configureConsequence: (config: Treaty.Rules.JoinConsequenceConfiguration) => void): Factory {
                var leftConditions = new Treaty.Rules.ConditionConfiguration(leftType);
                var rightConditions = new Treaty.Rules.ConditionConfiguration(rightType);
                var consequence = new Treaty.Rules.JoinConsequenceConfiguration(leftType, rightType);

                configureLeft(leftConditions);
                configureRight(rightConditions);
                configureConsequence(consequence);

                var conditions: Treaty.Rules.ICondition[] = [];
                _.each(leftConditions.conditions, (condition: Treaty.Rules.ICondition) => conditions.push(condition));
                _.each(rightConditions.conditions, (condition: Treaty.Rules.ICondition) => conditions.push(condition));
                
                this.rules.push(new Treaty.Rules.Rule('Rules', conditions, consequence.consequences));

                return this;
            }

            public buildRule(): Factory {
                this.rules.push(new Treaty.Rules.Rule('Rules', this.conditions.conditions, this.consequences.consequences));
                
                this.conditions = null;
                this.consequences = null;
                return this;
            }
            
            public buildRulesEngine(): Factory {
                var rulesEngineBuilder = new Treaty.Rules.RulesEngineBuilder();

                if (this.conditions != null) {
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

            public toDotNotation(name: string): string {
                var graphing = new Treaty.Graphing.GraphingVisitor();                    
                this.rulesEngine.accept(graphing);

                var graph = graphing.rulesEngineGraph();

                return new Treaty.Graphing.Exporter(graph).toDotNotation(name);
            }
        }
    }
}