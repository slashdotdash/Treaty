///<reference path='.\vertex.ts' />
///<reference path='.\edge.ts' />

module Treaty {
    export module Graphing {

        export class RulesEngineGraph {
            constructor (public vertices: Vertex[], public edges: Edge[]) { }
        }
    }
}