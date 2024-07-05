import { ReactNode, useEffect, useRef } from 'react';
import { Editor, EditorProps, Monaco } from '@monaco-editor/react';
import { defaultEditorOptions } from '../../../managers/MonacoInitManager';
import { editor } from 'monaco-editor';
import { useEditorTheme } from '../../../hooks/useEditorTheme';
import { Box, Stack } from '@mui/joy';
import { EditorActions } from './EditorActions';

interface SprocketEditorProps extends Omit<EditorProps, 'onMount'> {
	ActionBarItems?: ReactNode;
	formatOnChange?: boolean;
}

export function SprocketEditor({
	ActionBarItems = <Box />,
	value,
	formatOnChange = false,
	...overrides
}: SprocketEditorProps) {
	const editorTheme = useEditorTheme();
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

	const format = async () => {
		if (editorRef.current != null) {
			if (overrides?.options?.readOnly) {
				editorRef.current.updateOptions({ readOnly: false });
				await editorRef.current.getAction('editor.action.formatDocument')?.run();
				editorRef.current?.updateOptions({ readOnly: true });
			} else {
				await editorRef.current.getAction('editor.action.formatDocument')?.run();
			}
		}
	};

	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, _monaco: Monaco) => {
		editorRef.current = editor;
		format();
	};

	useEffect(() => {
		if (overrides?.options != null) {
			editorRef.current?.updateOptions(overrides.options);
		}
	}, [overrides?.options]);

	useEffect(() => {
		if (formatOnChange) format();
	}, [value, editorRef.current, formatOnChange]);

	return (
		<Box>
			<Stack direction="row" justifyContent="space-between" alignItems="end">
				{ActionBarItems}
				<EditorActions copyText={value} format={format} />
			</Stack>
			<Editor
				language={'typescript'}
				theme={editorTheme}
				options={{ ...defaultEditorOptions, ...overrides?.options }}
				onMount={handleEditorDidMount}
				value={value}
				{...overrides}
			/>
		</Box>
	);
}
