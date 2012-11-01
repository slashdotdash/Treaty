module Treaty {
   export module Rules {
        export class Rule {
            constructor (private name: string, private conditions: ICondition[], private consequences: IConsequence[]) {                
            }
        }
        
        export interface ICondition {
        }

        export interface IConsequence {

        }
    }
}