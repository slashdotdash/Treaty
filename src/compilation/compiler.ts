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
                var nodeSelectorFactory = this.getNodeSelectorFactory(condition);

                this.compile(condition.instanceType, condition.memberExpression, condition.valueType, nodeSelectorFactory);

                return true;
            }

            public visitOrCondition(condition: Treaty.Rules.Conditions.OrCondition): bool {
                var instanceType = condition.instanceType;

                var leftNodeSelectorFactory = this.getNodeSelectorFactory(condition.leftCondition);
                var rightNodeSelectorFactory = this.getNodeSelectorFactory(condition.rightCondition);

                var conditionFactory = new NodeSelectorFactory(type => new ConditionAlphaNodeSelector(type, node => this.alphaNodes.push(new OrRuleNodeSelector(node)), this.runtime));
                var alphaFactory = new NodeSelectorFactory(type => new AlphaNodeSelector(conditionFactory.create(type), instanceType, this.runtime));

                new PropertyExpressionVisitor(instanceType, leftNodeSelectorFactory(alphaFactory), this.runtime)
                    .createSelector(condition.leftCondition.memberExpression.body, condition.leftCondition.valueType)
                    .select();

                new PropertyExpressionVisitor(instanceType, rightNodeSelectorFactory(alphaFactory), this.runtime)
                    .createSelector(condition.rightCondition.memberExpression.body, condition.rightCondition.valueType)
                    .select();

                return true;
            }

            public visitConsequence(consequence: Treaty.Rules.IConsequence): bool { return true; }

            public matchJoinNode(instanceType: Treaty.Type, callback: (node: Treaty.Rules.INode) => void): bool {
                if (this.alphaNodes.length == 0) 
                    return false;

                if (instanceType.isGenericType()) {
                    if (instanceType.getGenericTypeDefinition() == 'Tuple<,>') {
                        var typeArgs = instanceType.getGenericArguments();

                        var tupleSelector = new TupleNodeSelector(typeArgs[0], typeArgs[1], this, this.runtime);
                    
                        return tupleSelector.select(instanceType, callback);
                    }
                }

                var left: Rules.INode = null;
                var right: Rules.INode = null;

                var visited = new ISelectRuleNode[];

                _.each(this.alphaNodes, (alpha: ISelectRuleNode) => {
                    if (_.contains(visited, alpha)) return;
                    
                    // Or conditions are joined for each occurence 
                    if (alpha instanceof OrRuleNodeSelector) {
                        alpha.select(instanceType, node => {
                            visited.push(alpha);

                            callback(node);
                        });

                        return;
                    }

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
                        this.runtime.matchJoinNodeOne(instanceType, left, join => left = join);
                    }

                    callback(left);
                }

                return true;
            }

            private getNodeSelectorFactory(condition: Treaty.Rules.Conditions.IPropertyCondition): (factory: INodeSelectorFactory) => INodeSelectorFactory {
                if (condition instanceof Treaty.Rules.Conditions.PropertyEqualCondition) {
                    var equalCondition = <Treaty.Rules.Conditions.PropertyEqualCondition>condition;

                    return next => new NodeSelectorFactory(type => EqualNodeSelector.create(type, next, equalCondition.value, equalCondition.valueType, this.runtime));
                }
                
                if (condition instanceof Treaty.Rules.Conditions.PropertyNotEqualCondition) {
                    var notEqualCondition = <Treaty.Rules.Conditions.PropertyNotEqualCondition>condition;

                    return next => new NodeSelectorFactory(type => new NotEqualNodeSelector(next.create(type), notEqualCondition.value, this.runtime));
                }
                
                if (condition instanceof Treaty.Rules.Conditions.PropertyExistsCondition) {
                    var existsCondition = <Treaty.Rules.Conditions.PropertyExistsCondition>condition;

                    return next => new NodeSelectorFactory(type => new ExistsNodeSelector(next.create(type), this.runtime));
                }
                
                if (condition instanceof Treaty.Rules.Conditions.PropertyGreaterThanCondition) {
                    var gtCondition = <Treaty.Rules.Conditions.PropertyGreaterThanCondition>condition;
                    var gtComparator = new Treaty.Rules.GreaterThanValueComparator();

                    return next => new NodeSelectorFactory(type => new CompareNodeSelector(next.create(type), gtComparator, gtCondition.value, this.runtime));
                }
                
                if (condition instanceof Treaty.Rules.Conditions.PropertyGreaterThanOrEqualCondition) {
                    var geCondition = <Treaty.Rules.Conditions.PropertyGreaterThanOrEqualCondition>condition;
                    var geComparator = new Treaty.Rules.GreaterThanOrEqualValueComparator();

                    return next => new NodeSelectorFactory(type => new CompareNodeSelector(next.create(type), geComparator, geCondition.value, this.runtime));
                }
                
                if (condition instanceof Treaty.Rules.Conditions.PropertyLessThanCondition) {
                    var ltCondition = <Treaty.Rules.Conditions.PropertyLessThanCondition>condition;
                    var ltComparator = new Treaty.Rules.LessThanValueComparator();

                    return next => new NodeSelectorFactory(type => new CompareNodeSelector(next.create(type), ltComparator, ltCondition.value, this.runtime));
                }
                
                if (condition instanceof Treaty.Rules.Conditions.PropertyLessThanOrEqualCondition) {
                    var leCondition = <Treaty.Rules.Conditions.PropertyLessThanOrEqualCondition>condition;
                    var leComparator = new Treaty.Rules.LessThanOrEqualValueComparator();

                    return next => new NodeSelectorFactory(type => new CompareNodeSelector(next.create(type), leComparator, leCondition.value, this.runtime));
                }
                
                if (condition instanceof Treaty.Rules.Conditions.PropertyEachCondition) {
                    var eachCondition = <Treaty.Rules.Conditions.PropertyEachCondition>condition;
                    return next => new NodeSelectorFactory(type => new EachNodeSelector(next.create(type), eachCondition.instanceType, eachCondition.valueType, this.runtime));
                }

                throw 'Not Supported';
            }

            private compile(instanceType: Treaty.Type, memberExpression: Treaty.Compilation.Expression, propertyType: Treaty.Type, selectorFactory: (factory: INodeSelectorFactory) => INodeSelectorFactory): void {
                var conditionFactory = new NodeSelectorFactory(type => new ConditionAlphaNodeSelector(type, node => this.alphaNodes.push(node), this.runtime));
                var alphaFactory = new NodeSelectorFactory(type => new AlphaNodeSelector(conditionFactory.create(type), type, this.runtime));
                var nodeFactory = selectorFactory(alphaFactory);

                new PropertyExpressionVisitor(instanceType, nodeFactory, this.runtime)
                    .createSelector(memberExpression.body, propertyType)
                    .select();
            }
        }

        export class GenericType {
            public isGeneric: bool = false;
            public instanceTypes: Treaty.Type[] = [];

            constructor(private instanceType: Treaty.Type) {
                _.each(instanceType.name.split('|'), (typeName: string) => this.instanceTypes.push(Type.create(typeName)));

                this.isGeneric = this.instanceTypes.length > 1;
            }
        }

        export class PropertyExpressionVisitor {
            private nodeSelector: ISelectNode;

            constructor (private instanceType: Treaty.Type, private nodeFactory: INodeSelectorFactory, private runtime: Treaty.Rules.IRuntimeConfiguration) { }

            public createSelector(expression: TypeScript.AST, propertyType: Treaty.Type): ISelectNode {
                if (expression instanceof TypeScript.Identifier) {
                    this.visitParameter(<TypeScript.Identifier>expression);
                } else if (expression instanceof TypeScript.BinaryExpression) {
                    this.visitBinary(<TypeScript.BinaryExpression>expression, propertyType);
                } else {
                    console.log('Expression type "' + Type.of(expression) + '" not yet supported.');
                }

                return this.nodeSelector;
            }

            private visitParameter(parameter: TypeScript.Identifier): void {
                this.nodeSelector = new TypeNodeSelector(this.nodeFactory.create(this.instanceType), this.instanceType, this.runtime);
            }

            private visitBinary(binaryExpr: TypeScript.BinaryExpression, propertyType: Treaty.Type): void {
                var identifier = <TypeScript.Identifier>binaryExpr.operand2;

                var propertyNodeFactory = new NodeSelectorFactory(type => {
                    var tokenType = Treaty.Type.generic('Token', type, propertyType);

                    return new PropertyNodeSelector(this.nodeFactory.create(tokenType), type, propertyType, identifier.text, this.runtime);
                });

                var visitor = new PropertyExpressionVisitor(this.instanceType, propertyNodeFactory, this.runtime);
                
                this.nodeSelector = visitor.createSelector(binaryExpr.operand1, propertyType);
            }
        }

        export class ConsequenceCompiler implements Treaty.Rules.IVisitor {
            constructor(private runtime: Treaty.Rules.IRuntimeConfiguration, private conditionCompiler: ConditionCompiler) { }

            public visitRule(rule: Rules.Rule, next: (visitor: Treaty.Rules.IVisitor) => bool): bool { return true; }

            public visitCondition(condition: Rules.Conditions.PropertyEqualCondition): bool { return true; }

            public visitOrCondition(condition: Treaty.Rules.Conditions.OrCondition): bool { return true; }

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
                    var node = <Treaty.Rules.AddFactNode>this.runtime.createNode(id => new Treaty.Rules.AddFactNode(id, consequence.instanceType, consequence.newFactType, consequence.fact));

                    joinNode.addActivation(node);
                });

                return true;
            }
        }
    }
}