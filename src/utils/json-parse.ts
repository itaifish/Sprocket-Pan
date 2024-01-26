const dateKeys = ['dateTime', 'timestamp'];

export const dateTimeReviver = (key: string, value: unknown) => {
	if (dateKeys.includes(key)) {
		if (typeof value === 'string') {
			return new Date(value);
		}
	}
	return value;
};
