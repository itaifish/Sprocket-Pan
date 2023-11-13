import { NetworkCallResponse } from '../../../../managers/NetworkRequestManager';
import { ResponseBody } from './ResponseBody';

export function ResponseInfo({ response }: { response: NetworkCallResponse }) {
	return <ResponseBody response={response} />;
}
