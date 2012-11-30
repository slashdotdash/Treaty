//interface Object {
//    toType(): string;
//}

//Object.prototype.toType = function() { 
//    //return ({}).toString.call(this).match(/\s([a-z|A-Z]+)/)[1].toLowerCase(); 
//    return this.constructor.name;
//}

// Object.toType = function(obj) { return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase(); }

module Treaty {
    export class TypeDescriptor {
        public static toType(obj: any): string {
            return obj.constructor.name;
        }
    }
}