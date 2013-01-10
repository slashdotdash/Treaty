///<reference path='..\extensions\object.ts' />
///<reference path='.\rulesEngine.ts' />
///<reference path='.\comparison.ts' />
///<reference path='..\compilation\compiler.ts' />

///<reference path='..\..\typings\underscore-typed-1.4.d.ts' />
///<reference path='..\..\lib\Underscore.js\underscore.js' />

module Treaty {
    export module Rules {

        export interface IActivation extends IActivate {
            accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool;
        }

        export interface IRightActivation {
            id: number;

            rightActivate(context: Treaty.Rules.IActivationContext, callback: (next: Treaty.Rules.IActivationContext) => bool): void;

            accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool;
        }

        export interface INode {
            id: number;

            instanceType: Treaty.Type;

            successors: IActivation[];
            
            accept(visitor: Treaty.Compilation.IRuntimeVisitor): void;

            addActivation(activation: Treaty.Rules.IActivation): void;
        }

        export class AlphaNode implements INode, IActivation {
            public successors = new IActivation[];
            
            constructor (public id: number, public instanceType: Treaty.Type) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitAlphaNode(this, next => _.all(this.successors, (activation: IActivation) => activation.accept(next)));
            }

            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.successors.push(activation);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                context.access(this.id, memory => memory.activate(context));
                context.schedule(session => this.successors.forEach(successor => successor.activate(context)));
            }
        }

        export class PropertyNode implements INode, IActivation {
            public successors = new IActivation[];

            constructor (public id: number, public instanceType: Treaty.Type, public propertyType: Treaty.Type, public memberName: string) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitPropertyNode(this, next => _.all(this.successors, (activation: IActivation) => activation.accept(next)));
            }

            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.successors.push(activation);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                this.withValue(context, value => {
                    var activationToken = new Rules.ActivationToken(this.instanceType, Type.of(value), context, value);

                    var propertyContext = context.createContext('ActivationToken', activationToken);

                    _.each(this.successors, (activation: IActivation) => activation.activate(propertyContext));
                });
            }

            private withValue(context: Treaty.Rules.IActivationContext, callback: (value: any) => void ): void {
                var fact = ActivationFact.extract(context);

                if (fact.hasOwnProperty(this.memberName)) {
                    var value = fact[this.memberName];

                    if (value != null) {
                        callback(value);
                    }
                }
            }
        }

        export class ValueNode implements INode, IActivation {
            public successors = new IActivation[];
            
            constructor (public id: number, public instanceType: Treaty.Type, public value: any) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitValueNode(this, next => _.all(this.successors, (activation: IActivation) => activation.accept(next)));
            }

            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.successors.push(activation);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                _.each(this.successors, (activation: IActivation) => activation.activate(context));
            }
        }

        export class EqualNode implements IActivation {
            private values: ValueNode[] = [];

            constructor (public id: number, public type: Treaty.Type, public propertyType: Treaty.Type) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitEqualNode(this, next => _.all(this.values, (activation: IActivation) => activation.accept(next)));
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                var token = <Treaty.Rules.ActivationToken>context.fact;

                this.withValue(token.value, node => node.activate(context));
            }

            public findOrCreate(value: any, create: () => Rules.ValueNode): Rules.ValueNode {
                var node = this.find(value);

                if (node == undefined) {
                    node = create();
                    this.values.push(node);
                }

                return node;
            }

            private find(value: any): ValueNode {
                return <ValueNode>_.find(this.values, (valueNode: ValueNode) => valueNode.value == value);
            }

            private withValue(value: any, callback: (found: ValueNode) => void ): void {
                var found = this.find(value);
                if (found != undefined) {
                    callback(found);
                }
            }
        }

        export class NotEqualNode implements IActivation {
            private values: ValueNode[] = [];

            constructor (public id: number, public instanceType: Treaty.Type) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitNotEqualNode(this, next => _.all(this.values, (activation: IActivation) => activation.accept(next)));
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                var token = <Treaty.Rules.ActivationToken>context.fact;

                this.withoutValue(token.value, node => node.activate(context));
            }

            public findOrCreate(value: any, create: () => Rules.ValueNode): Rules.ValueNode {
                var node = this.find(value);

                if (node == undefined) {
                    node = create();
                    this.values.push(node);
                }

                return node;
            }

            private find(value: any): ValueNode {
                return <ValueNode>_.find(this.values, (valueNode: ValueNode) => valueNode.value == value);
            }

            private withoutValue(value: any, callback: (found: ValueNode) => void ): void {
                var notEqual = <ValueNode[]>_.reject(this.values, (valueNode: ValueNode) => valueNode.value == value);

                _.each(notEqual, (valueNode: ValueNode) => callback(valueNode));
            }
        }

        export class ExistsNode implements INode, IActivation {
            public successors = new IActivation[];
            
            constructor (public id: number, public instanceType: Treaty.Type) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitExistsNode(this, next => _.all(this.successors, (activation: IActivation) => activation.accept(next)));
            }

            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.successors.push(activation);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                var token = <Treaty.Rules.ActivationToken>context.fact;
                
                if (token.value.hasOwnProperty('length')) {
                    var length = token.value['length'];
                    if (length > 0) {
                        _.each(this.successors, (activation: IActivation) => activation.activate(context));
                    }
                }
            }
        }

        export class CompareNode implements INode, IActivation {
            public successors = new IActivation[];
            
            constructor (public id: number, public instanceType: Treaty.Type, public comparator: IComparator, public value: any) { }
            
            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitCompareNode(this, next => _.all(this.successors, (activation: IActivation) => activation.accept(next)));
            }

            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.successors.push(activation);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                var token = <Treaty.Rules.ActivationToken>context.fact;

                if (this.comparator.compare(token.value, this.value)) {
                    _.each(this.successors, (activation: IActivation) => activation.activate(context));
                }
            }
        }

        export class EachNode implements INode, IActivation {
            public successors = new IActivation[];
            
            constructor (public id: number, public instanceType: Treaty.Type, private elementMatch: (list: any[], callback: (item: any) => void) => void) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitEachNode(this, next => _.all(this.successors, (activation: IActivation) => activation.accept(next)));
            }

            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.successors.push(activation);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                var token = <Treaty.Rules.ActivationToken>context.fact;
                
                this.elementMatch(token.value, item => {
                    var activationToken = new Treaty.Rules.ActivationToken(context.instanceType, Type.of(item), context, item);
                    
                    var propertyContext = context.createContext('ActivationToken', activationToken);

                    _.each(this.successors, (activation: IActivation) => activation.activate(propertyContext));
                });
            }
        }

        export class JoinNode implements INode {
            public successors = new IActivation[];

            constructor (public id: number, public instanceType: Treaty.Type, public rightActivation: Rules.IRightActivation) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitJoinNode(this, next => this.rightActivation.accept(next) && _.all(this.successors, (activation: IActivation) => activation.accept(next)));
            }

            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.successors.push(activation);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                this.rightActivation.rightActivate(context, match => this.activateMatch(context));
            }

            public rightActivate(context: Treaty.Rules.IActivationContext, callback: (next: Treaty.Rules.IActivationContext) => bool): void {
                context.access(this.id, memory => memory.all(callback));
            }

            // TODO: Refactor this with AlphaNode impl.
            private activateMatch(context: Treaty.Rules.IActivationContext): void {
                context.access(this.id, memory => memory.activate(context));
                context.schedule(session => this.successors.forEach(successor => successor.activate(context)));
            }
        }

        export class LeftJoinNode implements INode, IActivation, IRightActivation {
            public successors = new IActivation[];

            constructor (public id: number, public instanceType: Treaty.Type, public discardType: Treaty.Type, public rightActivation: Rules.IRightActivation) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitLeftJoinNode(this, next => this.rightActivation.accept(next) && _.all(this.successors, (activation: IActivation) => activation.accept(next)));
            }

            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.successors.push(activation);
            }
            
            public activate(context: Treaty.Rules.IActivationContext): void {
                var activationToken = <Treaty.Rules.ActivationToken>context.fact;

                this.rightActivation.rightActivate(activationToken.context, match => this.activateMatch(activationToken.context));
            }

            public rightActivate(context: Treaty.Rules.IActivationContext, callback: (next: Treaty.Rules.IActivationContext) => bool): void {
                context.access(this.id, memory => memory.all(callback));
            }

            // TODO: Refactor this with AlphaNode impl.
            private activateMatch(context: Treaty.Rules.IActivationContext): void {
                context.access(this.id, memory => memory.activate(context));
                context.schedule(session => this.successors.forEach(successor => successor.activate(context)));
            }
        }

        export class OuterJoinNode implements Treaty.Rules.INode {
            public successors = new IActivation[];
            public instanceType: Treaty.Type = Type.create('Join');

            constructor (public id: number, public leftinstanceType: Treaty.Type, public rightinstanceType: Treaty.Type, public rightActivation: Rules.IRightActivation) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitOuterJoinNode(this, next => this.rightActivation.accept(next) && _.all(this.successors, (activation: IActivation) => activation.accept(next)));
            }

            public addActivation(activation: Treaty.Rules.IActivation): void {
                this.successors.push(activation);
            }
            
            public activate(context: Treaty.Rules.IActivationContext): void {
                this.rightActivation.rightActivate(context, right => {                    
                    var joinValue = new JoinedValue(ActivationFact.extract(context), right.fact);

                    var activationToken = new Rules.ActivationToken(this.instanceType, Type.of(joinValue), context, joinValue);
                    
                    var activationContext = context.createContext('ActivationToken', activationToken);

                    this.activateMatch(activationContext);
                });
            }

            // TODO: Refactor this with AlphaNode impl.
            private activateMatch(context: Treaty.Rules.IActivationContext): void {
                context.access(this.id, memory => memory.activate(context));
                context.schedule(session => this.successors.forEach(successor => successor.activate(context)));
            }
        }

        export class JoinedValue {
            constructor(public left: any, public right: any) { }
        }

        export class ConstantNode implements IRightActivation {
            constructor (public id: number, public instanceType: Treaty.Type) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitConstantNode(this, visitor => true);
            }

            public rightActivate(context: Treaty.Rules.IActivationContext, callback: (next: Treaty.Rules.IActivationContext) => bool): void {
                callback(context);
            }
        }

        export class DelegateProductionNode implements IActivation {
            constructor (public id: number, public instanceType: Treaty.Type, private callback: (instance) => void ) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitDelegateNode(this, next => true);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                context.schedule(session => {
                    var fact = ActivationFact.extract(context);

                    this.callback(fact);
                });
            }
        }

        export class AddFactNode implements IActivation {
            constructor (public id: number, public instanceType: Treaty.Type, public newFactType: Treaty.Type, private fact: (instance) => any ) { }

            public accept(visitor: Treaty.Compilation.IRuntimeVisitor): bool {
                return visitor.visitAddFactNode(this, next => true);
            }

            public activate(context: Treaty.Rules.IActivationContext): void {
                context.schedule(session => {
                    var fact = ActivationFact.extract(context);

                    var newFact = this.fact(fact);
                    
                    session.assert(Type.of(newFact), newFact);
                });
            }
        }
    }
}