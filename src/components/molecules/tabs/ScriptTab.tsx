import { useSelector } from 'react-redux';
import { selectScript } from '../../../state/active/selectors';
import { useAppDispatch } from '../../../state/store';
import { EditableText } from '../../atoms/EditableText';
import { TabProps } from './tab-props';

export function ScriptTab({ id }: TabProps) {
	const script = useSelector((state) => selectScript(state, id));
	const dispatch = useAppDispatch();
	return (
		<>
			<EditableText
				text={script.name}
				setText={(newText: string) => undefined}
				isValidFunc={(text: string) => text.length >= 1}
				isTitle
			/>
		</>
	);
}
