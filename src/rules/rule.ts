module Treaty {
   export module Rules {
        export class Rule {
            constructor (private name: string, private conditions: Condition[], private consequences: Consequence[]) {                
            }
        }
        
        export class Condition {
        }

        export class Consequence {

        }
    }
}