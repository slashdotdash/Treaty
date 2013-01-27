///<reference path='..\references.ts' />

module Treaty {
    export module Rules {
        export class RulesEngineBuilder {
            private rules: Rule[] = [];

            public addRule(rule: Rule): void {
                this.rules.push(rule);
            }

            public build(): RulesEngine {
                var engine = new Treaty.Rules.RulesEngine();
                
                this.compileRules(engine);

                return engine;
            }

            private compileRules(engine: RulesEngine): void {
                var compiler = new Treaty.Compilation.RuleCompiler(engine);

                this.rules.forEach(rule => compiler.compile(rule));
            }
        }
    }
}