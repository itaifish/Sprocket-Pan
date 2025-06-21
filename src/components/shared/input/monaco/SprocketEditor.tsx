import { ReactNode, useEffect, useRef } from 'react';
import { Editor, EditorProps } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { Box, Stack } from '@mui/joy';
import { EditorActions } from './EditorActions';
import { useEditorTheme } from '@/hooks/useEditorTheme';
import { defaultEditorOptions } from '@/managers/monaco/MonacoInitManager';

type SprocketEditorProps = Omit<EditorProps, 'onMount'> & {
	ActionBarItems?: ReactNode;
	formatOnChange?: boolean;
};

export function SprocketEditor({
	ActionBarItems = <Box />,
	formatOnChange = false,
	options,
	value,
	height = '100%',
	...overrides
}: SprocketEditorProps) {
	const combinedOptions = { ...defaultEditorOptions, ...options };
	const editorTheme = useEditorTheme();
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

	const format = async () => {
		if (editorRef.current != null) {
			const current = editorRef.current;
			const action = () => current.getAction('editor.action.formatDocument')?.run();
			if (options?.readOnly) {
				current.updateOptions({ ...combinedOptions, readOnly: false });
				await action();
				current.updateOptions({ ...combinedOptions, readOnly: true });
			} else {
				await action();
			}
		}
	};

	useEffect(() => {
		if (options != null) {
			editorRef.current?.updateOptions(combinedOptions);
		}
	}, [combinedOptions]);

	useEffect(() => {
		if (formatOnChange) {
			format();
		}
	}, [value, editorRef.current, formatOnChange]);

	return (
		<Box height={height}>
			<Stack direction="row" justifyContent="space-between" alignItems="end">
				{ActionBarItems}
				<EditorActions copyText={value} format={format} />
			</Stack>
			<Editor
				language="typescript"
				theme={editorTheme}
				options={combinedOptions}
				onMount={(editor) => {
					editorRef.current = editor;
					format();
				}}
				value={value}
				{...overrides}
			/>
		</Box>
	);
}
