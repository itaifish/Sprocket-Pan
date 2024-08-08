import { v4 } from 'uuid';
import { Endpoint, EndpointRequest, QueryParams, SPHeaders } from '../../types/application-data/application-data';
import { HeaderUtils, QueryParamUtils } from '../../utils/data-utils';
import type {
	Auth as V200Auth,
	EventList as V200EventList,
	Folder as V200Folder,
	FormParameter as V200FormParameter,
	Header as V200Header,
	HttpsSchemaGetpostmanComJsonCollectionV200 as V200Schema,
	Item as V200Item,
	Request1 as V200Request1,
	UrlEncodedParameter as V200UrlEncodedParameter,
} from './parseTypes/postman2.0Types';
import type {
	Auth as V210Auth,
	EventList as V210EventList,
	Folder as V210Folder,
	FormParameter as V210FormParameter,
	Header as V210Header,
	HttpsSchemaGetpostmanComJsonCollectionV210 as V210Schema,
	Item as V210Item,
	Request1 as V210Request1,
	QueryParam,
	UrlEncodedParameter as V210UrlEncodedParameter,
} from './parseTypes/postman2.1Types';

type PostmanCollection = V200Schema | V210Schema;

type EventList = V200EventList | V210EventList;

type Authetication = V200Auth | V210Auth;

type Body = V200Request1['body'] | V210Request1['body'];

type UrlEncodedParameter = V200UrlEncodedParameter | V210UrlEncodedParameter;

type FormParameter = V200FormParameter | V210FormParameter;

type Item = V200Item | V210Item;

type Folder = V200Folder | V210Folder;

type Header = V200Header | V210Header;

class PostmanParseManager {
	public static readonly INSTANCE = new PostmanParseManager();

	private constructor() {}

	importPostmanCollection(collection: PostmanCollection) {
		const {
			item,
			info: { name, description },
			variable,
			auth,
			event,
		} = collection;
	}

	importItems = (items: PostmanCollection['item'], parentId = '__WORKSPACE_ID__'): any => {
		// @ts-expect-error this is because there are devergent behaviors for how the function treats this collection.  This is handled appropriately in the function itself in different branches.
		return items.reduce((accumulator: ImportRequest[], item: Item | Folder) => {
			if (Object.prototype.hasOwnProperty.call(item, 'request')) {
				return [...accumulator, this.importRequestItem(item as Item, parentId)];
			}

			const requestGroup = this.importFolderItem(item as Folder, parentId);
			return [
				...accumulator,
				requestGroup,
				...this.importItems(item.item as PostmanCollection['item'], requestGroup._id),
			];
		}, []);
	};

	importRequestItem = (
		{ request, name = '', event }: Item,
		parentId: string,
	): { request: EndpointRequest; endpoint: Endpoint } | null => {
		if (typeof request === 'string') {
			return null;
		}

		const headers = this.importHeaders(request.header);

		let parameters = QueryParamUtils.new();

		if (typeof request.url === 'object' && request.url?.query) {
			parameters = this.importParameters(request.url?.query);
		}

		const preRequestScript = this.importPreRequestScript(event);
		const afterResponseScript = this.importAfterResponseScript(event);

		const endpointId = v4();
		const requestId = v4();

		const newRequest: EndpointRequest = {
			id: requestId,
			endpointId,
			name,
			headers,
		};

		return null;
	};

	importHeaders = (headers: Header[] | string): SPHeaders => {
		const result = HeaderUtils.new();

		return result;
	};

	importParameters = (parameters: QueryParam[]): QueryParams => {
		const result = QueryParamUtils.new();
		if (!parameters || parameters?.length === 0) {
			return result;
		}
		parameters.forEach(({ key, value }) => QueryParamUtils.add(result, key ?? 'Unknown Key', value ?? ''));
		return result;
	};

	importPreRequestScript = (events: EventList | undefined): string => {
		if (events == null) {
			return '';
		}

		const preRequestEvent = events.find((event) => event.listen === 'prerequest');

		const scriptOrRows = preRequestEvent != null ? preRequestEvent.script : '';
		if (scriptOrRows == null || scriptOrRows === '') {
			return '';
		}

		const scriptContent =
			scriptOrRows.exec != null
				? Array.isArray(scriptOrRows.exec)
					? scriptOrRows.exec.join('\n')
					: scriptOrRows.exec
				: '';

		return scriptContent;
	};

	importAfterResponseScript = (events: EventList | undefined): string => {
		if (events == null) {
			return '';
		}

		const afterResponseEvent = events.find((event) => event.listen === 'test');

		const scriptOrRows = afterResponseEvent ? afterResponseEvent.script : '';
		if (!scriptOrRows) {
			return '';
		}

		const scriptContent = scriptOrRows.exec
			? Array.isArray(scriptOrRows.exec)
				? scriptOrRows.exec.join('\n')
				: scriptOrRows.exec
			: '';

		return scriptContent;
	};
}

export const postmanParseManager = PostmanParseManager.INSTANCE;
