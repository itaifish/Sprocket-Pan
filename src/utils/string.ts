function getLongestCommonSubstringStartingAtBeginningIndex(string1: string, string2: string): number {
	let i;
	for (i = 0; i < string1.length && i < string2.length; i++) {
		if (string1.charAt(i) !== string2.charAt(i)) {
			break;
		}
	}
	return i;
}

export function getLongestCommonSubstringStartingAtBeginning(string1: string, string2: string): string {
	return string1.substring(0, getLongestCommonSubstringStartingAtBeginningIndex(string1, string2));
}

export function getStringDifference(string1: string, string2: string): string {
	const longerString = string1.length > string2.length ? string1 : string2;
	return longerString.substring(getLongestCommonSubstringStartingAtBeginningIndex(string1, string2));
}

export function capitalizeWord<T extends string>(word: T): Capitalize<T> {
	return (word.charAt(0).toUpperCase() + word.slice(1)) as Capitalize<T>;
}

export function camelCaseToTitle(text: string) {
	const firstCapital = text.replace(/([A-Z])/g, ' $1');
	return capitalizeWord(firstCapital);
}

export function toValidFolderName(text: string) {
	// replace groups that aren't a letter, number or underscore with a dash
	return text.replace(/([^a-z0-9_]+)/gi, '-');
}

export function toValidFunctionName(text: string) {
	// replace groups that aren't a letter, number or underscore with an underscore
	return text.replace(/([^a-z0-9_]+)/gi, '_');
}

const dateTimeFormatters = {
	full: new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour12: true,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		fractionalSecondDigits: 3,
	}),
	shortDateFull: new Intl.DateTimeFormat('en-US', {
		year: '2-digit',
		month: '2-digit',
		day: 'numeric',
		hour12: true,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		fractionalSecondDigits: 2,
	}),
	date: new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}),
};

export function formatShortFullDate(date: Date | string | number) {
	return dateTimeFormatters.shortDateFull.format(new Date(date));
}

export function formatFullDate(date: Date | string | number) {
	return dateTimeFormatters.full.format(new Date(date));
}

export function formatDate(date: Date | string | number) {
	return dateTimeFormatters.date.format(new Date(date));
}

export function formatMilliseconds(ms: number) {
	return `${(ms / 1000).toFixed(3)} second${ms === 1000 ? '' : 's'}`;
}

export function getStatusCodeColor(statusCode: number) {
	return statusCode < 200 ? 'neutral' : statusCode < 300 ? 'success' : statusCode < 400 ? 'primary' : 'danger';
}
