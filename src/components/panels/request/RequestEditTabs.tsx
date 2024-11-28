import { AccordionGroup, Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { useState } from 'react';
import { RequestBody } from './RequestBody';
import { useSelector } from 'react-redux';
import { EnvironmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import {
	selectEnvironments,
	selectServices,
	selectSelectedEnvironment,
	selectSettings,
	selectRequests,
	selectEndpoints,
} from '../../../state/active/selectors';
import { updateRequest } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import {
	EndpointRequest,
	QueryParams,
	Environment,
	createEmptyEnvironment,
} from '../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../utils/string';
import { QueryParamEditableTable } from '../../shared/input/QueryParamEditableTable';
import { EnvironmentEditableTable } from '../shared/EnvironmentEditableTable';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';
import { OrderedKeyValueEditableTable } from '../shared/OrderedKeyValueEditableTable';

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
	const varsEnv = EnvironmentContextResolver.buildEnvironmentVariables(
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
				<RequestBody request={request}></RequestBody>
			</TabPanel>
			<TabPanel value="headers">
				<OrderedKeyValueEditableTable
					values={request.headers}
					onChange={(values) => update({ headers: values })}
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
				<AccordionGroup>
					<PrePostScriptDisplay
						onChange={update}
						preRequestScript={request.preRequestScript}
						postRequestScript={request.postRequestScript}
					/>
				</AccordionGroup>
			</TabPanel>
			<TabPanel value="environment">
				<EnvironmentEditableTable
					environment={request.environmentOverride ?? createEmptyEnvironment()}
					setNewEnvironment={(newEnvironment: Environment) => update({ environmentOverride: newEnvironment })}
					varsEnv={varsEnv}
				/>
			</TabPanel>
		</Tabs>
	);
}
