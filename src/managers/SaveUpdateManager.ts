/*
Save files are versioned by incrementing integer numbers. These numbers correspond 
to the length of the transformers array and the version ONLY increments when a new 
transformer is written.

The current version is always equal to transformers.length, and each entry 
in transformers gets one step closer to the current version (ie, "toOne" transforms 
version 0 save files [pre-versioning save files] to version 1 save files.)

If a save file is multiple versions behind, it is run in order against each 
sequential transformer that applies to it. ie a version 2 savefile updating to 
version 5 will be run against toThree, toFour, and toFive, or in other words,
entries 2, 3, and 4 in the array, which would be the final three entries.

Functions are defined separately as toOne/toTwo/etc as a sanity check. 
If using just a bare array, it would be too easy to accidentally switch two transformers 
and not even know, especially while refactoring. By naming them, it becomes
much more difficult to get them out of order and much easier to fix if they do.
*/

/*
You likely DO NOT need to write a save converter to add new properties to the Settings.
Instead, just make sure to add the new property at src\constants\defaults
*/

import { OrderedKeyValuePairs } from '../classes/OrderedKeyValuePairs';
import { MS_IN_MINUTE } from '../constants/constants';
import { Environment, HistoricalEndpointResponse, WorkspaceData } from '../types/application-data/application-data';
import { defaultWorkspaceData } from './data/WorkspaceDataManager';

/**
 * KeyValuePairs for everyone!
 */
function toEight(data: WorkspaceData | any) {
	function consolidateValues(obj: any) {
		const pairs = new OrderedKeyValuePairs(obj.__data);
		Object.entries(obj).forEach(([key, value]) => {
			if (!key.startsWith('__')) {
				pairs.set(key, value as any);
			}
		});
		return pairs.toArray();
	}
	function convertEnv(env: any): Environment {
		return { id: env.__id, name: env.__name, pairs: consolidateValues(env) };
	}
	function convertHistory({ request, response, auditLog }: HistoricalEndpointResponse): HistoricalEndpointResponse {
		request.headers = consolidateValues(request.headers);
		response.headers = consolidateValues(response.headers);
		return { request, response, auditLog };
	}
	for (const envId in data.environments) {
		data.environments[envId] = convertEnv(data.environments[envId]);
	}
	for (const servId in data.services) {
		for (const envId in data.services[servId].localEnvironments) {
			data.services[servId].localEnvironments[envId] = convertEnv(data.services[servId].localEnvironments[envId]);
		}
	}
	for (const endId in data.endpoints) {
		data.endpoints[endId].baseHeaders = consolidateValues(data.endpoints[endId].baseHeaders);
		data.endpoints[endId].baseQueryParams = consolidateValues(data.endpoints[endId].baseQueryParams);
	}
	for (const reqId in data.requests) {
		data.requests[reqId].headers = consolidateValues(data.requests[reqId].headers);
		data.requests[reqId].queryParams = consolidateValues(data.requests[reqId].queryParams);
		data.requests[reqId].environmentOverride = convertEnv(data.requests[reqId].environmentOverride);
		data.requests[reqId].history = data.requests[reqId].history.map((history: any) => convertHistory(history));
	}
}

/**
 * add user interface data
 */
function toSeven(data: WorkspaceData | any) {
	data.uiMetadata = { idSpecific: {} };
	data.globalUiMetadata = { idSpecific: {} };
}

/**
 * Add and enable list styling
 */
function toSix(data: WorkspaceData | any) {
	if (data.settings.listStyle == undefined) {
		data.settings.listStyle = 'default';
	}
}

/**
 * add user interface data (safely removed due to no longer being supported by contemporary UI)
 */
function toFive() {}

/**
 * Add and enable autosave
 */
function toFour(data: WorkspaceData | any) {
	if (data.settings.autoSaveIntervalMS == undefined) {
		data.settings.autoSaveIntervalMS = MS_IN_MINUTE * 5;
	}
}

/**
 * Update the settings to add scriptTimeoutDurationMS
 */
function toThree(data: WorkspaceData | any) {
	if (data.settings.scriptTimeoutDurationMS == undefined) {
		data.settings.scriptTimeoutDurationMS = defaultWorkspaceData.settings.scriptTimeoutDurationMS;
	}
}

/**
 * Updates response bodies to be strings, rather than Record<string, unknown>.
 */
function toTwo(data: any) {
	for (const requestId in data.requests) {
		for (const entry of data.requests[requestId].history) {
			if (typeof entry.request.body !== 'string') {
				entry.request.body = JSON.stringify(entry.request.body);
			}
		}
	}
}

function toOne(data: any) {
	for (const requestId in data.requests) {
		for (const entry of data.requests[requestId].history) {
			if (typeof entry.response.body !== 'string') {
				entry.response.body = JSON.stringify(entry.response.body);
			}
		}
	}
}

const transformers = [toOne, toTwo, toThree, toFour, toFive, toSix, toSeven, toEight] as const;

export class SaveUpdateManager {
	public static getCurrentVersion(): number {
		return transformers.length;
	}

	public static update(data: WorkspaceData | any) {
		transformers.slice(data.version || 0).forEach((transform) => transform(data));
		data.version = transformers.length;
	}
}
