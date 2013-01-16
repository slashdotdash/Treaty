///<reference path='..\compilation\runtimeVisitor.ts' />
///<reference path='.\vertex.ts' />
///<reference path='.\edge.ts' />
///<reference path='.\rulesEngineGraph.ts' />

module Treaty {
    export module Graphing {

        export class GraphingVisitor implements Treaty.Compilation.IRuntimeVisitor {
            private edges: Edge[] = [];
            private stack: Vertex[] = [];
            private vertices: Vertex[] = [];
            private current: Vertex;
            private rightActivation: Treaty.Rules.IRightActivation;
            private id = 0;
            
            public rulesEngineGraph(): RulesEngineGraph {
                return new RulesEngineGraph(this.vertices, this.edges);
            }

            public visit(runtime: Treaty.Rules.IRuntimeConfiguration, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(0, id => new Vertex(id, VertexType.RulesEngine, Type.objectType, 'Rules Engine'));

                return this.next(() => next(this));
            }

            public visitAlphaNode(node: Treaty.Rules.AlphaNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.AlphaNode, node.instanceType, node.instanceType.name));
                this.createEdge();

                return this.next(() => next(this));
            }

            public visitPropertyNode(node: Treaty.Rules.PropertyNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                var nodeType = node.instanceType;
                if (node.instanceType.isGenericType()) {
                    nodeType = node.instanceType.getGenericArguments()[0];
                }

                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.PropertyNode, node.instanceType, nodeType + '.' + node.memberName));
                this.createEdge();

                return this.next(() => next(this));                
            }

            public visitEqualNode(node: Treaty.Rules.EqualNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                //this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.EqualNode, node.instanceType, '=='));
                //this.createEdge();

                return this.next(() => next(this));
            }

            public visitNotEqualNode(node: Treaty.Rules.NotEqualNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.NotEqualNode, node.instanceType, '!='));
                this.createEdge();

                return this.next(() => next(this));
            }

            public visitExistsNode(node: Treaty.Rules.ExistsNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.ExistsNode, node.instanceType, 'exists'));
                this.createEdge();

                return this.next(() => next(this));
            }

            public visitValueNode(node: Treaty.Rules.ValueNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.ValueNode, node.instanceType, '== ' + this.getNodeValue(node)));
                this.createEdge();

                return this.next(() => next(this));
            }

            private getNodeValue(node: Treaty.Rules.ValueNode): string {
                var value = node.value;

                if (value instanceof Number) {
                    return value;
                }

                if (value instanceof String) {
                    return '\\"' + value + '\\"'
                }

                return Treaty.Type.of(value).toString();
            }

            public visitCompareNode(node: Treaty.Rules.CompareNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.CompareNode, node.instanceType, node.comparator.toString() + ' ' + node.value));
                this.createEdge();

                return this.next(() => next(this));
            }

            public visitEachNode(node: Treaty.Rules.EachNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.EachNode, node.instanceType, '[n]'));
                this.createEdge();

                return this.next(() => next(this));
            }

            public visitJoinNode(node: Treaty.Rules.JoinNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.JoinNode, node.instanceType, 'Join Node'));
                
                if (this.rightActivationEquals(node.id)) {
                    this.edges.push(new Edge(this.current, this.stack[this.stack.length - 1], this.current.targetType.name));
                } else {
                    this.createEdge();
                }

                return this.nextJoin(node.rightActivation, () => next(this));
            }

            public visitLeftJoinNode(node: Treaty.Rules.LeftJoinNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.LeftJoinNode, node.instanceType, node.instanceType.name));
                
                if (this.rightActivationEquals(node.id)) {
                    this.edges.push(new Edge(this.current, this.stack[this.stack.length - 1], this.current.targetType.name));
                } else {
                    this.createEdge();
                }

                return this.nextJoin(node.rightActivation, () => next(this));
            }

            public visitOuterJoinNode(node: Treaty.Rules.OuterJoinNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.OuterJoinNode, node.instanceType, node.instanceType.name));
                
                if (this.rightActivationEquals(node.id)) {
                    this.edges.push(new Edge(this.current, this.stack[this.stack.length - 1], this.current.targetType.name));
                } else {
                    this.createEdge();
                }

                return this.nextJoin(node.rightActivation, () => next(this));
            }

            public visitConstantNode(node: Treaty.Rules.ConstantNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.ConstantNode, Type.create('Constant'), ''));
                
                if (this.stack.length > 0 && this.rightActivationEquals(node.id)) {
                    this.edges.push(new Edge(this.current, this.stack[this.stack.length - 1], this.current.targetType.name));
                }

                return this.next(() => next(this));
            }

            public visitDelegateNode(node: Treaty.Rules.DelegateProductionNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.DelegateProductionNode, node.instanceType, node.instanceType.name));
                this.createEdge();

                return this.next(() => next(this));
            }
            
            public visitAddFactNode(node: Treaty.Rules.AddFactNode, next: (visitor: Treaty.Compilation.IRuntimeVisitor) => bool): bool {
                this.current = this.getVertex(node.id, id => new Vertex(id, VertexType.AddFactNode, node.instanceType, node.instanceType + '=> ' + node.newFactType));
                this.createEdge();

                return this.next(() => next(this));
            }

            private getVertex(id: number, factory: (newId: number) => Vertex): Vertex {
                return _.find(this.vertices, (vertex: Vertex) => vertex.id == id) || this.createVertex(id, factory);
            }

            private createVertex(id: number, factory: (newId: number) => Vertex): Vertex {
                var vertex = factory(id);
                this.vertices.push(vertex);
                return vertex;
            }

            private createEdge(): void {
                if (this.stack.length > 0) {
                    this.edges.push(new Edge(this.stack[this.stack.length - 1], this.current, this.current.targetType.name));
                }
            }

            private rightActivationEquals(id: number): bool {
                return this.rightActivation != null && this.rightActivation.id == id;
            }

            private next(callback: () => bool): bool {
                if (this.current != null) {
                    this.stack.push(this.current);
                    
                    var result = callback();
                    
                    this.stack.pop();

                    return result;
                }

                return callback();
            }
            
            private nextJoin(rightActivation: Treaty.Rules.IRightActivation, callback: () => bool): bool {
                if (this.current != null) {
                    var previous = this.rightActivation;
                    this.rightActivation = rightActivation;

                    var result = this.next(callback);
                    
                    this.rightActivation = previous;

                    return result;
                }

                return callback();
            }            
        }
    }
}