export type KeyValuePair = { key: string; value?: string };

type KeyValueOrOrdered = KeyValuePair[] | OrderedKeyValuePairs;

export class OrderedKeyValuePairs implements Iterable<[number, KeyValuePair]> {
	private map: Record<string, string | undefined> = {};
	private order: string[] = [];

	constructor(...args: KeyValueOrOrdered[]) {
		args.forEach(this.apply);
	}

	public apply(pairs: KeyValueOrOrdered) {
		if (pairs instanceof OrderedKeyValuePairs) {
			pairs = pairs.toArray();
		}
		pairs.forEach(({ key, value }) => this.set(key, value));
	}

	public get(key: string) {
		return this.map[key];
	}

	public set(key: string, value?: string) {
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

	private toKeyValue(key: string): KeyValuePair {
		return { key, value: this.map[key] };
	}

	public toArray() {
		return this.order.map(this.toKeyValue);
	}

	public keys() {
		return this.order.slice();
	}

	[Symbol.iterator] = () => this.toArray().entries();

	public toJSON() {
		return this.toArray().toString();
	}
}
