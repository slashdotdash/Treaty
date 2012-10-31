///<reference path='.\rule.ts' />

module Treaty {
    export module Rules {
        export interface IBuildRule {
            named(name: string): IBuildRule;
            when(instanceType: string, expression: (instance) => bool): IBuildRule;
            build(): Rule;
        }

        export class RuleBuilder implements IBuildRule {
            private name: string;
            private conditions: Condition[] = [];
            private consequences: Consequence[] = [];

            constructor () {
            }

            public rule(): IBuildRule {
                return this;
            }

            public named(name: string): IBuildRule {
                this.name = name;
                return this;
            }

            public when(leftInstanceType: string, expression: (instance) => bool): IBuildRule {
                var condition = new ConditionBuilder(leftInstanceType, expression).build();
                this.conditions.push(condition);
                return this;
            }

            public build(): Rule {
                return new Rule(this.name, this.conditions, this.consequences);
            }
        }

        export class ConditionBuilder {
            constructor (private leftInstanceType: string, private expression: (instance) => bool) { }

            public build(): Condition {
                return new PropertyEqualCondition(this.leftInstanceType, this.expression);
            }
        }

        export class PropertyEqualCondition extends Condition {
            constructor (private instanceType: string, private expression: (instance) => bool) {
                super();
            }
        }
    }
}