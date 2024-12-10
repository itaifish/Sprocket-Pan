import { Box, IconButton, Stack, Textarea } from '@mui/joy';
import { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import Markdown from 'react-markdown';
import { SprocketTooltip } from '../SprocketTooltip';
import { ModeEdit } from '@mui/icons-material';

interface EditableTextAreaProps {
	text: string;
	setText: (text: string) => void;
	isValidFunc: (text: string) => boolean;
}

export function EditableTextArea({ text, setText, isValidFunc }: EditableTextAreaProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [typingText, setTypingText] = useState(text);

	const isValid = isValidFunc(typingText);

	function toggleEditing() {
		if (isEditing) {
			if (isValid) {
				setText(typingText);
				setIsEditing(false);
			}
		} else {
			setTypingText(text);
			setIsEditing(true);
		}
	}

	useEffect(() => {
		setTypingText(text);
		setIsEditing(false);
	}, [text]);

	return (
		<Stack direction="row">
			<Stack sx={{ mt: '10px' }}>
				<SprocketTooltip text={isEditing ? 'Save' : 'Edit'}>
					<IconButton onClick={toggleEditing} disabled={isEditing && !isValid} size="sm">
						{isEditing ? <CheckIcon /> : <ModeEdit />}
					</IconButton>
				</SprocketTooltip>
				{isEditing && (
					<SprocketTooltip text="Cancel">
						<IconButton onClick={() => setIsEditing(false)} size="sm">
							<CancelIcon />
						</IconButton>
					</SprocketTooltip>
				)}
			</Stack>
			{isEditing ? (
				<Textarea
					sx={{ width: '100%', mt: '10px' }}
					variant="outlined"
					value={typingText}
					onChange={(e) => setTypingText(e.target.value)}
					error={!isValid}
				/>
			) : (
				<Box sx={{ px: '10px' }}>
					<Markdown>{text}</Markdown>
				</Box>
			)}
		</Stack>
	);
}
