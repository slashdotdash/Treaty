///<reference path='..\rules\ruleBuilder.ts' />
///<reference path='workingMemory.ts' />

module Treaty {
    export module Knowlegde {
        export class KnowledgeBase {
            private rules: Rules.Rule[] = new [];

            add(rule: Rules.Rule): void {
                this.rules.push(rule);
            }

            createWorkingMemory(): WorkingMemory {
                // TODO: Validate added rules

                var clonedRules: Rules.Rule[] = new Rules.Rule[this.rules.length];
                this.rules.forEach(value => { clonedRules.push(value); });
                
                return new WorkingMemory(clonedRules);
            }
        }
    }
}