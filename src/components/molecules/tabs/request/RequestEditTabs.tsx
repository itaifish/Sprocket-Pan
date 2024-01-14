import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { EndpointRequest, Environment } from '../../../../types/application-data/application-data';
import { useState, useContext } from 'react';
import { RequestBody } from './RequestBody';
import { camelCaseToTitle } from '../../../../utils/string';
import { EnvironmentEditableTable } from '../../editing/EnvironmentEditableTable';
import { applicationDataManager } from '../../../../managers/ApplicationDataManager';
import { QueryParamEditableTable } from '../../editing/QueryParamEditableTable';
import { RequestScripts } from './RequestScripts';
import { environmentContextResolver } from '../../../../managers/EnvironmentContextResolver';
import { ApplicationDataContext } from '../../../../managers/GlobalContextManager';

const requestTabs = ['body', 'headers', 'queryParams', 'scripts', 'environment'] as const;
type RequestTabType = (typeof requestTabs)[number];

export function RequestEditTabs({ request }: { request: EndpointRequest }) {
	const [tab, setTab] = useState<RequestTabType>('body');
	const data = useContext(ApplicationDataContext);
	const endpoint = data.endpoints[request.endpointId];
	const varsEnv = environmentContextResolver.buildEnvironmentVariables(data, endpoint?.serviceId, request.id);
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
					setNewEnvironment={(newEnvironment: Environment) =>
						applicationDataManager.update('request', request.id, { headers: newEnvironment })
					}
					varsEnv={varsEnv}
				/>
			</TabPanel>
			<TabPanel value="queryParams">
				<QueryParamEditableTable
					queryParams={request.queryParams}
					setNewQueryParams={(newQueryParams: Record<string, string[]>) => {
						applicationDataManager.update('request', request.id, { queryParams: newQueryParams });
					}}
					varsEnv={varsEnv}
				/>
			</TabPanel>
			<TabPanel value="scripts">
				<RequestScripts request={request} />
			</TabPanel>
			<TabPanel value="environment">
				<EnvironmentEditableTable
					environment={(request.environmentOverride ?? {}) as Environment}
					setNewEnvironment={(newEnvironment: Environment) =>
						applicationDataManager.update('request', request.id, { environmentOverride: newEnvironment })
					}
					varsEnv={varsEnv}
				/>
			</TabPanel>
		</Tabs>
	);
}
