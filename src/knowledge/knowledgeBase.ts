///<reference path='..\rules\ruleBuilder.ts' />
///<reference path='..\compilation\compiler.ts' />
///<reference path='workingMemory.ts' />

module Treaty {
    export module Knowlegde {
        export class KnowledgeBase {
            private rules = new Rules.Rule[];

            createWorkingMemory(): WorkingMemory {
                // TODO: Validate added rules

                var clonedRules: Rules.Rule[] = new Rules.Rule[this.rules.length];
                this.rules.forEach(value => { clonedRules.push(value); });
                
                return new WorkingMemory(clonedRules);
            }
        }

        export class KnowledgeBuilder {
            private rules: Rules.Rule[] = [];

            public add(rule: Rules.Rule): void {
                this.rules.push(rule);
            }

            public build(): KnowledgeBase {
                var knowledgeBase = new KnowledgeBase();
                
                this.compileRules(knowledgeBase);

                return knowledgeBase;
            }

            private compileRules(knowledgeBase: KnowledgeBase): void {
                var compiler = new Treaty.Compilation.RuleCompiler();

                this.rules.forEach(rule => {
                    compiler.compile(rule);
                });
            }
        }
    }
}