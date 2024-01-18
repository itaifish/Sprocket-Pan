import { Badge, IconButton, Tooltip, useColorScheme } from '@mui/joy';
import { useState, useContext, useRef, useEffect } from 'react';
import { Environment } from '../../../types/application-data/application-data';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { ApplicationDataContext } from '../../../managers/GlobalContextManager';
import { SprocketTooltip } from '../../atoms/SprocketTooltip';
import { Editor, Monaco } from '@monaco-editor/react';
import { defaultEditorOptions } from '../../../managers/MonacoInitManager';
import { clamp } from '../../../utils/math';
import { safeJsonParse } from '../../../utils/functions';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { FormatIcon } from '../../atoms/buttons/FormatIcon';

export type TableData<TID extends string | number> = {
	key: string;
	value: string;
	id: TID;
}[];

const tableDataToString = (tableData: TableData<number>) => {
	const tdObject = {} as Record<string, string | string[]>;
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
	return JSON.stringify(tdObject, null, 2);
};

const stringToTableData = (str: string) => {
	const res = safeJsonParse<Record<string, string | string[]>>(str)[1];
	if (res == null) {
		return null;
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
}
export function EditableTable(props: EditableTableProps) {
	const colorScheme = useColorScheme();
	const selectedMode = colorScheme.mode;
	const systemMode = colorScheme.systemMode;
	const resolvedMode = selectedMode === 'system' ? systemMode : selectedMode;
	const data = useContext(ApplicationDataContext);
	const environment =
		props.environment ??
		(data.selectedEnvironment ? data.environments[data.selectedEnvironment as string] : ({} as Environment));
	const [editorText, setEditorText] = useState(tableDataToString(props.tableData));
	const [runningTableData, setRunningTableData] = useState<TableData<number> | null>(props.tableData);
	const [hasChanged, setChanged] = useState(false);
	const [mode, setMode] = useState<'view' | 'edit'>('edit');
	const [copied, setCopied] = useState(false);
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
		setEditorText(tableDataToString(props.tableData));
		setChanged(false);
		setRunningTableData(props.tableData);
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
			<SprocketTooltip text={'Copy to clipboard'} disabled={copied}>
				<Tooltip title="✓ Copied to clipboard!" arrow open={copied} placement="right" color="primary">
					<IconButton
						disabled={copied}
						onClick={() => {
							setCopied(true);
							setTimeout(() => {
								setCopied(false);
							}, 800);
							navigator.clipboard.writeText(editorText);
						}}
					>
						<ContentCopyIcon />
					</IconButton>
				</Tooltip>
			</SprocketTooltip>
			<FormatIcon actionFunction={() => format()} />
			<SprocketTooltip text="Clear Changes">
				<IconButton
					disabled={!hasChanged}
					onClick={() => {
						setEditorText(tableDataToString(props.tableData));
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
						const tableData = stringToTableData(editorText);
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
				height={`${clamp((props.tableData.length + 2) * 3, 7, 33)}vh`}
				value={editorText}
				onChange={(value) => {
					setEditorText(value ?? '');
					setChanged(true);
					setRunningTableData(value ? stringToTableData(value) : null);
				}}
				language={'json'}
				theme={resolvedMode === 'dark' ? 'vs-dark' : resolvedMode}
				options={defaultEditorOptions}
				onMount={handleEditorDidMount}
			/>
		</>
	);
}
