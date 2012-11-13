module Treaty {
    export module Collections {
        export class Cache {
            private items = {};
            public count: number = 0;

            public getItem(key: string, createWhenMissing: (k: string) => any): any {
                var item = this.items[key];

                if (item == undefined) {
                    item = createWhenMissing(key);
                    this.count++;
                    this.items[key] = item;
                }

                return item;
            }
        }
    }
}