///<reference path='.\rule.ts' />
///<reference path='.\rulesEngine.ts' />
///<reference path='.\nodes.ts' />
///<reference path='..\compilation\conditionVisitor.ts' />
///<reference path='.\consequences\consequence.ts' />

module Treaty {
    export module Rules {
        export class RulesEngineBuilder {
            private rules = new Rule[];

            public addRule(rule: Rule): void {
                this.rules.push(rule);
            }

            public build(): RulesEngine {
                var engine = new RulesEngine();
                var ruleCompiler = new Treaty.Compilation.RuleCompiler(engine);

                this.rules.forEach(rule => ruleCompiler.compile(rule));

                return engine;
            }
        }
    }
}