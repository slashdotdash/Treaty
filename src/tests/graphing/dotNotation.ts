///<reference path='..\testReferences.ts' />
 
module Treaty {
    module Tests {
        module Conditions {
            class Person {
                constructor (public name: string, public age: number) { }
            }

            describe("dot notation", () => {
                var subject: Treaty.Graphing.GraphingVisitor;
                var graph: Treaty.Graphing.RulesEngineGraph;

                beforeEach(() => {
                    var consequence = (p: Person) => console.log('consequence');

                    var factory = new Treaty.Tests.Factory()
                        .rule(rule => rule
                            .withCondition(Treaty.Rules.Conditions.Condition.equal('Person', (p: Person) => p.name, 'Bob'))
                            .withConsequence('Person', consequence))
                        .rule(rule => rule
                            .withCondition(Treaty.Rules.Conditions.Condition.notEqual('Person', (p: Person) => p.name, 'Bob'))
                            .withConsequence('Person', consequence))
                        .rule(rule => rule
                            .withCondition(Treaty.Rules.Conditions.Condition.lessThanOrEqual('Person', (p: Person) => p.age, 21))
                            .withConsequence('Person', consequence))
                        .buildRulesEngine();

                    subject = new Treaty.Graphing.GraphingVisitor();                    
                    factory.rulesEngine.accept(subject);

                    graph = subject.rulesEngineGraph();
                });
                
                it("should generate graph with edges", () => {
                    expect(graph.edges.length).toBeGreaterThan(0);
                });

                it("should generate graph with vertices", () => {
                    expect(graph.vertices.length).toBeGreaterThan(0);
                });

                describe("exporting", () => {
                    var dotNotation: string;
                    
                    beforeEach(() => {
                        dotNotation = new Treaty.Graphing.Exporter(graph).toDotNotation('Test');
                        console.log(dotNotation);
                    });

                    it("should generate dot notation file", () => {
                        expect(dotNotation).toNotBe('');
                    });
                });
            });
        }
    }
}