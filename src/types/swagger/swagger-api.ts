import { RESTfulRequestVerb, RawBodyType, RequestBodyType } from '../application-data/application-data';
import { RecursivePartial } from '../utils/utils';

type ContentType = Exclude<RequestBodyType, 'none' | 'raw'> | Lowercase<RawBodyType>;

type Schema = RecursivePartial<{
	required: string[];
	type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
}>;
export type SwaggerApi = RecursivePartial<{
	info: {
		title: string;
		description: string;
		version: string;
	};
	servers: { url: string } | Array<{ url: string }>;
	paths: {
		[pathName: `/${string}`]: {
			[verb in Lowercase<RESTfulRequestVerb>]: {
				description: string;
				summary: string;
				requestBody: {
					content: {
						[validContentType in `application/${ContentType}`]: Schema;
					};
				};
			};
		};
	};
}>;
