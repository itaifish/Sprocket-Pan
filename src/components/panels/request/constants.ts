import { HistoricalEndpointResponse } from '@/types/data/workspace';

export const defaultResponse: HistoricalEndpointResponse = {
	response: {
		statusCode: 200,
		body: 'View the response here',
		bodyType: 'Text',
		headers: [],
		dateTime: new Date().getTime(),
	},
	request: {
		method: 'GET',
		url: '',
		headers: {},
		body: '',
		dateTime: new Date().getTime(),
	},
};
