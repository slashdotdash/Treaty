///<reference path='..\references.ts' />

module Treaty {
    export module Rules {

        export interface IConfigureRule {
            withCondition(condition: Treaty.Rules.ICondition): void;

            withConsequence(instanceType: string, callback: (instance: any) => void ): void;

            withAddFactConsequence(instanceType: string, fact: (instance: any) => any): void;

            appendRuleTo(rules: Treaty.Rules.Rule[]): void;
        }

        export interface IConfigureCondition {
            withCondition(condition: Treaty.Rules.ICondition): void;
        }

        export class RuleConfigurer implements IConfigureRule {
            private conditions: Treaty.Rules.ConditionConfiguration;
            private consequences: Treaty.Rules.ConsequenceConfiguration;

            constructor(private instanceType: Treaty.Type) {
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

            public firstCondition(): Treaty.Rules.ICondition {
                return this.conditions.conditions[0];
            }

            public appendRuleTo(rules: Treaty.Rules.Rule[]): void {
                rules.push(new Treaty.Rules.Rule('Rule', this.conditions.conditions, this.consequences.consequences));
            }
        }

        export class NullRuleConfigurer implements IConfigureRule {
            public withCondition(condition: Treaty.Rules.ICondition): void {
            }

            public withConsequence(instanceType: string, callback: (instance: any) => void ): void {
            }

            public withAddFactConsequence(instanceType: string, fact: (instance: any) => any): void {
            }

            public appendRuleTo(rules: Treaty.Rules.Rule[]): void {
            }
        }
        
        export class ConditionConfiguration implements IConfigureCondition {
            public conditions: Treaty.Rules.ICondition[] = [];

            constructor(private instanceType: Treaty.Type) { }

            public withCondition(condition: Treaty.Rules.ICondition): void {
                if (condition.instanceType.not(this.instanceType)) {
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
                var consequence = Treaty.Rules.Consequences.Consequence.addFact(instanceType, instanceType, fact);
                this.consequences.push(consequence);
            }
        }

        export class JoinConsequenceConfiguration {
            public consequences: Treaty.Rules.IConsequence[] = [];

            constructor(private leftType: string, private rightType: string) { }

            public withConsequence(callback: (left: any, right: any) => void ): void {
                var joinType = Treaty.Type.generic('Tuple', Treaty.Type.create(this.leftType), Treaty.Type.create(this.rightType));
                
                var consequence = new Treaty.Rules.Consequences.DelegateConsequence(joinType, join => {
                    var joined = <JoinedValue>join;
                    
                    callback(joined.left, joined.right);
                });
                this.consequences.push(consequence);
            }

            public withAddFactConsequence(instanceType: string, createFact: (left: any, right: any) => any ): void {
                var joinType = Treaty.Type.generic('Tuple', Treaty.Type.create(this.leftType), Treaty.Type.create(this.rightType));

                var consequence = new Treaty.Rules.Consequences.AddFactConsequence(joinType, Treaty.Type.create(instanceType), join => {
                    var joined = <JoinedValue>join;

                    var newFact = createFact(joined.left, joined.right);

                    return newFact;
                });
                this.consequences.push(consequence);
            }
        }
    }
}