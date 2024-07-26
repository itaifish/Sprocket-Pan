import { TableData } from '../components/shared/input/EditableData';
import {
	EMPTY_ENVIRONMENT,
	EMPTY_QUERY_PARAMS,
	Environment,
	OrderedKeyValuePair,
	QueryParams,
} from '../types/application-data/application-data';

export abstract class KeyValuePairUtils {
	static toTableData<TKVP extends QueryParams | Environment>(kvp: TKVP) {
		const keyIndex = new Map<string, number>();
		return (kvp.__data ?? []).map((datum) => {
			const idValue = keyIndex.get(datum.key) ?? 0;
			keyIndex.set(datum.key, idValue + 1);
			return {
				id: idValue,
				value: datum.value,
				key: datum.key,
			};
		});
	}
}

export abstract class UniqueKeyValuePairUtils extends KeyValuePairUtils {
	static set(environment: OrderedKeyValuePair, key: string, value: string) {
		const oldValue = environment[key];
		if (!oldValue) {
			environment.__data.push({ key, value });
		} else {
			const index = environment.__data.findIndex((x) => x.key === key);
			if (index >= 0) {
				environment.__data[index].value = value;
			} else {
				return;
			}
		}
		environment[key] = value;
	}

	static delete(environment: OrderedKeyValuePair, key: string) {
		if (!environment[key]) {
			return;
		}
		const index = environment.__data.findIndex((x) => x.key === key);
		if (index >= 0) {
			environment.__data.splice(index, 1);
		} else {
			return;
		}
		delete environment[key];
	}

	static fromTableData<TID extends string | number>(tableData: TableData<TID>) {
		const initialData = structuredClone(EMPTY_ENVIRONMENT);
		tableData.forEach((td) => this.set(initialData, td.key, td.value));
		return initialData;
	}
}

export class EnvironmentUtils extends UniqueKeyValuePairUtils {
	private constructor() {
		super();
	}
}

export class HeaderUtils extends UniqueKeyValuePairUtils {
	private constructor() {
		super();
	}
}

export class QueryParamUtils extends KeyValuePairUtils {
	private constructor() {
		super();
	}

	static fromTableData<TID extends string | number>(tableData: TableData<TID>) {
		const initialData = structuredClone(EMPTY_QUERY_PARAMS);
		tableData.forEach((td) => this.add(initialData, td.key, td.value));
		return initialData;
	}

	static set = (queryParams: QueryParams, key: string, values: string[]) => {
		queryParams.__data = queryParams.__data.filter((x) => x.key != key);
		delete queryParams[key];
		values.forEach((value) => this.add(queryParams, key, value));
	};

	static add = (queryParams: QueryParams, newKey: string, newValue: string) => {
		if (queryParams[newKey]) {
			queryParams[newKey].push(newValue);
		} else {
			queryParams[newKey] = [newValue];
		}
		queryParams.__data.push({ key: newKey, value: newValue });
	};

	static updateValue = (queryParams: QueryParams, dataId: number, newValue: string) => {
		const datumToUpdate = queryParams.__data[dataId];
		const updateIndex = queryParams[datumToUpdate.key].findIndex((x) => x == datumToUpdate.value);
		if (updateIndex != undefined && updateIndex >= 0) {
			queryParams[datumToUpdate.key][updateIndex] = newValue;
		}
		datumToUpdate.value = newValue;
	};

	static updateKey = (queryParams: QueryParams, dataId: number, newKey: string, valueId?: number) => {
		const datumToUpdate = queryParams.__data[dataId];
		if (!datumToUpdate) {
			return;
		}
		const updateIndex = valueId ?? queryParams[datumToUpdate.key].findIndex((x) => x === datumToUpdate.value);
		if (updateIndex != undefined && updateIndex >= 0) {
			queryParams[datumToUpdate.key].splice(updateIndex, 1);
			if (queryParams[datumToUpdate.key].length == 0) {
				delete queryParams[datumToUpdate.key];
			}
			if (queryParams[newKey]) {
				queryParams[newKey].push(datumToUpdate.value);
			} else {
				queryParams[newKey] = [datumToUpdate.value];
			}
			datumToUpdate.key = newKey;
		}
	};

	static deleteKeyValuePair = (queryParams: QueryParams, dataId: number, valueId?: number) => {
		const datumToUpdate = queryParams.__data[dataId];
		if (!datumToUpdate) {
			return;
		}
		const updateIndex = valueId ?? queryParams[datumToUpdate.key]?.findIndex((x) => x === datumToUpdate.value);
		if (updateIndex != undefined && updateIndex >= 0) {
			queryParams[datumToUpdate.key].splice(updateIndex, 1);
			if (queryParams[datumToUpdate.key].length === 0) {
				delete queryParams[datumToUpdate.key];
			}
			queryParams.__data.splice(dataId, 1);
		}
	};
}
