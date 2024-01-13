import { QueryParams } from '../types/application-data/application-data';

export class QueryParamUtils {
	private constructor() {}

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
		if (updateIndex) {
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
		if (updateIndex) {
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
			this.deleteKeyValuePair(queryParams, dataId);
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
