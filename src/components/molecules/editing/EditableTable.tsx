import { Badge, IconButton, useColorScheme } from '@mui/joy';
import { useState, useRef, useEffect } from 'react';
import { EMPTY_ENVIRONMENT, Environment } from '../../../types/application-data/application-data';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { SprocketTooltip } from '../../atoms/SprocketTooltip';
import { Editor, Monaco } from '@monaco-editor/react';
import { defaultEditorOptions } from '../../../managers/MonacoInitManager';
import { clamp } from '../../../utils/math';
import { safeJsonParse } from '../../../utils/functions';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';

import { FormatIcon } from '../../atoms/buttons/FormatIcon';
import { environmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import { CopyToClipboardButton } from '../../atoms/buttons/CopyToClipboardButton';
import { useSelector } from 'react-redux';
import { selectEnvironments, selectSelectedEnvironment } from '../../../state/active/selectors';
import { editor } from 'monaco-editor';

export type TableData<TID extends string | number> = {
	key: string;
	value: string;
	id: TID;
}[];

const tableDataToString = (tableData: TableData<number>, uniqueValues: boolean) => {
	const tdObject = {} as Record<string, string | string[]>;
	if (uniqueValues) {
		tableData.forEach((x) => {
			tdObject[x.key] = x.value;
		});
	} else {
		tableData.forEach((x) => {
			if (tdObject[x.key] == undefined) {
				tdObject[x.key] = [];
			}
			(tdObject[x.key] as string[])[x.id] = x.value;
		});

		Object.entries(tdObject).forEach(([key, value]) => {
			if (value.length === 1) {
				tdObject[key] = value[0];
			}
		});
	}

	return JSON.stringify(tdObject, null, 2);
};

const stringToTableData = (str: string, uniqueValues: boolean): TableData<number> | null => {
	const res = safeJsonParse<Record<string, string | string[]>>(str)[1];
	if (res == null) {
		return null;
	}
	if (uniqueValues) {
		const tableData: TableData<number> = [];
		for (const [key, value] of Object.entries(res)) {
			if (typeof value !== 'string') {
				return null;
			}
			tableData.push({ key, value, id: 0 });
		}
		return tableData;
	}
	const td = Object.entries(res).flatMap(([key, value]) => {
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
	return td;
};

interface EditableTableProps {
	tableData: TableData<number>;
	changeTableData: (id: number, newKey?: string, newValue?: string) => void;
	addNewData: (key: string, value: string) => void;
	setTableData: (newData: TableData<number>) => void;
	environment?: Environment;
	unique: boolean;
	fullSize?: boolean;
}
export function EditableTable(props: EditableTableProps) {
	const colorScheme = useColorScheme();
	const selectedMode = colorScheme.mode;
	const systemMode = colorScheme.systemMode;
	const resolvedMode = selectedMode === 'system' ? systemMode : selectedMode;
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const environments = useSelector(selectEnvironments);
	const environment =
		props.environment ?? (selectedEnvironment ? environments[selectedEnvironment as string] : EMPTY_ENVIRONMENT);
	const [editorText, setEditorText] = useState(tableDataToString(props.tableData, props.unique));
	const [backupEditorText, setBackupEditorText] = useState(editorText);
	const [runningTableData, setRunningTableData] = useState<TableData<number> | null>(props.tableData);
	const [hasChanged, setChanged] = useState(false);
	const [mode, setMode] = useState<'view' | 'edit'>('edit');
	const [copied, setCopied] = useState(false);
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const format = () => {
		if (editorRef.current != null) {
			editorRef.current.getAction('editor.action.formatDocument')?.run();
		}
	};
	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, _monaco: Monaco) => {
		editorRef.current = editor;
		format();
	};

	useEffect(() => {
		setEditorText(tableDataToString(props.tableData, props.unique));
		setChanged(false);
		setRunningTableData(props.tableData);
	}, [props.tableData]);

	const getEnvParsedRunningTableData = () => {
		if (runningTableData == null) {
			return 'null';
		}
		return tableDataToString(
			runningTableData.map((tdItem) => ({
				key: environmentContextResolver
					.parseStringWithEnvironment(tdItem.key, environment)
					.map((x) => x.value)
					.join(''),
				value: environmentContextResolver
					.parseStringWithEnvironment(tdItem.value, environment)
					.map((x) => x.value)
					.join(''),
				id: tdItem.id,
			})),
			props.unique,
		);
	};

	return (
		<>
			<SprocketTooltip text={`Switch to ${mode === 'edit' ? 'View' : 'Edit'} Mode`}>
				<IconButton
					disabled={runningTableData == null}
					onClick={() => {
						if (mode === 'edit') {
							setMode('view');
							setBackupEditorText(editorText);
							setEditorText(getEnvParsedRunningTableData());
							editorRef.current?.updateOptions({ readOnly: true });
						} else {
							setMode('edit');
							setEditorText(backupEditorText);
							editorRef.current?.updateOptions({ readOnly: false });
							editorRef.current?.setValue(backupEditorText);
						}
					}}
				>
					{mode === 'edit' ? <VisibilityIcon /> : <EditIcon />}
				</IconButton>
			</SprocketTooltip>
			<CopyToClipboardButton copied={copied} setCopied={setCopied} text={editorText} />
			<FormatIcon actionFunction={() => format()} />
			<SprocketTooltip text="Clear Changes">
				<IconButton
					disabled={!hasChanged}
					onClick={() => {
						setEditorText(tableDataToString(props.tableData, props.unique));
						setChanged(false);
						setRunningTableData(props.tableData);
						format();
					}}
				>
					<CancelIcon />
				</IconButton>
			</SprocketTooltip>
			<SprocketTooltip text="Save Changes">
				<IconButton
					disabled={!hasChanged || runningTableData == null}
					onClick={() => {
						const tableData = stringToTableData(editorText, props.unique);
						if (tableData != null) {
							props.setTableData(tableData);
							setChanged(false);
						}
					}}
				>
					<Badge invisible={!hasChanged || runningTableData == null} color="primary">
						<SaveIcon></SaveIcon>
					</Badge>
				</IconButton>
			</SprocketTooltip>
			<Editor
				height={props.fullSize ? '100%' : `${clamp((props.tableData.length + 2) * 3, 10, 40)}vh`}
				value={editorText}
				onChange={(value) => {
					if (value != editorText) {
						setEditorText(value ?? '');
						setChanged(true);
						setRunningTableData(value ? stringToTableData(value, props.unique) : null);
					}
				}}
				language={'json'}
				theme={resolvedMode === 'dark' ? 'vs-dark' : resolvedMode}
				options={defaultEditorOptions}
				onMount={handleEditorDidMount}
			/>
		</>
	);
}
