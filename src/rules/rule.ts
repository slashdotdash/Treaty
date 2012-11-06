module Treaty {
   export module Rules {
        export class Rule {
            constructor (public name: string, public conditions: ICondition[], public consequences: IConsequence[]) {                
            }
        }
        
        export interface ICondition {
            accept(visitor: IVisitor): void;
        }

        export interface IConsequence {
        }

        export interface IVisitor {
            visit(condition: Conditions.PropertyEqualCondition): void;
        }
    }
}