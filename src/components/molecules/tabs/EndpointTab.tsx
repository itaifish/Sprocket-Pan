import { useContext } from 'react';
import { ApplicationDataContext, TabsContext } from '../../../App';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { EditableText } from '../../atoms/EditableText';
import { TabProps } from './TabContent';
import { Button, Grid, Select, Stack, Option, Input } from '@mui/joy';
import { environmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import { RESTfulRequestVerbs } from '../../../types/application-data/application-data';
import { verbColors } from '../../../utils/style';
import LabelIcon from '@mui/icons-material/Label';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { EndpointEditTabs } from './endpoint/EndpointEditTabs';
import { tabsManager } from '../../../managers/TabsManager';

export function EndpointTab(props: TabProps) {
	const data = useContext(ApplicationDataContext);
	const tabsContext = useContext(TabsContext);
	const endpointData = data.endpoints[props.id];
	const serviceData = data.services[endpointData.serviceId];

	if (endpointData == null || serviceData == null) {
		return <>Endpoint data not found</>;
	}
	return (
		<>
			<EditableText
				text={endpointData.name}
				setText={(newText: string) => applicationDataManager.update('endpoint', props.id, { name: newText })}
				isValidFunc={(text: string) => text.length >= 1}
				isTitle
			/>
			<Grid container spacing={2} sx={{ paddingTop: '30px' }} alignItems="center" justifyContent={'center'}>
				<Grid xs={2}>
					<Select
						value={endpointData.verb}
						startDecorator={<LabelIcon />}
						color={verbColors[endpointData.verb]}
						variant="soft"
						onChange={(_e, newVerb) => {
							if (newVerb) {
								applicationDataManager.update('endpoint', props.id, { verb: newVerb });
							}
						}}
					>
						{RESTfulRequestVerbs.map((verb, index) => (
							<Option key={index} value={verb} color={verbColors[verb]}>
								{verb}
							</Option>
						))}
					</Select>
				</Grid>
				<Grid xs={8}>
					<Input
						startDecorator={environmentContextResolver.stringWithVarsToTypography(
							serviceData.baseUrl || 'unknown',
							data,
							serviceData.id,
							undefined,
							{ variant: 'outlined', color: 'primary' },
						)}
						value={endpointData.url}
						onChange={(e) => {
							applicationDataManager.update('endpoint', props.id, { url: e.target.value });
						}}
						color="primary"
					></Input>
				</Grid>
				<Grid xs={2}>
					<Stack direction={'row'} spacing={2}>
						<Button
							color="primary"
							startDecorator={<ExitToAppIcon />}
							disabled={!endpointData.defaultRequest}
							onClick={() => {
								if (endpointData.defaultRequest) {
									tabsManager.selectTab(tabsContext, endpointData.defaultRequest, 'request');
								}
							}}
						>
							Jump To Request
						</Button>
					</Stack>
				</Grid>
			</Grid>
			<EndpointEditTabs endpoint={endpointData} />
		</>
	);
}
