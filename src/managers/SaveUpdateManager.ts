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

/**
 * Updates response bodies to be strings, rather than Record<string, unknown>.
 */
function toOne(data: any) {
	for (const requestId in data.requests) {
		for (const entry of data.requests[requestId].history) {
			if (typeof entry.response.body !== 'string') {
				entry.response.body = JSON.stringify(entry.response.body);
			}
		}
	}
}

const transformers = [toOne];

class SaveUpdateManager {
	public static readonly INSTANCE = new SaveUpdateManager();

	private constructor() {}

	public getCurrentVersion(): number {
		return transformers.length;
	}

	public update(data: any) {
		transformers.slice(data.version || 0).forEach((transform) => transform(data));
		data.version = transformers.length;
	}
}

export const saveUpdateManager = SaveUpdateManager.INSTANCE;
