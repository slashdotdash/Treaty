///<reference path='.\rulesEngine.ts' />
///<reference path='..\compilation\compiler.ts' />

///<reference path='..\..\typings\underscore-typed-1.4.d.ts' />
///<reference path='..\..\lib\Underscore.js\underscore.js' />

module Treaty {
    export module Rules {

        export interface IComparator {
            compare(left: any, right: any): bool;
        }

        export class GreaterThanValueComparator implements IComparator {
            public compare(left: any, right: any): bool {
                return left > right;
            }
        }

        export class GreaterThanOrEqualValueComparator implements IComparator {
            public compare(left: any, right: any): bool {
                return left >= right;
            }
        }

        export class LessThanValueComparator implements IComparator {
            public compare(left: any, right: any): bool {
                return left < right;
            }
        }

        export class LessThanOrEqualValueComparator implements IComparator {
            public compare(left: any, right: any): bool {
                return left <= right;
            }
        }
    }
}