///<reference path='.\rule.ts' />
///<reference path='.\consequences\consequence.ts' />
///<reference path='..\compilation\conditionVisitor.ts' />

module Treaty {
    export module Rules {

        export interface IConfigureRule {
            withCondition(condition: Treaty.Rules.ICondition): void;

            withConsequence(instanceType: string, callback: (instance: any) => void ): void;

            withAddFactConsequence(instanceType: string, fact: (instance: any) => any): void;

            clone(): IConfigureRule;

            buildRules(): Treaty.Rules.Rule[];
        }

        export interface IConfigureCondition {
            withCondition(condition: Treaty.Rules.ICondition): void;
        }

        export class RuleConfigurer implements IConfigureRule {
            private conditions: Treaty.Rules.ConditionConfiguration;
            private consequences: Treaty.Rules.ConsequenceConfiguration;

            constructor(private instanceType: string) {
                this.conditions = new Treaty.Rules.ConditionConfiguration(instanceType);
                this.consequences = new Treaty.Rules.ConsequenceConfiguration();
            }

            public withCondition(condition: Treaty.Rules.ICondition): void {
                this.conditions.withCondition(condition);
            }

            public withConsequence(instanceType: string, callback: (instance: any) => void ): void {
                this.consequences.withConsequence(instanceType, callback);
            }

            public withAddFactConsequence(instanceType: string, fact: (instance: any) => any): void {
                this.consequences.withAddFactConsequence(instanceType, fact);
            }

            public clone(): IConfigureRule {
                var cloned = new RuleConfigurer(this.instanceType);
                _.each(this.conditions.conditions, (condition: Treaty.Rules.ICondition) => cloned.withCondition(condition));
                return cloned;
            }

            public buildRules(): Treaty.Rules.Rule[] {
                return [ new Treaty.Rules.Rule('Rule', this.conditions.conditions, this.consequences.consequences) ];
            }
        }

        export class NullRuleConfigurer implements IConfigureRule {
            public withCondition(condition: Treaty.Rules.ICondition): void {
            }

            public withConsequence(instanceType: string, callback: (instance: any) => void ): void {
            }

            public withAddFactConsequence(instanceType: string, fact: (instance: any) => any): void {
            }

            public clone(): IConfigureRule {
                return new NullRuleConfigurer();
            }

            public buildRules(): Treaty.Rules.Rule[] {
                return [];
            }
        }

        export class OrRuleConfigurer implements IConfigureRule {
            public leftConfigurer: IConfigureRule;   // Configures left condition
            public rightConfigurer: IConfigureRule;  // Configures right condition
            private consequences: Treaty.Rules.ConsequenceConfiguration;

            constructor(private instanceType: string, private configurer: IConfigureRule) {
                this.leftConfigurer = configurer.clone();
                this.rightConfigurer = configurer.clone();
            }

            public withCondition(condition: Treaty.Rules.ICondition): void {
                this.leftConfigurer.withCondition(condition);
                this.rightConfigurer.withCondition(condition);
            }

            public withLeftCondition(condition: Treaty.Rules.ICondition): void {
                this.leftConfigurer.withCondition(condition);
            }

            public withRightCondition(condition: Treaty.Rules.ICondition): void {
                this.rightConfigurer.withCondition(condition);
            }

            public withConsequence(instanceType: string, callback: (instance: any) => void ): void {
                this.leftConfigurer.withConsequence(instanceType, callback);
                this.rightConfigurer.withConsequence(instanceType, callback);
            }

            public withAddFactConsequence(instanceType: string, fact: (instance: any) => any): void {
                this.leftConfigurer.withAddFactConsequence(instanceType, fact);
                this.rightConfigurer.withAddFactConsequence(instanceType, fact);
            }

            public clone(): IConfigureRule {
                throw 'Not Supported';
            }

            public buildRules(): Treaty.Rules.Rule[] {
                return _.union(this.leftConfigurer.buildRules(), this.rightConfigurer.buildRules());
            }
        }
        
        export class ConditionConfiguration implements IConfigureCondition {
            public conditions: Treaty.Rules.ICondition[] = [];

            constructor(private instanceType: string) { }

            public withCondition(condition: Treaty.Rules.ICondition): void {
                if (condition.instanceType != this.instanceType) {
                    throw 'Type mismatch for condition, expected: ' + this.instanceType + ', but got: ' + condition.instanceType;
                }

                this.conditions.push(condition);
            }
        }

        export class ConsequenceConfiguration {
            public consequences: Treaty.Rules.IConsequence[] = [];
            
            public withConsequence(instanceType: string, callback: (instance: any) => void ): void {
                var consequence = Treaty.Rules.Consequences.Consequence.delegate(instanceType, callback);
                this.consequences.push(consequence);
            }

            public withAddFactConsequence(instanceType: string, fact: (instance: any) => any ): void {
                var consequence = Treaty.Rules.Consequences.Consequence.addFact(instanceType, fact);
                this.consequences.push(consequence);
            }
        }

        export class JoinConsequenceConfiguration {
            public consequences: Treaty.Rules.IConsequence[] = [];

            constructor(private leftType: string, private rightType: string) { }

            public withConsequence(callback: (left: any, right: any) => void ): void {
                var joinType = new Array('Join', this.leftType, this.rightType).join('|');  // HACK: Pseudo generic type until proper TypeScript supports

                var consequence = Treaty.Rules.Consequences.Consequence.delegate(joinType, join => {
                    var joined = <JoinedValue>join;
                    
                    callback(joined.left, joined.right);
                });
                this.consequences.push(consequence);
            }
        }
    }
}