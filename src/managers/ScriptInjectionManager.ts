import { ApplicationData, EndpointRequest } from '../types/application-data/application-data';
import { applicationDataManager } from './ApplicationDataManager';

export function getScriptInjectionCode(request: EndpointRequest, data: ApplicationData) {
	const setEnvironmentVariable = (key: string, value: string) => {
		applicationDataManager.update('request', request.id, { ...request.environmentOverride, [key]: value });
	};
	return {
		setEnvironmentVariable,
		data,
	};
}
