///<reference path='..\rules\rule.ts' />
///<reference path='..\facts\fact.ts' />

module Treaty {
    export module Knowlegde {
        export class WorkingMemory {
            private rules: Rules.Rule[] = new [];
            private facts: Facts.Fact[] = new [];

            constructor (rules: Rules.Rule[]) {
                this.rules = rules;
            }

            assert(fact: Facts.Fact): void {
                // Examine fact for matches against the rules.
                // The work of determining what rules to fire is done during insertion, but no rules are executed at this time. 

                this.facts.push(fact);
            }

            retract(fact: Facts.Fact): void {
            }

            // // Execute the matched rules, should only be called after all the facts have been inserted.
            fireAllRules(): void {                
            }

            dispose(): void {
            }
        }
    }
}