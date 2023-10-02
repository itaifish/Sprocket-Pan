export function keepStringLengthReasonable(string: string, reasonableLength = 30) {
	if (string.length <= reasonableLength) {
		return string;
	}
	return `${string.slice(0, reasonableLength - 3)}...`;
}
