///<reference path='..\..\..\typings\jasmine-1.2.d.ts' />

///<reference path='..\factory.ts' />
///<reference path='..\..\rules\rule.ts' />
///<reference path='..\..\rules\conditions\condition.ts' />
///<reference path='..\..\graphing\graphingVisitor.ts' />
///<reference path='..\..\graphing\exporter.ts' />

///<reference path='..\..\..\lib\TypeScript\compiler\' />
///<reference path='..\..\rules\' />
///<reference path='..\..\rules\conditions\' />
///<reference path='..\..\compilation\' />
///<reference path='..\..\graphing\' />
 
module Treaty {
    module Tests {
        module Conditions {
            class Person {
                constructor (public name: string) { }
            }

            describe("dot notation", () => {
                var subject: Treaty.Graphing.GraphingVisitor;
                var graph: Treaty.Graphing.RulesEngineGraph;

                beforeEach(() => {
                    var condition = Treaty.Rules.Conditions.Condition.equal('Person', (p: Person) => p.name, 'Bob');

                    var factory = new Treaty.Tests.Factory()
                        .withCondition(condition)
                        .withConsequence('Person', (p: Person) => console.log('consequence'))
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