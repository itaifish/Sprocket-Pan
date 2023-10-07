import { IconButton, Input, Typography } from '@mui/joy';
import { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { keepStringLengthReasonable } from '../../utils/string';

interface EditableTitleProps {
	titleText: string;
	setTitleText: (text: string) => void;
	isValidFunc: (text: string) => boolean;
}

export function EditableTitle(props: EditableTitleProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [typingText, setTypingText] = useState(props.titleText);
	const [isValid, setIsValid] = useState(true);
	useEffect(() => {
		setIsValid(props.isValidFunc(typingText));
	}, [typingText, props.isValidFunc]);
	return isEditing ? (
		<Input
			size="lg"
			sx={{ maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}
			placeholder={'Enter your title here'}
			variant="outlined"
			value={typingText}
			onChange={(e) => setTypingText(e.target.value)}
			error={!isValid}
			endDecorator={
				<>
					<IconButton
						onClick={() => {
							setIsEditing(false);
						}}
						sx={{ marginRight: '2px' }}
					>
						<CancelIcon fontSize="large" />
					</IconButton>
					<IconButton
						onClick={() => {
							if (isValid) {
								props.setTitleText(typingText);
								setIsEditing(false);
							}
						}}
						disabled={!isValid}
					>
						<CheckIcon fontSize="large" />
					</IconButton>
				</>
			}
		/>
	) : (
		<Typography
			level="h2"
			sx={{ textAlign: 'center' }}
			onClick={() => {
				setTypingText(props.titleText);
				setIsEditing(true);
			}}
		>
			{keepStringLengthReasonable(props.titleText, 100)}
		</Typography>
	);
}
