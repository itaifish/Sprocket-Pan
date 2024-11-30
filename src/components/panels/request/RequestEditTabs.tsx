import { AccordionGroup, Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { useState } from 'react';
import { RequestBody } from './RequestBody';
import { useSelector } from 'react-redux';
import { EnvironmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import {
	selectSecrets,
	selectSelectedEnvironmentValue,
	selectServiceSelectedEnvironmentValue,
	selectEndpointById,
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
	const secrets = useSelector(selectSecrets);
	const reqEnv = request.environmentOverride;
	const rootEnv = useSelector(selectSelectedEnvironmentValue);
	const endpoint = useSelector((state) => selectEndpointById(state, request.endpointId));
	const servEnv = useSelector((state) => selectServiceSelectedEnvironmentValue(state, endpoint.serviceId));
	const envPairs = EnvironmentContextResolver.buildEnvironmentVariables({
		reqEnv,
		secrets,
		rootEnv,
		servEnv,
	}).toArray();
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
				<EditableData values={request.headers} onChange={(values) => update({ headers: values })} envPairs={envPairs} />
			</TabPanel>
			<TabPanel value="queryParams">
				<EditableData
					values={request.queryParams}
					onChange={(queryParams) => update({ queryParams })}
					envPairs={envPairs}
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
					values={request.environmentOverride?.pairs ?? []}
					onChange={(pairs) => update({ environmentOverride: { ...request.environmentOverride, pairs } })}
					envPairs={envPairs}
				/>
			</TabPanel>
		</Tabs>
	);
}
