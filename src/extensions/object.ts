///<reference path='..\references.ts' />

module Treaty {
    // Rudimentary type syntax until TypeScript supports generics
    // TODO: Does not currently support type namespace
    export class Type {
        public static stringType: Type = new Type('String');
        public static numberType: Type = new Type('Number');
        public static booleanType: Type = new Type('Boolean');
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

        // Pseudo generic types
        //  'Token', 'ExampleClass', 'string' => 'Token<ExampleClass, string>'
        public static generic(typeName: string, type1: Type, type2?: Type, type3?: Type, type4?: Type, type5?: Type): Type {
            var args = _.filter([type1, type2, type3, type4, type5], (type: Type) => type !== undefined);
            
            return new Type(typeName + '<' + _.select(args, (type: Type) => type.name).join(', ') + '>', args);
        }

        private static toType(obj: any): string {
            if (obj === undefined) return 'Undefined';
            if (obj === null) return 'Null';

            return obj.constructor.name;
        } 

        private isGeneric: bool;

        // Do not call constructor, use static create factory method
        constructor(public name: string, private genericArgs: Treaty.Type[] = []) {
            this.isGeneric = this.genericArgs.length > 0;
        }

        public isGenericType(): bool {
            return this.isGeneric;
        }

        public getGenericArguments(): Type[] {
            if (this.isGeneric) {
                return this.genericArgs;
            }

            throw 'Not a generic type';
        }

        // Tuple<A, B> => 'Tuple<,>'
        public getGenericTypeDefinition(): string {
            if (this.isGeneric) {
                var type = this.name.substr(0, this.name.indexOf('<'));

                var args: string[] = [];
                _.each(this.genericArgs, (type: Type) => args.push(''))

                return type + '<' + args.join(',') + '>';
            }

            throw 'Not a generic type';
        }

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
            this.register(Type.booleanType);
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