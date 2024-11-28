export type KeyValueValues = string | string[] | (string | string[]);

export type KeyValuePair<T extends KeyValueValues> = { key: string; value?: T };

type KeyValueOrOrdered<T extends KeyValueValues> = KeyValuePair<T>[] | OrderedKeyValuePairs<T>;

export class OrderedKeyValuePairs<T extends KeyValueValues = string> implements Iterable<[number, KeyValuePair<T>]> {
	private map: Record<string, T | undefined> = {};
	private order: string[] = [];

	constructor(...args: KeyValueOrOrdered<T>[]) {
		args.forEach(this.apply);
	}

	public apply(pairs: KeyValueOrOrdered<T>) {
		if (pairs instanceof OrderedKeyValuePairs) {
			pairs = pairs.toArray();
		}
		pairs.forEach(({ key, value }) => this.set(key, value));
	}

	public get(key: string) {
		return this.map[key];
	}

	public set(key: string, value?: T) {
		const oldValue = this.map[key];
		if (oldValue == null) {
			this.order.push(key);
		}
		this.map[key] = value;
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
		return { key, value: this.map[key] };
	}

	public count() {
		return this.order.length;
	}

	public toArray() {
		return this.order.map(this.toKeyValuePair);
	}

	public toTableData() {
		return this.order.map((key, index) => ({ ...this.toKeyValuePair(key), id: index }));
	}

	public keys() {
		return this.order.slice();
	}

	[Symbol.iterator] = () => this.toArray().entries();

	public toJSON() {
		return this.toArray().toString();
	}
}
