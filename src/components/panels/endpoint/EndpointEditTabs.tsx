import { AccordionGroup, Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { EnvironmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import {
	selectSecrets,
	selectSelectedEnvironmentValue,
	selectServiceSelectedEnvironmentValue,
} from '../../../state/active/selectors';
import { updateEndpoint } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { Endpoint } from '../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../utils/string';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';
import { EditableData } from '../../shared/input/EditableData';

const endpointTabs = ['headers', 'queryParams', 'scripts'] as const;
type EndpointPanelType = (typeof endpointTabs)[number];

export function EndpointEditTabs({ endpoint }: { endpoint: Endpoint }) {
	const [tab, setTab] = useState<EndpointPanelType>('headers');
	const secrets = useSelector(selectSecrets);
	const servEnv = useSelector((state) => selectServiceSelectedEnvironmentValue(state, endpoint.serviceId));
	const rootEnv = useSelector(selectSelectedEnvironmentValue);
	const envPairs = EnvironmentContextResolver.buildEnvironmentVariables({ secrets, servEnv, rootEnv }).toArray();
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
				<EditableData
					values={endpoint.baseHeaders}
					onChange={(baseHeaders) => update({ baseHeaders })}
					envPairs={envPairs}
				/>
			</TabPanel>
			<TabPanel value="queryParams">
				<EditableData
					values={endpoint.baseQueryParams}
					onChange={(baseQueryParams) => update({ baseQueryParams })}
					envPairs={envPairs}
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
