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
import { EndpointRequest } from '../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../utils/string';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';
import { EditableData } from '../../shared/input/EditableData';

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
				<EditableData
					values={request.headers}
					onChange={(values) => update({ headers: values })}
					environment={varsEnv}
				/>
			</TabPanel>
			<TabPanel value="queryParams">
				<EditableData
					values={request.queryParams}
					onChange={(newQueryParams) => {
						update({ queryParams: newQueryParams });
					}}
					environment={varsEnv}
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
				<EditableData
					values={request.environmentOverride.pairs ?? []}
					onChange={(pairs) => update({ environmentOverride: { ...request.environmentOverride, pairs } })}
					environment={varsEnv}
				/>
			</TabPanel>
		</Tabs>
	);
}
