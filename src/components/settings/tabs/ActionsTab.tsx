import { Box, Sheet, Stack, FormControl, FormLabel, Input, FormHelperText, Chip, Typography, Divider } from '@mui/joy';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import { iconFromTabType } from '../../../types/application-data/application-data';
import { ScriptChips } from '../ScriptChips';
import { SettingsTabProps } from './types';

export function ActionsTab({ settings, onChange }: SettingsTabProps) {
	return (
		<Stack spacing={3}>
			<Typography level="title-md">Requests</Typography>
			<FormControl sx={{ width: 300 }}>
				<FormLabel id="network-timeout-label" htmlFor="network-timeout-input">
					Network Call Timeout
				</FormLabel>
				<Input
					sx={{ width: 200 }}
					value={settings.request.timeoutMS / 1000}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						const value = +e.target.value;
						if (!isNaN(value)) {
							onChange({ request: { timeoutMS: value * 1000 } });
						}
					}}
					slotProps={{
						input: {
							id: 'network-timeout-input',
							// TODO: Material UI set aria-labelledby correctly & automatically
							// but Base UI and Joy UI don't yet.
							'aria-labelledby': 'network-timeout-label network-timeout-input',
						},
					}}
					startDecorator={<HourglassBottomIcon />}
					endDecorator={'Seconds'}
				/>
			</FormControl>
			<FormControl sx={{ width: 300 }}>
				<FormLabel id="maximum-history-label" htmlFor="maximum-history-input">
					Maximum Saved History Records
				</FormLabel>
				<Input
					sx={{ width: 200 }}
					value={settings.history.maxLength}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						const value = +e.target.value;
						if (!isNaN(value)) {
							onChange({ history: { maxLength: value } });
						}
					}}
					slotProps={{
						input: {
							id: 'maximum-history-input',
							// TODO: Material UI set aria-labelledby correctly & automatically
							// but Base UI and Joy UI don't yet.
							'aria-labelledby': 'maximum-history-label maximum-history-input',
						},
					}}
					startDecorator={<ManageHistoryIcon />}
					endDecorator={'Records'}
				/>
				<FormHelperText>Set this value as -1 for no maximum</FormHelperText>
			</FormControl>
			<Divider></Divider>
			<Typography level="title-md">Scripts</Typography>
			<FormControl sx={{ width: 300 }}>
				<FormLabel id="script-timeout-label" htmlFor="script-timeout-input">
					Script Timeout
				</FormLabel>
				<Input
					sx={{ width: 200 }}
					value={settings.script.timeoutMS / 1000}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						const value = +e.target.value;
						if (!isNaN(value)) {
							onChange({ script: { timeoutMS: value * 1000 } });
						}
					}}
					slotProps={{
						input: {
							id: 'script-timeout-input',
							// TODO: Material UI set aria-labelledby correctly & automatically
							// but Base UI and Joy UI don't yet.
							'aria-labelledby': 'script-timeout-label script-timeout-input',
						},
					}}
					startDecorator={<HourglassBottomIcon />}
					endDecorator={'Seconds'}
				/>
			</FormControl>
			<Box>
				<Typography>Script Execution Order</Typography>
				<Sheet variant="outlined" color="neutral" sx={{ padding: 4 }}>
					<ScriptChips
						prefix="pre"
						setStrategy={(pre) => onChange({ script: { strategy: { pre } } })}
						strategy={settings.script.strategy.pre}
					/>
					<Chip sx={{ verticalAlign: 'middle' }} color="primary" startDecorator={iconFromTabType['request']}>
						Request
					</Chip>
					<ScriptChips
						prefix="post"
						setStrategy={(post) => onChange({ script: { strategy: { post } } })}
						strategy={settings.script.strategy.post}
					/>
				</Sheet>
			</Box>
		</Stack>
	);
}
