import { TableData } from '../components/molecules/editing/EditableTable';
import { EMPTY_QUERY_PARAMS, OrderedKeyValuePair, QueryParams } from '../types/application-data/application-data';

export abstract class KeyValuePairUtils {
	static toTableData<TKVP extends OrderedKeyValuePair<string | number, any, boolean>>(kvp: TKVP) {
		return (kvp.__data ?? []).map((datum, index) => {
			return {
				id: index,
				value: datum.value,
				key: datum.key,
			};
		});
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
