import { useState, useRef, useEffect } from 'react';
import { Constants } from '../../../utils/constants';
import { SprocketEditor } from '../../shared/input/SprocketEditor';

interface RequestScriptProps {
	scriptText: string | undefined;
	scriptKey: 'preRequestScript' | 'postRequestScript';
	updateScript: (scriptText: string) => void;
}

export function RequestScript(props: RequestScriptProps) {
	const [editorText, setEditorText] = useState(props.scriptText ?? '');
	const latestText = useRef(editorText);

	useEffect(() => {
		const delayDebounceFunc = setTimeout(() => {
			props.updateScript(latestText.current);
		}, Constants.debounceTimeMS);

		return () => clearTimeout(delayDebounceFunc);
	}, [latestText.current]);

	return (
		<SprocketEditor
			height={'55vh'}
			value={editorText}
			onChange={(value) => {
				setEditorText(value ?? '');
				latestText.current = value ?? '';
			}}
			language={'typescript'}
		/>
	);
}
