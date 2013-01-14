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

        export interface RuleFactory {
            withCondition(condition: Treaty.Rules.ICondition): RuleFactory;

            withConsequence(instanceType: string, callback: (instance: any) => void ): RuleFactory;

            withAddFactConsequence(instanceType: string, fact: (instance: any) => any): RuleFactory;
        }

        export class Factory {
            private ruleConfigurer: Treaty.Rules.IConfigureRule = new Treaty.Rules.NullRuleConfigurer();
            private rules: Treaty.Rules.Rule[] = [];

            public rulesEngine: Treaty.Rules.RulesEngine;

            public session: Treaty.Rules.ISession;
            
            public rule(configure: (factory: RuleFactory) => void ): Factory {
                configure(this);
                this.buildRule();
                return this;
            }

            public withCondition(condition: Treaty.Rules.ICondition): Factory {
                this.createRuleConfigurerIfNull(condition.instanceType);
                this.ruleConfigurer.withCondition(condition);
                return this;
            }

            public withConsequence(instanceType: string, callback: (instance: any) => void ): Factory {
                if (this.ruleConfigurer instanceof Treaty.Rules.NullRuleConfigurer)
                    throw 'No Rule Configured';

                this.ruleConfigurer.withConsequence(instanceType, callback);
                return this;
            }

            public withAddFactConsequence(instanceType: string, fact: (instance: any) => any ): Factory {
                this.ruleConfigurer.withAddFactConsequence(instanceType, fact);
                return this;
            }

            public join(leftType: string, rightType: string, 
                configureLeft: (config: Treaty.Rules.ConditionConfiguration) => void, 
                configureRight: (config: Treaty.Rules.ConditionConfiguration) => void,
                configureConsequence: (config: Treaty.Rules.JoinConsequenceConfiguration) => void): Factory {

                var leftConditions = new Treaty.Rules.ConditionConfiguration(Treaty.Type.create(leftType));
                var rightConditions = new Treaty.Rules.ConditionConfiguration(Treaty.Type.create(rightType));
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

            // A rule with an 'or' conditional disjunctive connective results in subrule
            // generation for each possible logically branch; thus one rule can have multiple terminal nodes.
            public or(instanceType: string,
                configureLeft: (config: Treaty.Rules.IConfigureCondition) => void,
                configureRight: (config: Treaty.Rules.IConfigureCondition) => void): Factory {

                var conditionType = Treaty.Type.create(instanceType);

                var leftConfigurer = new Treaty.Rules.RuleConfigurer(conditionType);
                var rightConfigurer = new Treaty.Rules.RuleConfigurer(conditionType);

                configureLeft(leftConfigurer);
                configureRight(rightConfigurer);

                var leftCondition = <Treaty.Rules.Conditions.IPropertyCondition>leftConfigurer.firstCondition();
                var rightCondition = <Treaty.Rules.Conditions.IPropertyCondition>rightConfigurer.firstCondition();

                return this.withCondition(new Treaty.Rules.Conditions.OrCondition(conditionType, leftCondition, rightCondition));
            }

            public buildRule(): Factory {
                this.ruleConfigurer.appendRuleTo(this.rules);

                this.ruleConfigurer = new Treaty.Rules.NullRuleConfigurer();
                return this;
            }
            
            public buildRulesEngine(): Factory {
                var rulesEngineBuilder = new Treaty.Rules.RulesEngineBuilder();

                this.buildRule();

                _.each(this.rules, (rule: Treaty.Rules.Rule) => rulesEngineBuilder.addRule(rule));

                this.rulesEngine = rulesEngineBuilder.build();
                return this;
            }

            public createSession(): Factory {
                this.session = this.rulesEngine.createSession();
                return this;
            }

            public assertFact(instanceType: string, fact: any): Factory {
                this.session.assert(Treaty.Type.create(instanceType), fact);
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

            private createRuleConfigurerIfNull(instanceType: Treaty.Type): void {
                if (this.ruleConfigurer instanceof Treaty.Rules.NullRuleConfigurer)
                    this.ruleConfigurer = new Treaty.Rules.RuleConfigurer(instanceType);
            }
        }
    }
}