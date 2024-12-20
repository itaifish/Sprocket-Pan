export function keepStringLengthReasonable(string: string, reasonableLength = 30) {
	if (string == null) {
		return '';
	}
	if (string.length <= reasonableLength) {
		return string;
	}
	return `${string.slice(0, reasonableLength - 3)}...`;
}

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

export const statusCodes: Record<number, string> = {
	100: 'Continue',
	101: 'Switching Protocols',
	102: 'Processing',
	103: 'Early Hints',
	200: 'Okay',
	201: 'Created',
	202: 'Accepted',
	203: 'Non-Authoritative Information',
	204: 'No Content',
	205: 'Reset Content',
	206: 'Partial Content',
	207: 'Multi-Status',
	208: 'Already Reported',
	226: 'IM Used',
	300: 'Multiple Choices',
	301: 'Moved Permanently',
	302: 'Found',
	303: 'See Other',
	304: 'Not Modified',
	305: 'Use Proxy',
	307: 'Temporary Redirect',
	308: 'Permanent Redirect',
	400: 'Bad Request',
	401: 'Unauthorized',
	402: 'Payment Required',
	403: 'Forbidden',
	404: 'Not Found',
	405: 'Method Not Allowed',
	406: 'Not Acceptable',
	407: 'Proxy Authentication Required',
	408: 'Request Timeout',
	409: 'Conflict',
	410: 'Gone',
	411: 'Length Required',
	412: 'Precondition Failed',
	413: 'Payload Too Large',
	414: 'URI Too Long',
	415: 'Unsupported Media Type',
	416: 'Range Not Satisfiable',
	417: 'Expectation Failed',
	418: "I'm a teapot",
	421: 'Misdirected Request',
	422: 'Unprocessable Entity',
	423: 'Locked',
	424: 'Failed Dependency',
	425: 'Too Early',
	426: 'Upgrade Required',
	428: 'Precondition Required',
	429: 'Too Many Requests',
	431: 'Request Header Fields Too Large',
	451: 'Unavailable For Legal Reasons',
	500: 'Internal Server Error',
	501: 'Not Implemented',
	502: 'Bad Gateway',
	503: 'Service Unavailable',
	504: 'Gateway Timeout',
	505: 'HTTP Version Not Supported',
	506: 'Variant Also Negotiates',
	507: 'Insufficient Storage',
	508: 'Loop Detected',
	510: 'Not Extended',
	511: 'Network Authentication Required',
};
