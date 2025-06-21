import { MS_IN_DAY, MS_IN_HOUR, MS_IN_MINUTE, MS_IN_WEEK } from '@/constants/constants';

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
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour12: true,
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit',
		fractionalSecondDigits: 2,
	}),
	date: new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}),
	relative: new Intl.RelativeTimeFormat('en'),
};

function getNumericDateSuffix(x: number) {
	if (x > 3 && x < 21) {
		return 'th';
	}
	switch (x % 10) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
}

export function formatShortFullDate(date: Date | string | number) {
	const parts = dateTimeFormatters.shortDateFull.formatToParts(new Date(date)).map((part) => part.value);
	return `${parts[0]} ${parts[2]}${getNumericDateSuffix(+parts[2])} ${parts[4]} at ${parts.slice(6).join('')}`;
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

export function formatRelativeDate(date: Date | string | number) {
	let value: number;
	let units: any;
	const then = new Date(date);
	const now = new Date();
	const gap = then.getTime() - now.getTime();
	const gapAbs = Math.abs(gap);
	if (gapAbs < MS_IN_MINUTE) {
		value = gap / 1000;
		units = 'seconds';
	} else if (gapAbs < MS_IN_HOUR) {
		value = gap / MS_IN_MINUTE;
		units = 'minutes';
	} else if (gapAbs < MS_IN_DAY) {
		value = gap / MS_IN_HOUR;
		units = 'hours';
	} else if (gapAbs < MS_IN_WEEK) {
		value = gap / MS_IN_DAY;
		units = 'days';
	} else {
		value = gap / MS_IN_WEEK;
		units = 'weeks';
	}
	value = value < 0 ? Math.ceil(value) : Math.floor(value);
	return dateTimeFormatters.relative.format(value, units);
}

export function truncate(
	str = '',
	{ ellipses = true, length = 20 }: { ellipses: boolean; length: number } = {} as any,
) {
	if (str.length < length + 1) {
		return str;
	}
	let truncated = str.substring(0, length).trim();
	if (ellipses) {
		truncated += '...';
	}
	return truncated;
}

export function joinList(arr: string[]) {
	if (arr.length < 3) {
		return arr.join(' and ');
	}
	arr = [...arr];
	arr[arr.length - 1] = 'and ' + arr[arr.length - 1];
	return arr.join(', ');
}
