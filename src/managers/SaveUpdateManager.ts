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

import { OrderedKeyValuePairs } from '../classes/OrderedKeyValuePairs';
import { Environment, HistoricalEndpointResponse, WorkspaceData } from '../types/application-data/application-data';
import { defaultWorkspaceData } from './data/WorkspaceDataManager';

/**
 * KeyValuePairs for everyone!
 */

function toEight(data: WorkspaceData | any) {
	console.log('started toEight');
	function consolidateValues(obj: any) {
		console.log('new consolidateValues with object', obj);
		const pairs = new OrderedKeyValuePairs(obj.__data);
		console.log(`exited the consolidate values new OrderedKeyValuePairs block`);
		Object.entries(obj).forEach(([key, value]) => {
			console.log('consolidateValues forEach loop with', { key, value });
			if (!key.startsWith('__')) {
				console.log('moving forward with setting the above');
				pairs.set(key, value as any);
			}
		});
		console.log('got past all the setting of values, about to return the array');
		return pairs.toArray();
	}
	function convertEnv(env: any): Environment {
		return { id: env.id, name: env.__name, pairs: consolidateValues(env) };
	}
	function convertHistory({ request, response, auditLog }: HistoricalEndpointResponse): HistoricalEndpointResponse {
		request.headers = consolidateValues(request.headers);
		response.headers = consolidateValues(response.headers);
		return { request, response, auditLog };
	}
	for (const envId in data.environments) {
		console.log({ envId });
		data.environments[envId] = convertEnv(data.environments[envId]);
	}
	console.log('toEight environments done');
	for (const servId in data.services) {
		for (const envId in data.services[servId].localEnvironments) {
			data.services[servId].localEnvironments[envId] = convertEnv(data.services[servId].localEnvironments[envId]);
		}
	}
	console.log('toEight services done');
	for (const endId in data.endpoints) {
		data.endpoints[endId].baseHeaders = consolidateValues(data.endpoints[endId].baseHeaders);
		data.endpoints[endId].baseQueryParams = consolidateValues(data.endpoints[endId].baseQueryParams);
	}
	console.log('toEight endpoints done');
	for (const reqId in data.requests) {
		data.requests[reqId].headers = consolidateValues(data.requests[reqId].headers);
		data.requests[reqId].queryParams = consolidateValues(data.requests[reqId].queryParams);
		data.requests[reqId].environmentOverride = convertEnv(data.requests[reqId].environmentOverride);
		data.requests[reqId].history = data.requests[reqId].history.map((history: any) => convertHistory(history));
	}
	console.log('finished eight');
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
		data.settings.autoSaveIntervalMS = 60_000 * 5;
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

const transformers = [toOne, toTwo, toThree, toFour, toFive, toSix, toSeven] as const;

class SaveUpdateManager {
	public static readonly INSTANCE = new SaveUpdateManager();

	private constructor() {}

	public getCurrentVersion(): number {
		return transformers.length;
	}

	public update(data: WorkspaceData | any) {
		console.log('started all updating with data input: ', data);
		transformers.slice(data.version || 0).forEach((transform) => transform(data));
		data.version = transformers.length;
		console.log('finished all updating with data output:', data);
		const eightTest: any = {
			environments: {
				w: {
					__data: [{ key: 'your_mom', value: 'ugly' }],
					your_mom: 'ugly',
					__name: ':(',
					__id: 'w',
				},
			},
		};
		console.log('starting toEight run with custom input: ', eightTest);
		toEight(eightTest);
	}
}

export const saveUpdateManager = SaveUpdateManager.INSTANCE;
