import { Card, IconButton, Input, Stack } from '@mui/joy';
import { useState, useContext } from 'react';
import { log } from '../../../utils/logging';
import { Environment } from '../../../types/application-data/application-data';
import { environmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { ApplicationDataContext } from '../../../managers/GlobalContextManager';

interface EditableTableProps {
	tableData: {
		key: string;
		value: string;
		id: string;
	}[];
	changeTableData: (id: string, newKey?: string, newValue?: string) => void;
	addNewData: (key: string, value: string) => void;
	environment?: Environment;
}
export function EditableTable(props: EditableTableProps) {
	const [newRowValueText, setNewRowValueText] = useState('');
	const [selected, setSelected] = useState<string | null>(null);
	const data = useContext(ApplicationDataContext);
	const environment =
		props.environment ?? data.selectedEnvironment
			? data.environments[data.selectedEnvironment as string]
			: ({} as Environment);
	const [mode, setMode] = useState<'view' | 'edit'>('edit');
	return (
		<>
			<IconButton
				onClick={() => {
					if (mode === 'edit') {
						setMode('view');
					} else {
						setMode('edit');
					}
				}}
			>
				{mode === 'edit' ? <VisibilityIcon /> : <EditIcon />}
			</IconButton>
			{props.tableData.map((tableData, index) => {
				return (
					<div key={index}>
						<Stack direction={'row'}>
							{mode === 'edit' ? (
								<>
									<Input
										id={`table_${tableData.id}`}
										size="sm"
										value={tableData.key}
										autoFocus={selected === tableData.key}
										onChange={(e) => {
											setSelected(e.target.value);
											props.changeTableData(tableData.id, e.target.value);
											log.info(`Setting table data: "${e.target.value}"`);
										}}
										sx={{ width: '50%' }}
									/>
									<Input
										size="sm"
										value={tableData.value}
										onChange={(e) => props.changeTableData(tableData.id, undefined, e.target.value)}
										sx={{ width: '50%' }}
									/>
								</>
							) : (
								<>
									<Card
										variant="outlined"
										color={'neutral'}
										sx={{
											'--Card-padding': '6px',
											width: '50%',
										}}
									>
										{environmentContextResolver.stringWithEnvironmentToTypography(tableData.key, environment, {
											fontSize: 14,
										})}
									</Card>
									<Card
										variant="outlined"
										color={'neutral'}
										sx={{
											'--Card-padding': '6px',
											width: '50%',
										}}
									>
										{environmentContextResolver.stringWithEnvironmentToTypography(tableData.value ?? '', environment, {
											fontSize: 14,
										})}
									</Card>
								</>
							)}
						</Stack>
					</div>
				);
			})}
			<Stack direction={'row'}>
				{mode === 'edit' && (
					<>
						<Input
							size="sm"
							value={''}
							onChange={(e) => {
								setSelected(e.target.value);
								props.addNewData(e.target.value, newRowValueText);
								setNewRowValueText('');
							}}
							sx={{ width: '50%' }}
						/>
						<Input
							size="sm"
							value={newRowValueText}
							onChange={(e) => setNewRowValueText(e.target.value)}
							sx={{ width: '50%' }}
						/>
					</>
				)}
			</Stack>
		</>
	);
}
