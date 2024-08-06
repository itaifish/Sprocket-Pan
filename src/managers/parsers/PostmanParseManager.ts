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
}

export const postmanParseManager = PostmanParseManager.INSTANCE;
