import { AccordionGroup, Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { environmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import {
	selectEnvironments,
	selectServices,
	selectSelectedEnvironment,
	selectSettings,
	selectRequests,
} from '../../../state/active/selectors';
import { updateEndpoint } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { Endpoint, Environment, QueryParams } from '../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../utils/string';
import { QueryParamEditableTable } from '../../shared/input/QueryParamEditableTable';
import { EnvironmentEditableTable } from '../shared/EnvironmentEditableTable';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';

const endpointTabs = ['headers', 'queryParams', 'scripts'] as const;
type EndpointPanelType = (typeof endpointTabs)[number];

export function EndpointEditTabs({ endpoint }: { endpoint: Endpoint }) {
	const [tab, setTab] = useState<EndpointPanelType>('headers');
	const environments = useSelector(selectEnvironments);
	const services = useSelector(selectServices);
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const settings = useSelector(selectSettings);
	const requests = useSelector(selectRequests);
	const varsEnv = environmentContextResolver.buildEnvironmentVariables(
		{ services, selectedEnvironment, requests, environments, settings },
		endpoint.serviceId,
	);
	const dispatch = useAppDispatch();
	function update(values: Partial<Endpoint>) {
		dispatch(updateEndpoint({ ...values, id: endpoint.id }));
	}
	return (
		<Tabs
			aria-label="tabs"
			size="lg"
			value={tab}
			onChange={(_event, newValue) => {
				const newTabId = newValue as EndpointPanelType;
				setTab(newTabId);
			}}
		>
			<TabList color="primary">
				{endpointTabs.map((curTab, index) => (
					<Tab color={curTab === tab ? 'primary' : 'neutral'} value={curTab} key={index}>
						{camelCaseToTitle(curTab)}
					</Tab>
				))}
			</TabList>

			<TabPanel value="headers">
				<EnvironmentEditableTable
					environment={endpoint.baseHeaders as Environment}
					setNewEnvironment={(newEnvironment: Environment) => update({ baseHeaders: newEnvironment })}
					varsEnv={varsEnv}
				/>
			</TabPanel>
			<TabPanel value="queryParams">
				<QueryParamEditableTable
					queryParams={endpoint.baseQueryParams}
					setNewQueryParams={(newQueryParams: QueryParams) => {
						update({ baseQueryParams: newQueryParams });
					}}
					varsEnv={varsEnv}
				/>
			</TabPanel>
			<TabPanel value="scripts">
				<AccordionGroup>
					<PrePostScriptDisplay
						onChange={update}
						preRequestScript={endpoint.preRequestScript}
						postRequestScript={endpoint.postRequestScript}
					/>
				</AccordionGroup>
			</TabPanel>
		</Tabs>
	);
}
