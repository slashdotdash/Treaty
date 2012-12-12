///<reference path='.\selectors.ts' />
///<reference path='..\rules\nodes.ts' />
///<reference path='..\rules\rule.ts' />
///<reference path='..\rules\rulesEngine.ts' />
///<reference path='..\rules\comparison.ts' />
///<reference path='..\rules\conditions\condition.ts' />
///<reference path='..\rules\consequences\consequence.ts' />

module Treaty {
    export module Compilation {
        export class RuleCompiler {
            constructor (private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public visitRule(rule: Treaty.Rules.Rule, next: (visitor: Rules.IVisitor) => bool): bool { return true; }

            public compile(rule: Treaty.Rules.Rule): void {
                var conditionCompiler = new ConditionCompiler(this.runtime);
                
                rule.conditions.forEach(condition => {
                    condition.accept(conditionCompiler);
                });
                
                var consequenceCompiler = new ConsequenceCompiler(this.runtime, conditionCompiler);

                rule.consequences.forEach(consequence => {
                    consequence.accept(consequenceCompiler);
                });
            }
        }

        export class ConditionCompiler implements Treaty.Rules.IVisitor {
            private alphaNodes = new ISelectRuleNode[];

            constructor (private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public visitRule(rule: Treaty.Rules.Rule, next: (visitor: Treaty.Rules.IVisitor) => bool): bool { return true; }
            
            public visitCondition(condition: Treaty.Rules.Conditions.IPropertyCondition): bool {
                if (condition instanceof Treaty.Rules.Conditions.PropertyEqualCondition) {
                    var equalCondition = <Treaty.Rules.Conditions.PropertyEqualCondition>condition;
                    this.compile(condition.instanceType, condition.memberExpression, next => new NodeSelectorFactory(() => new EqualNodeSelector(next.create(), equalCondition.value, this.runtime)));
                }

                if (condition instanceof Treaty.Rules.Conditions.PropertyNotEqualCondition) {
                    var notEqualCondition = <Treaty.Rules.Conditions.PropertyNotEqualCondition>condition;
                    this.compile(condition.instanceType, condition.memberExpression, next => new NodeSelectorFactory(() => new NotEqualNodeSelector(next.create(), notEqualCondition.value, this.runtime)));
                }

                if (condition instanceof Treaty.Rules.Conditions.PropertyExistsCondition) {
                    var existsCondition = <Treaty.Rules.Conditions.PropertyExistsCondition>condition;
                    this.compile(condition.instanceType, condition.memberExpression, next => new NodeSelectorFactory(() => new ExistsNodeSelector(next.create(), this.runtime)));
                }

                if (condition instanceof Treaty.Rules.Conditions.PropertyGreaterThanCondition) {
                    var greaterThanCondition = <Treaty.Rules.Conditions.PropertyGreaterThanCondition>condition;
                    var comparator = new Treaty.Rules.GreaterThanValueComparator();
                    this.compile(condition.instanceType, condition.memberExpression, next => new NodeSelectorFactory(() => new CompareNodeSelector(next.create(), comparator, greaterThanCondition.value, this.runtime)));
                }

                if (condition instanceof Treaty.Rules.Conditions.PropertyGreaterThanOrEqualCondition) {
                    var greaterThanCondition = <Treaty.Rules.Conditions.PropertyGreaterThanOrEqualCondition>condition;
                    var comparator = new Treaty.Rules.GreaterThanOrEqualValueComparator();
                    this.compile(condition.instanceType, condition.memberExpression, next => new NodeSelectorFactory(() => new CompareNodeSelector(next.create(), comparator, greaterThanCondition.value, this.runtime)));
                }

                if (condition instanceof Treaty.Rules.Conditions.PropertyLessThanCondition) {
                    var greaterThanCondition = <Treaty.Rules.Conditions.PropertyLessThanCondition>condition;
                    var comparator = new Treaty.Rules.LessThanValueComparator();
                    this.compile(condition.instanceType, condition.memberExpression, next => new NodeSelectorFactory(() => new CompareNodeSelector(next.create(), comparator, greaterThanCondition.value, this.runtime)));
                }

                if (condition instanceof Treaty.Rules.Conditions.PropertyLessThanOrEqualCondition) {
                    var greaterThanCondition = <Treaty.Rules.Conditions.PropertyLessThanOrEqualCondition>condition;
                    var comparator = new Treaty.Rules.LessThanOrEqualValueComparator();
                    this.compile(condition.instanceType, condition.memberExpression, next => new NodeSelectorFactory(() => new CompareNodeSelector(next.create(), comparator, greaterThanCondition.value, this.runtime)));
                }

                if (condition instanceof Treaty.Rules.Conditions.PropertyEachCondition) {
                    var existsCondition = <Treaty.Rules.Conditions.PropertyEachCondition>condition;
                    this.compile(condition.instanceType, condition.memberExpression, next => new NodeSelectorFactory(() => new EachNodeSelector(next.create(), this.runtime)));
                }

                return true;
            }

            public visitConsequence(consequence: Treaty.Rules.IConsequence): bool { return true; }

            public matchJoinNode(instanceType: string, callback: (node: Treaty.Rules.INode) => void): bool {
                if (this.alphaNodes.length == 0) 
                    return false;

                var joinType = new GenericType(instanceType);
                if (joinType.isGeneric) {
                    var tupleSelector = new TupleNodeSelector(joinType.instanceTypes[1], joinType.instanceTypes[2], this, this.runtime);
                    
                    return tupleSelector.select(joinType.instanceTypes[0], callback);
                }

                var left: Rules.INode = null;
                var right: Rules.INode = null;

                var visited = new ISelectRuleNode[];

                _.each(this.alphaNodes, (alpha: ISelectRuleNode) => {
                    if (_.contains(visited, alpha)) return;
                    
                    alpha.select(instanceType, node => {
                        left = node;
                        visited.push(alpha);

                        var remaining = _.reject(this.alphaNodes, (beta: ISelectRuleNode) => _.contains(visited, beta));

                        _.each(remaining, (beta: ISelectRuleNode) => {
                            if (_.contains(visited, beta)) return;

                            beta.select(instanceType, right => {
                                visited.push(beta);

                                this.runtime.matchJoinNodeTwo(left, right, join => left = join);
                            });
                        });
                    });
                });
                
                if (left != null) {
                    if (left instanceof Treaty.Rules.AlphaNode) {
                        this.runtime.matchJoinNodeOne(left, join => left = join);
                    }

                    callback(left);
                }

                return true;
            }

            private compile(instanceType: string, memberExpression: TypeScript.AST, selectorFactory: (factory: INodeSelectorFactory) => INodeSelectorFactory): void {
                var conditionFactory = new NodeSelectorFactory(() => new ConditionAlphaNodeSelector(instanceType, node => this.alphaNodes.push(node), this.runtime));
                var alphaFactory = new NodeSelectorFactory(() => new AlphaNodeSelector(conditionFactory.create(), instanceType, this.runtime));
                var nodeFactory = selectorFactory(alphaFactory);

                new PropertyExpressionVisitor(instanceType, nodeFactory, this.runtime)
                    .createSelector(memberExpression)
                    .select();
            }
        }

