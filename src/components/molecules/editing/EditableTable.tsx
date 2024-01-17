import { Card, IconButton, Input, Stack, useColorScheme } from '@mui/joy';
import { useState, useContext, useRef } from 'react';
import { log } from '../../../utils/logging';
import { Environment } from '../../../types/application-data/application-data';
import { environmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { ApplicationDataContext } from '../../../managers/GlobalContextManager';
import { SprocketTooltip } from '../../atoms/SprocketTooltip';
import { Editor, Monaco } from '@monaco-editor/react';
import { defaultEditorOptions } from '../../../managers/MonacoInitManager';
import { clamp } from '../../../utils/math';
import { safeJsonParse } from '../../../utils/functions';

export type TableData<TID extends string | number> = {
	key: string;
	value: string;
	id: TID;
}[];

const tableDataToString = <TID extends string | number>(tableData: TableData<TID>) => {
	return JSON.stringify(
		tableData
			.map((x) => ({ [x.key]: x.value }))
			.reduce((prev, acc) => ({ ...acc, ...prev }), {} as Record<string, string>),
	);
};

const stringToTableData = <TID extends string | number>(str: string) => {
	return safeJsonParse<TableData<TID>>(str)[1];
};

interface EditableTableProps<TID extends string | number> {
	tableData: TableData<TID>;
	changeTableData: (id: TID, newKey?: string, newValue?: string) => void;
	addNewData: (key: string, value: string) => void;
	setTableData: (newData: TableData<TID>) => void;
	environment?: Environment;
}
export function EditableTable<TID extends string | number>(props: EditableTableProps<TID>) {
	const colorScheme = useColorScheme();
	const selectedMode = colorScheme.mode;
	const systemMode = colorScheme.systemMode;
	const resolvedMode = selectedMode === 'system' ? systemMode : selectedMode;
	const [newRowValueText, setNewRowValueText] = useState('');
	const [selected, setSelected] = useState<string | null>(null);
	const data = useContext(ApplicationDataContext);
	const environment =
		props.environment ??
		(data.selectedEnvironment ? data.environments[data.selectedEnvironment as string] : ({} as Environment));
	const [editorText, setEditorText] = useState(tableDataToString(props.tableData));
	const latestText = useRef(editorText);
	const [mode, setMode] = useState<'view' | 'edit'>('edit');
	const editorRef = useRef<any>(null);
	const format = () => {
		if (editorRef.current) {
			editorRef.current.getAction('editor.action.formatDocument').run();
		}
	};
	const handleEditorDidMount = (editor: any, _monaco: Monaco) => {
		editorRef.current = editor;
		format();
	};

	return (
		<>
			<SprocketTooltip text={`Switch to ${mode === 'edit' ? 'View' : 'Edit'} Mode`}>
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
			</SprocketTooltip>
			<Editor
				height={`${clamp(props.tableData.length * 3, 3, 21)}vh`}
				value={editorText}
				onChange={(value) => {
					setEditorText(value ?? '');
					latestText.current = value ?? '';
					if (value == undefined) {
						return;
					}
					const tableData = stringToTableData<TID>(value);
					if (tableData == null) {
						return;
					}
					props.setTableData(tableData);
				}}
				language={'json'}
				theme={resolvedMode === 'dark' ? 'vs-dark' : resolvedMode}
				options={defaultEditorOptions}
				onMount={handleEditorDidMount}
			/>
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
										{environmentContextResolver.stringWithEnvironmentToTypography(
											tableData.key,
											environment,
											data.settings.displayVariableNames,
											{
												fontSize: 14,
											},
										)}
									</Card>
									<Card
										variant="outlined"
										color={'neutral'}
										sx={{
											'--Card-padding': '6px',
											width: '50%',
										}}
									>
										{environmentContextResolver.stringWithEnvironmentToTypography(
											tableData.value ?? '',
											environment,
											data.settings.displayVariableNames,
											{
												fontSize: 14,
											},
										)}
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
