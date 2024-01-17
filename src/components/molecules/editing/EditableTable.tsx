import { Card, IconButton, Input, Stack, useColorScheme } from '@mui/joy';
import { useState, useContext, useRef, useEffect } from 'react';
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
import { Constants } from '../../../utils/constants';

export type TableData<TID extends string | number> = {
	key: string;
	value: string;
	id: TID;
}[];

const tableDataToString = (tableData: TableData<number>) => {
	const tdObject = {} as Record<string, string | string[]>;
	tableData.forEach((x) => {
		if (tdObject[x.key] == undefined) {
			tdObject[x.key] = x.value;
		} else if (typeof tdObject[x.key] === 'string') {
			tdObject[x.key] = [];
			(tdObject[x.key] as string[])[x.id] = x.value;
		} else {
			(tdObject[x.key] as string[])[x.id] = x.value;
		}
	});
	return JSON.stringify(tdObject);
};

const stringToTableData = (str: string) => {
	const res = safeJsonParse<Record<string, string | string[]>>(str)[1];
	if (res == null) {
		return null;
	}
	return Object.entries(res).flatMap(([key, value]) => {
		if (typeof value === 'string') {
			return {
				key,
				value,
				id: 0,
			};
		} else {
			return value.map((valueItem, index) => ({
				key,
				value: valueItem,
				id: index,
			}));
		}
	});
};

interface EditableTableProps {
	tableData: TableData<number>;
	changeTableData: (id: number, newKey?: string, newValue?: string) => void;
	addNewData: (key: string, value: string) => void;
	setTableData: (newData: TableData<number>) => void;
	environment?: Environment;
}
export function EditableTable(props: EditableTableProps) {
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

	useEffect(() => {
		const delayDebounceFunc = setTimeout(() => {
			if (editorText == undefined) {
				return;
			}
			const tableData = stringToTableData(editorText);
			if (tableData == null) {
				return;
			}
			log.info('tableData');
			log.info(tableData);
			props.setTableData(tableData);
		}, Constants.debounceTimeMS);

		return () => clearTimeout(delayDebounceFunc);
	}, [editorText]);

	useEffect(() => {
		setEditorText((_oldText) => {
			const newText = tableDataToString(props.tableData);
			return newText;
		});
	}, [props.tableData]);

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
				height={`${clamp((props.tableData.length + 2) * 3, 7, 21)}vh`}
				value={editorText}
				onChange={(value) => {
					setEditorText(value ?? '');
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
