module Treaty {
    export module Graphing {

        export enum VertexType {
            None = 0,
            RulesEngine = 1,
            AlphaNode = 2,
            PropertyNode = 3,
            EqualNode = 4,
            NotEqualNode = 5,
            ExistsNode = 6,
            ValueNode = 7,
            CompareNode = 8,
            EachNode = 9,
            JoinNode = 10,
            LeftJoinNode = 11,
            ConstantNode = 12,
            DelegateProductionNode = 13,
            AddFactNode = 14,
        }

        export class Vertex {
            constructor (public id: number, public vertexType: VertexType, public targetType: string, public title: string) { }
        }
    }
}