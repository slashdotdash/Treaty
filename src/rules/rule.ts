///<reference path='.\conditions\condition.ts' />
///<reference path='.\consequences\consequence.ts' />

module Treaty {
    export module Rules {
        
        export interface ICondition extends IAcceptVisitor {
        }

        export interface IConsequence extends IAcceptVisitor {
        }

        export interface IVisitor {
            visitRule(rule: Rule, next: (visitor: IVisitor) => bool): bool;

            visitCondition(condition: Treaty.Rules.Conditions.IPropertyCondition): bool;

            visitConsequence(consequence: Treaty.Rules.IConsequence): bool;
        }
        
        export interface IAcceptVisitor {
            accept(visitor: IVisitor): bool;
        }

        export class Rule implements IAcceptVisitor {
            constructor (public name: string, public conditions: ICondition[], public consequences: IConsequence[]) { }

            public accept(visitor: IVisitor): bool {
                return visitor.visitRule(this, next => this.forAll(this.conditions, next) && this.forAll(this.consequences, next));
            }

            private forAll(list: IAcceptVisitor[], visitor: IVisitor): bool {
                var accepted = true;

                list.forEach(item => accepted = accepted && item.accept(visitor));

                return accepted;
            }
        }
    }
}