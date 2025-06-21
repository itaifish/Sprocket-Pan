import { EndpointResponse, NetworkFetchRequest } from '@/types/data/workspace';

export const defaultResponse: { response: EndpointResponse; request: NetworkFetchRequest } = {
	response: {
		statusCode: 0,
		body: 'Empty',
		bodyType: 'Text',
		headers: [],
		dateTime: new Date(0).getTime(),
	},
	request: {
		method: 'GET',
		url: '',
		headers: {},
		body: '',
		dateTime: new Date(0).getTime(),
	},
};
