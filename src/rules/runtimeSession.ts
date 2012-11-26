///<reference path='.\rule.ts' />
///<reference path='.\nodes.ts' />
///<reference path='.\rulesEngine.ts' />
///<reference path='.\consequences\consequence.ts' />
///<reference path='..\collections\cache.ts' />

module Treaty {
    export module Rules {
        export interface ISession {
            assert(instanceType: string, fact: any): void;

            run(): void;
        }

        export interface IActivationContext {
            instanceType: string;

            fact: any;
            
            createContext(instanceType: string, fact: any): IActivationContext;

            access(id: number, callback: (memory: ContextMemory) => void): void;

            schedule(action: (session: ISession) => void ): void;
        }

        export class ActivationToken {
            constructor (private sourceType: string, private valueType: string, public context: IActivationContext, public value: any) { }
        }

        class ActivationContext implements IActivationContext {
            constructor (private context: IActivationContext, public instanceType: string, public fact: any) { }

            public createContext(instanceType: string, fact: any): IActivationContext {
                return this.context.createContext(instanceType, fact);
            }

            public access(id: number, callback: (memory: any) => void ): void {
                this.context.access(id, callback);
            }

            public schedule(action: (instance: ISession) => void): void {
                this.context.schedule(session => action(session));
            }
        }

        export class RuntimeSession implements ISession, IActivationContext {
            private facts = new IActivationContext[];
            private memory = new Treaty.Collections.Cache();
            private agenda = new Agenda();

            public fact: any = null;
            public instanceType: string = null;

            constructor (private runtime: IActivate, private objectCache: Treaty.Collections.Cache) { }

            public assert(instanceType: string, fact: any): void {
                var context = new ActivationContext(this, instanceType, fact);

                this.runtime.activate(context);

                this.facts.push(context);
            }

            public run(): void {
                this.agenda.run();
            }

            public createContext(instanceType: string, fact: any): IActivationContext {
                return new ActivationContext(this, instanceType, fact);
            }

            public access(id: number, callback: (memory: ContextMemory) => void): void {
                var contextMemory = <ContextMemory>this.memory.getItem(id.toString(), key => new ContextMemory());

                contextMemory.access(callback);
            }

            public schedule(action: (session: ISession) => void): void {
                this.agenda.schedule(() => action(this));
            }
        }

        export class ContextMemory {
            private contexts = new IActivationContext[];
            private joins = new PendingJoin[];

            public access(callback: (memory: ContextMemory) => void ): void {
                callback(this);
            }

            public activate(context: IActivationContext): void {
                this.contexts.push(context);
                this.filterPendingJoins(context);
            }

            public all(callback: (next: Treaty.Rules.IActivationContext) => bool): void {
                this.join(callback);
            }

            private filterPendingJoins(context: IActivationContext): void {
                this.joins = this.joins.filter(join => join.isApplicable(context));
            }

            private join(callback: (next: Treaty.Rules.IActivationContext) => bool): void {                
                if (_.all(this.contexts, (context: IActivationContext) => callback(context))) {
                    this.joins.push(new PendingJoin(callback));
                }
            }
        }

        class PendingJoin {
            constructor (private predicate: (context: IActivationContext) => bool) { }

            public isApplicable(context: IActivationContext): bool {
                return this.predicate(context);
            }
        }

        class Agenda {
            private operations = new any[];

            public schedule(action: () => void): void {
                this.operations.push(action);
            }

            public run(): void {
                while (this.operations.length > 0) {
                    // execute the first pending operation from the list
                    var operation = this.operations.shift();
                    operation();
                }
            }
        }
    }
}