        export class GenericType {
            public isGeneric: bool = false;
            public instanceTypes: string[] = [];

            constructor(private instanceType: string) {
                this.instanceTypes = instanceType.split('|');
                this.isGeneric = this.instanceTypes.length > 1;
            }
        }

        export class PropertyExpressionVisitor {
            private nodeSelector: ISelectNode;

            constructor (private instanceType: string, private nodeFactory: INodeSelectorFactory, private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public createSelector(expression: TypeScript.AST): ISelectNode {
                if (expression instanceof TypeScript.Identifier) {
                    this.visitParameter(<TypeScript.Identifier>expression);
                } else if (expression instanceof TypeScript.BinaryExpression) {
                    this.visitBinary(<TypeScript.BinaryExpression>expression);
                } else {
                    console.log('Expression type "' + TypeDescriptor.toType(expression) + '" not yet supported.');
                }

                return this.nodeSelector;
            }

            private visitParameter(parameter: TypeScript.Identifier): void {
                this.nodeSelector = new TypeNodeSelector(this.nodeFactory.create(), this.instanceType, this.runtime);
            }

            private visitBinary(binaryExpr: TypeScript.BinaryExpression): void {
                var identifier = <TypeScript.Identifier>binaryExpr.operand2;

                var propertyNodeFactory = new NodeSelectorFactory(() => new PropertyNodeSelector(this.nodeFactory.create(), this.instanceType, identifier.text, this.runtime));
                var visitor = new PropertyExpressionVisitor(this.instanceType, propertyNodeFactory, this.runtime);
                
                this.nodeSelector = visitor.createSelector(binaryExpr.operand1);
            }
        }

        export class ConsequenceCompiler implements Rules.IVisitor {
            constructor(private runtime: Treaty.Rules.IRuntimeConfiguration, private conditionCompiler: ConditionCompiler) { }

            public visitRule(rule: Rules.Rule, next: (visitor: Rules.IVisitor) => bool): bool { return true; }

            public visitCondition(condition: Rules.Conditions.PropertyEqualCondition): bool { return true; }

            public visitConsequence(consequence: Treaty.Rules.IConsequence): bool {
                if (consequence instanceof Treaty.Rules.Consequences.DelegateConsequence) {
                    this.visitDelegateConsequence(<Treaty.Rules.Consequences.DelegateConsequence>consequence);
                }

                if (consequence instanceof Treaty.Rules.Consequences.AddFactConsequence) {
                    this.visitAddFactConsequence(<Treaty.Rules.Consequences.AddFactConsequence>consequence);
                } 

                return true;
            }

            private visitDelegateConsequence(consequence: Treaty.Rules.Consequences.DelegateConsequence): bool {
                this.conditionCompiler.matchJoinNode(consequence.instanceType, joinNode => {
                    var node = <Treaty.Rules.DelegateProductionNode>this.runtime.createNode(id => new Treaty.Rules.DelegateProductionNode(id, consequence.instanceType, consequence.callback));

                    joinNode.addActivation(node);
                });
                
                return true;
            }

            private visitAddFactConsequence(consequence: Treaty.Rules.Consequences.AddFactConsequence): bool {
                this.conditionCompiler.matchJoinNode(consequence.instanceType, joinNode => {
                    var node = <Treaty.Rules.AddFactNode>this.runtime.createNode(id => new Treaty.Rules.AddFactNode(id, consequence.instanceType, consequence.fact));

                    joinNode.addActivation(node);
                });

                return true;
            }
        }
    }
}