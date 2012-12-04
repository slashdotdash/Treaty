///<reference path='..\compilation\runtimeVisitor.ts' />
///<reference path='.\vertex.ts' />
///<reference path='.\edge.ts' />
///<reference path='.\rulesEngineGraph.ts' />

module Treaty {
    export module Graphing {

        export enum Shape {
            None = 0,
            Ellipse = 1,
            Circle = 2,
            DoubleCircle = 3,
        };

        export class Exporter {
            private output: string[] = []; 
            private vertices: DotVertex[] = [];

            constructor (private graph: RulesEngineGraph) {
                this.vertices = _.map(this.graph.vertices, (vertex: Vertex) => new DotVertex(vertex));
            }

            public toDotNotation(title: string): string {
                this.output = [];                 

                this.header(title);
                this.nodes('ellipse', _.select(this.vertices, (vertex: DotVertex) => vertex.is(Shape.Ellipse)));
                this.nodes('circle', _.select(this.vertices, (vertex: DotVertex) => vertex.is(Shape.Circle)));
                this.edges();
                this.footer();
                
                return this.output.join('\n');
            }

            private nodes(shape: string, vertices: Vertex[]): void {
                this.append('node [shape=' + shape + '];' + _.map(vertices, (vertex: DotVertex) => ' ' + vertex.identifier + ';').join(''));
            }

            private edges(): void {
                _.each(this.graph.edges, (edge: Edge) => {
                    var from = new DotVertex(edge.from);
                    var to = new DotVertex(edge.to);

                    this.append(from.identifier + ' -> ' + to.identifier);
                });
            }

            private header(title: string): void {
                this.append('digraph ' + title.replace(' ', '') + ' {');
            }

            private footer(): void {
                this.append('fontsize=12;');
                this.append('}');
            }

            private append(line: string): void {
                this.output.push(line);
            }
        }

        export class DotVertex {
            public identifier: string;

            constructor (private vertex: Vertex) {
                this.identifier = 'n' + vertex.vertexType.toString() + vertex.id.toString();
            }

            public shape(): Shape {
                switch (this.vertex.vertexType) {
                    case VertexType.RulesEngine:
                    case VertexType.AlphaNode:
                    case VertexType.JoinNode:
                    case VertexType.LeftJoinNode:
                    case VertexType.DelegateProductionNode:
                        return Shape.Ellipse;

                    case VertexType.ConstantNode:
                        return Shape.Circle;

                    default:
                        return Shape.Circle;
                }
            }

            public is(shape: Shape): bool {
                return shape == this.shape();
            }
        }
    }
}