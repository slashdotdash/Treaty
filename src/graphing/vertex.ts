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
            OuterJoinNode = 12,
            ConstantNode = 13,
            DelegateProductionNode = 14,
            AddFactNode = 15,
        }

        export class Vertex {
            constructor (public id: number, public vertexType: VertexType, public targetType: Type, public title: string) { }
        }
    }
}