/// <reference path="..\collections\cache.ts" />

module Treaty {
    // Rudimentary type syntax until TypeScript supports generics
    export class Type {
        public static stringType: Type = new Type('String');
        public static numberType: Type = new Type('Number');
        public static arrayType: Type = new Type('Array');
        public static objectType: Type = new Type('Object');
        public static functionType: Type = new Type('Function');
        public static undefinedType: Type = new Type('Undefined');
        public static nullType: Type = new Type('Null');        

        private static registry: TypeRegistry;

        // Get the type for the given object
        public static of(obj: any): Type {
            var typeName = toType(obj);
            
            return create(typeName);
        }

        // Create an instance for the given type or return the same Type instance if already requested
        public static create(typeName: string): Type {
            this.registry = this.registry || new TypeRegistry();
            return this.registry.lookup(typeName);
        }

        private static toType(obj: any): string {
            if (obj === undefined) return 'Undefined';
            if (obj === null) return 'Null';

            return obj.constructor.name;
        } 

        // Do not call constructor, use statuc create factory method
        constructor(public name: string) { }

        public equals(other: Type): bool {
            return this.name == other.name;
        }

        public not(other: Type): bool {
            return this.name != other.name;
        }

        public toString(): string {
            return this.name;
        }
    }

    export class TypeRegistry {
        private knownTypes: Treaty.Collections.Cache = new Treaty.Collections.Cache();

        constructor() {
            this.register(Type.stringType);
            this.register(Type.numberType);
            this.register(Type.arrayType);
            this.register(Type.objectType);
            this.register(Type.functionType);
            this.register(Type.undefinedType);
            this.register(Type.nullType);
        }

        public lookup(typeName: string): Type {
            return this.knownTypes.getItem(typeName, name => new Type(name));
        }

        private register(type: Type): void {
            this.knownTypes.insert(type.name, type);            
        }
    }
}