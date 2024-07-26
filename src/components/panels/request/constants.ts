import { EMPTY_HEADERS, HistoricalEndpointResponse } from '../../../types/application-data/application-data';

export const defaultResponse: HistoricalEndpointResponse = {
	response: {
		statusCode: 200,
		body: 'View the response here',
		bodyType: 'Text',
		headers: structuredClone(EMPTY_HEADERS),
		dateTime: new Date().getTime(),
	},
	request: {
		method: 'GET',
		url: '',
		headers: structuredClone(EMPTY_HEADERS),
		body: {},
		dateTime: new Date().getTime(),
	},
};
