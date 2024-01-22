import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { Endpoint, Environment, QueryParams } from '../../../../types/application-data/application-data';
import { useState, useContext } from 'react';
import { camelCaseToTitle } from '../../../../utils/string';
import { EnvironmentEditableTable } from '../../editing/EnvironmentEditableTable';
import { applicationDataManager } from '../../../../managers/ApplicationDataManager';
import { QueryParamEditableTable } from '../../editing/QueryParamEditableTable';
import { EndpointScripts } from './EndpointScripts';
import { environmentContextResolver } from '../../../../managers/EnvironmentContextResolver';
import { ApplicationDataContext } from '../../../../managers/GlobalContextManager';

const endpointTabs = ['headers', 'queryParams', 'scripts'] as const;
type EndpointTabType = (typeof endpointTabs)[number];

export function EndpointEditTabs({ endpoint }: { endpoint: Endpoint }) {
	const [tab, setTab] = useState<EndpointTabType>('headers');
	const data = useContext(ApplicationDataContext);
	const varsEnv = environmentContextResolver.buildEnvironmentVariables(data, endpoint.serviceId);
	return (
		<Tabs
			aria-label="tabs"
			size="lg"
			value={tab}
			onChange={(_event, newValue) => {
				const newTabId = newValue as EndpointTabType;
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
					setNewEnvironment={(newEnvironment: Environment) =>
						applicationDataManager.update('endpoint', endpoint.id, { baseHeaders: newEnvironment })
					}
					varsEnv={varsEnv}
				/>
			</TabPanel>
			<TabPanel value="queryParams">
				<QueryParamEditableTable
					queryParams={endpoint.baseQueryParams}
					setNewQueryParams={(newQueryParams: QueryParams) => {
						applicationDataManager.update('endpoint', endpoint.id, { baseQueryParams: newQueryParams });
					}}
					varsEnv={varsEnv}
				/>
			</TabPanel>
			<TabPanel value="scripts">
				<EndpointScripts endpoint={endpoint} />
			</TabPanel>
		</Tabs>
	);
}
