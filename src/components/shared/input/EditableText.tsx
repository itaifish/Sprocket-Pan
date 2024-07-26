import { IconButton, Input, Typography, TypographyProps } from '@mui/joy';
import { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { keepStringLengthReasonable } from '../../../utils/string';
import { SprocketTooltip } from '../SprocketTooltip';
interface EditableTextProps {
	text: string;
	setText: (text: string) => void;
	isValidFunc: (text: string) => boolean;
	isTitle?: boolean;
}

export function EditableText({
	text,
	setText,
	isValidFunc,
	isTitle,
	...props
}: EditableTextProps & Partial<TypographyProps>) {
	const [isEditing, setIsEditing] = useState(false);
	const [typingText, setTypingText] = useState(text);
	const [isValid, setIsValid] = useState(true);
	useEffect(() => {
		setIsValid(isValidFunc(typingText));
	}, [typingText, isValidFunc]);
	return isEditing ? (
		<Input
			size={isTitle ? 'lg' : 'md'}
			sx={{
				maxWidth: isTitle ? '100%' : '600px',
				marginLeft: 'auto',
				marginRight: 'auto',
				width: isTitle ? '80%' : undefined,
			}}
			placeholder={isTitle ? `Enter your title here` : `${text}`}
			variant="outlined"
			value={typingText}
			onChange={(e) => setTypingText(e.target.value)}
			error={!isValid}
			endDecorator={
				<>
					<SprocketTooltip text="Cancel">
						<IconButton
							onClick={() => {
								setIsEditing(false);
							}}
							sx={{ marginRight: '2px' }}
						>
							<CancelIcon fontSize="large" />
						</IconButton>
					</SprocketTooltip>
					<SprocketTooltip text="Save">
						<IconButton
							onClick={() => {
								if (isValid) {
									setText(typingText);
									setIsEditing(false);
								}
							}}
							disabled={!isValid}
						>
							<CheckIcon fontSize="large" />
						</IconButton>
					</SprocketTooltip>
				</>
			}
		/>
	) : (
		<Typography
			level={isTitle ? `h2` : 'body-md'}
			sx={{ textAlign: 'center', ml: 'auto', mr: 'auto' }}
			onClick={() => {
				setTypingText(text);
				setIsEditing(true);
			}}
			{...props}
		>
			<SprocketTooltip text="Edit">
				<ModeEditIcon sx={{ verticalAlign: 'middle', pr: '5px' }} />
			</SprocketTooltip>
			{keepStringLengthReasonable(text, isTitle ? 100 : 30)}
		</Typography>
	);
}
