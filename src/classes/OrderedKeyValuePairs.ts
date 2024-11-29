export type KeyValueValues = string | string[] | (string | string[]);

export type KeyValuePair<T extends KeyValueValues = string> = { key: string; value?: T };

type KeyValueOrOrdered<T extends KeyValueValues> = KeyValuePair<T>[] | OrderedKeyValuePairs<T>;

export class OrderedKeyValuePairs<T extends KeyValueValues = string> implements Iterable<[number, KeyValuePair<T>]> {
	private map: Record<string, T | undefined> = {};
	private order: string[] = [];

	constructor(...args: (KeyValueOrOrdered<T> | undefined)[]) {
		console.log({ args });
		args.forEach(this.apply);
	}

	public apply(pairs: KeyValueOrOrdered<T> | undefined) {
		if (pairs == null) return;
		if ('toArray' in pairs) {
			console.log('this is not a an ordered key value pair');
			pairs = pairs.toArray();
		}
		console.log('got to the forEach of apply w/ pairs', pairs);
		pairs.forEach(({ key, value }) => this.set(key, value));
	}

	public get(key: string) {
		return this.map[key];
	}

	public findIndexOf(key: string) {
		return this.order.findIndex((k) => k === key);
	}

	public set(key: string, value?: T) {
		console.log(`tryna set w/ ${key}, ${value}`);
		const oldValue = this.map[key];
		if (oldValue == null) {
			this.order.push(key);
		}
		this.map[key] = value;
		console.log(`finished setting w/ ${key}, ${value}`);
	}

	public deleteByIndex(index: number) {
		if (index > 0) {
			delete this.map[this.order[index]];
			this.order.splice(index, 1);
		}
	}

	public delete(key: string) {
		const index = this.order.findIndex((value) => value === key);
		this.deleteByIndex(index);
	}

	private toKeyValuePair(key: string): KeyValuePair<T> {
		console.log('entered toKeyValuePair for key ' + key + ' and map', this.map);
		return { key, value: this.map[key] };
	}

	public count() {
		return this.order.length;
	}

	public toArray() {
		console.log('entered toArray for OrderedKeyValuePair', this.order);
		return this.order.map(this.toKeyValuePair);
	}

	public toTableData() {
		return this.order.map((key, index) => ({ ...this.toKeyValuePair(key), id: index }));
	}

	public keys() {
		return this.order.slice();
	}

	public toObject() {
		const obj: Record<string, T> = {};
		this.order.forEach((key) => (obj[key] = this.map[key] as T));
		return obj;
	}

	[Symbol.iterator] = () => this.toArray().entries();

	public toJSON() {
		return this.toArray().toString();
	}
}
