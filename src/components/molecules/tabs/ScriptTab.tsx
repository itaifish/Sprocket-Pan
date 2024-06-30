import { useSelector } from 'react-redux';
import { selectScript, selectScripts } from '../../../state/active/selectors';
import { useAppDispatch } from '../../../state/store';
import { EditableText } from '../../atoms/EditableText';
import { TabProps } from './tab-props';
import { updateScript } from '../../../state/active/slice';

export function ScriptTab({ id }: TabProps) {
	const script = useSelector((state) => selectScript(state, id));
	const scriptNames = new Set(Object.values(useSelector(selectScripts)).map((script) => script.name));
	const dispatch = useAppDispatch();
	return (
		<>
			<EditableText
				text={script.name}
				setText={(newText: string) => dispatch(updateScript({ name: newText, id }))}
				isValidFunc={(text: string) => text.length >= 1 && (!scriptNames.has(text) || text == script.name)}
				isTitle
			/>
		</>
	);
}
