///<reference path='.\rule.ts' />
///<reference path='.\consequences\consequence.ts' />
///<reference path='..\compilation\conditionVisitor.ts' />

module Treaty {
    export module Rules {

        export class ConditionConfiguration {
            public conditions: Treaty.Rules.ICondition[] = [];

            constructor(private instanceType: string) { }

            withCondition(condition: Treaty.Rules.ICondition): void {
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