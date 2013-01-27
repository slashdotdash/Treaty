///<reference path='..\references.ts' />

module Treaty {
    export module Rules {

        export interface IComparator {
            compare(left: any, right: any): bool;

            toString(): string;
        }

        export class GreaterThanValueComparator implements IComparator {
            public compare(left: any, right: any): bool {
                return left > right;
            }

            public toString(): string { return '>'; }
        }

        export class GreaterThanOrEqualValueComparator implements IComparator {
            public compare(left: any, right: any): bool {
                return left >= right;
            }
            
            public toString(): string { return '>='; }
        }

        export class LessThanValueComparator implements IComparator {
            public compare(left: any, right: any): bool {
                return left < right;
            }

            public toString(): string { return '<'; }
        }

        export class LessThanOrEqualValueComparator implements IComparator {
            public compare(left: any, right: any): bool {
                return left <= right;
            }

            public toString(): string { return '<='; }
        }
    }
}