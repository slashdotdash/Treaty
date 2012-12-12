///<reference path='.\compiler.ts' />
///<reference path='..\rules\rule.ts' />
///<reference path='..\rules\rulesEngine.ts' />
///<reference path='..\rules\comparison.ts' />
///<reference path='..\rules\conditions\condition.ts' />

module Treaty {
    export module Compilation {

        export interface IRuntimeVisitor {
            visit(runtime: Treaty.Rules.IRuntimeConfiguration, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitAlphaNode(node: Treaty.Rules.AlphaNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitPropertyNode(node: Treaty.Rules.PropertyNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitEqualNode(node: Treaty.Rules.EqualNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitNotEqualNode(node: Treaty.Rules.NotEqualNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitExistsNode(node: Treaty.Rules.ExistsNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitValueNode(node: Treaty.Rules.ValueNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitCompareNode(node: Treaty.Rules.CompareNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitEachNode(node: Treaty.Rules.EachNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitJoinNode(node: Treaty.Rules.JoinNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitLeftJoinNode(node: Treaty.Rules.LeftJoinNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitOuterJoinNode(node: Treaty.Rules.OuterJoinNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitConstantNode(node: Treaty.Rules.ConstantNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitDelegateNode(node: Treaty.Rules.DelegateProductionNode, next: (visitor: IRuntimeVisitor) => bool): bool;

            visitAddFactNode(node: Treaty.Rules.AddFactNode, next: (visitor: IRuntimeVisitor) => bool): bool;
        }

        export class RuntimeVisitor implements IRuntimeVisitor {
            public visit(runtime: Treaty.Rules.IRuntimeConfiguration, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitAlphaNode(node: Treaty.Rules.AlphaNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitPropertyNode(node: Treaty.Rules.PropertyNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitEqualNode(node: Treaty.Rules.EqualNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitNotEqualNode(node: Treaty.Rules.NotEqualNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitExistsNode(node: Treaty.Rules.ExistsNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitValueNode(node: Treaty.Rules.ValueNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitCompareNode(node: Treaty.Rules.CompareNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitEachNode(node: Treaty.Rules.EachNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitJoinNode(node: Treaty.Rules.JoinNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitLeftJoinNode(node: Treaty.Rules.LeftJoinNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitOuterJoinNode(node: Treaty.Rules.OuterJoinNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitConstantNode(node: Treaty.Rules.ConstantNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitDelegateNode(node: Treaty.Rules.DelegateProductionNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }

            public visitAddFactNode(node: Treaty.Rules.AddFactNode, next: (visitor: IRuntimeVisitor) => bool): bool {
                return next(this);
            }
        }
    }
}