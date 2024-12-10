import { IconButton } from '@mui/joy';
import { KeyValuePair } from '../../../classes/OrderedKeyValuePairs';
import { Environment } from '../../../types/application-data/application-data';
import { EditableData } from '../../shared/input/EditableData';
import { EditableText } from '../../shared/input/EditableText';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { Delete, FileCopy, RadioButtonChecked, RadioButtonUnchecked } from '@mui/icons-material';

import { useEffect, useState } from 'react';
import { AreYouSureModal } from '../../shared/modals/AreYouSureModal';

interface EnvironmentEditorProps {
	serviceId: string;
	env: Environment;
	envPairs: KeyValuePair[];
	onChange: (values: Partial<Environment>) => void;
	onDelete: () => void;
	onClone: (values: Partial<Environment>) => void;
	selected: boolean;
	toggleSelected: (() => void) | null;
}

export function EnvironmentEditor({
	env,
	envPairs,
	onChange,
	onDelete,
	onClone,
	selected,
	toggleSelected,
}: EnvironmentEditorProps) {
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	// start Editor bug workaround
	const [isForcedRerender, setIsForcedRerender] = useState(false);
	useEffect(() => {
		setIsForcedRerender(true);
	}, [env.id, envPairs]);
	useEffect(() => {
		if (isForcedRerender) setIsForcedRerender(false);
	}, [isForcedRerender]);
	if (isForcedRerender) return null;
	// end Editor bug workaround

	return (
		<>
			<EditableData
				actions={{
					middle: (
						<EditableText
							text={env.name}
							setText={(name) => onChange({ name })}
							isValidFunc={(text) => text !== ''}
							color={selected ? 'primary' : 'neutral'}
						/>
					),
					start: (
						<>
							{toggleSelected != null && (
								<SprocketTooltip text={selected ? 'Unselect' : 'Select'}>
									<IconButton onClick={toggleSelected}>
										{selected ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
									</IconButton>
								</SprocketTooltip>
							)}
							<SprocketTooltip text="Duplicate">
								<IconButton onClick={() => onClone(env)}>
									<FileCopy />
								</IconButton>
							</SprocketTooltip>
							<SprocketTooltip text="Delete">
								<IconButton onClick={() => setIsDeleteModalOpen(true)}>
									<Delete />
								</IconButton>
							</SprocketTooltip>
						</>
					),
				}}
				initialValues={env.pairs}
				onChange={(pairs) => onChange({ pairs })}
				envPairs={envPairs}
			/>
			<AreYouSureModal
				open={isDeleteModalOpen}
				action={`delete ${env.name ?? env.id}`}
				actionFunc={onDelete}
				closeFunc={() => setIsDeleteModalOpen(false)}
			></AreYouSureModal>
		</>
	);
}
