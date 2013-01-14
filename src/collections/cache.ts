module Treaty {
    export module Collections {
        export class Cache {
            private items = {};

            public count: number = 0;

            public getItem(key: string, createWhenMissing: (k: string) => any): any {
                var item = this.items[key];

                if (item === undefined) {
                    item = createWhenMissing(key);
                    this.insert(key, item);
                }

                return item;
            }

            public insert(key: string, item: any): void {
                this.count++;
                this.items[key] = item;
            }

            public withMatching(key: string, callback: (found: any) => void ): bool {
                var item = this.items[key];

                if (item == undefined) return false;

                callback(item);
                return true;
            }

            public forEach(callback: (item: any) => void ): void {
                for (var key in this.items) {
                    if (this.items.hasOwnProperty(key)) {
                        callback(this.items[key]);
                    }
                }
            }
        }
    }
}