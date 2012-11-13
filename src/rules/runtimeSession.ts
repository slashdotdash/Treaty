///<reference path='.\rule.ts' />
///<reference path='.\nodes.ts' />
///<reference path='.\rulesEngine.ts' />
///<reference path='.\consequences\consequence.ts' />
///<reference path='..\collections\cache.ts' />

module Treaty {
    export module Rules {
        export interface ISession {
            assert(fact: any): void;

            run(): void;
        }

        export interface IActivationContext {
            fact: any;
        }

        class ActivationContext implements IActivationContext {
            constructor (private context: IActivationContext, public fact: any) { }
        }

        export class RuntimeSession implements ISession, IActivationContext {
            private facts = new IActivationContext[];
            public fact: any = null;

            constructor (private runtime: IActivate, private objectCache: Treaty.Collections.Cache) { }

            public assert(fact: any): void {
                var context = new ActivationContext(this, fact);

                this.runtime.activate(context);

                this.facts.push(context);
            }

            public run(): void {

            }
        }
    }
}