///<reference path='..\references.ts' />

module Treaty {
    export module Graphing {

        export class Edge {
            constructor (public from: Vertex, public to: Vertex, public title: string) { }
        }
    }
}