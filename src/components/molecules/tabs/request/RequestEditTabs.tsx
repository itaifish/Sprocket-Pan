import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import {
	EMPTY_ENVIRONMENT,
	EndpointRequest,
	Environment,
	QueryParams,
} from '../../../../types/application-data/application-data';
import { useState } from 'react';
import { RequestBody } from './RequestBody';
import { camelCaseToTitle } from '../../../../utils/string';
import { EnvironmentEditableTable } from '../../editing/EnvironmentEditableTable';
import { QueryParamEditableTable } from '../../editing/QueryParamEditableTable';
import { RequestScripts } from './RequestScripts';
import { environmentContextResolver } from '../../../../managers/EnvironmentContextResolver';
import {
	selectEndpoints,
	selectEnvironments,
	selectRequests,
	selectSelectedEnvironment,
	selectServices,
	selectSettings,
} from '../../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../../state/store';
import { updateRequest } from '../../../../state/active/slice';

const requestTabs = ['body', 'headers', 'queryParams', 'scripts', 'environment'] as const;
type RequestTabType = (typeof requestTabs)[number];

export function RequestEditTabs({ request }: { request: EndpointRequest }) {
	const [tab, setTab] = useState<RequestTabType>('body');
	const environments = useSelector(selectEnvironments);
	const services = useSelector(selectServices);
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const settings = useSelector(selectSettings);
	const requests = useSelector(selectRequests);
	const endpoints = useSelector(selectEndpoints);
	const endpoint = endpoints[request.endpointId];
	const varsEnv = environmentContextResolver.buildEnvironmentVariables(
		{ environments, selectedEnvironment, services, settings, requests },
		endpoint?.serviceId,
		request.id,
	);
	const dispatch = useAppDispatch();
	function update(values: Partial<EndpointRequest>) {
		dispatch(updateRequest({ ...values, id: request.id }));
	}
	return (
		<Tabs
			aria-label="tabs"
			size="lg"
			value={tab}
			onChange={(_event, newValue) => {
				const newTabId = newValue as RequestTabType;
				setTab(newTabId);
			}}
		>
			<TabList color="primary">
				{requestTabs.map((curTab, index) => (
					<Tab color={curTab === tab ? 'primary' : 'neutral'} value={curTab} key={index}>
						{camelCaseToTitle(curTab)}
					</Tab>
				))}
			</TabList>
			<TabPanel value={'body'}>
				<RequestBody requestData={request}></RequestBody>
			</TabPanel>
			<TabPanel value="headers">
				<EnvironmentEditableTable
					environment={request.headers as Environment}
					setNewEnvironment={(newEnvironment: Environment) => update({ headers: newEnvironment })}
					varsEnv={varsEnv}
				/>
			</TabPanel>
			<TabPanel value="queryParams">
				<QueryParamEditableTable
					queryParams={request.queryParams}
					setNewQueryParams={(newQueryParams: QueryParams) => {
						update({ queryParams: newQueryParams });
					}}
					varsEnv={varsEnv}
				/>
			</TabPanel>
			<TabPanel value="scripts">
				<RequestScripts request={request} />
			</TabPanel>
			<TabPanel value="environment">
				<EnvironmentEditableTable
					environment={(request.environmentOverride ?? EMPTY_ENVIRONMENT) as Environment}
					setNewEnvironment={(newEnvironment: Environment) => update({ environmentOverride: newEnvironment })}
					varsEnv={varsEnv}
				/>
			</TabPanel>
		</Tabs>
	);
}
