import { ApplicationData, EndpointRequest } from '../types/application-data/application-data';
import { log } from '../utils/logging';
import { applicationDataManager } from './ApplicationDataManager';

export function getPreScriptInjectionCode(request: EndpointRequest, data: ApplicationData) {
	const setEnvironmentVariable = (key: string, value: string) => {
		log.info(`Set ENvironment Variable Called`);
		applicationDataManager.update('request', request.id, {
			environmentOverride: { ...request.environmentOverride, [key]: value },
		});
	};
	return {
		setEnvironmentVariable,
		data,
	};
}
