import { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { initMonaco, setMonacoInjectedTypeCode } from '../../../managers/monaco/MonacoInitManager';
import { selectScripts } from '../../../state/active/selectors';

export function MonacoListener() {
	const monaco = useMonaco();
	const scripts = useSelector(selectScripts);

	useEffect(() => {
		if (monaco) {
			initMonaco(monaco);
		}
	}, [monaco]);

	useEffect(() => {
		if (monaco) {
			setMonacoInjectedTypeCode(monaco, Object.values(scripts));
		}
	}, [monaco, scripts]);

	return <></>;
}
