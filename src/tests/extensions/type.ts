///<reference path='..\..\..\typings\jasmine-1.2.d.ts' />

///<reference path='..\..\extensions\object.ts' />

module Treaty {
    module Tests {
        module Extensions {
            class Example { }

            class Other { }

            describe("types", () => {
                
                describe("default types", () => {
                    it("should create an existing type for strings", () => {
                        expect(Treaty.Type.create('String')).toBe(Treaty.Type.stringType);
                    });

                    it("should return correct type for string value", () => {
                        expect(Treaty.Type.of('')).toBe(Treaty.Type.stringType);
                    });
                });

                describe("custom types", () => {
                    var exampleType: Treaty.Type;

                    beforeEach(() => {
                        exampleType = Treaty.Type.create('Example');
                    });

                    it("should create an new type for user defined class", () => {
                        expect(exampleType.name).toBe('Example');
                    });

                    it("should return correct type for example instance value", () => {
                        expect(Treaty.Type.of(new Example())).toBe(exampleType);
                    });

                    it("should return exactly the same type instance on subsequent requests", () => {
                        expect(Treaty.Type.create('Example')).toBe(exampleType);
                        expect(Treaty.Type.create('Example')).toEqual(exampleType);
                    });
                });
            });
        }
    }
}