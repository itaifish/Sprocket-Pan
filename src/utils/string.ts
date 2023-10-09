export function keepStringLengthReasonable(string: string, reasonableLength = 30) {
	if (string.length <= reasonableLength) {
		return string;
	}
	return `${string.slice(0, reasonableLength - 3)}...`;
}

export function camelCaseToTitle(text: string) {
	const firstCapital = text.replace(/([A-Z])/g, ' $1');
	return firstCapital.charAt(0).toUpperCase() + firstCapital.slice(1);
}
