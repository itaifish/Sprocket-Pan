import { Box, IconButton, Input, Stack, TypographyProps } from '@mui/joy';
import { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { SprocketTooltip } from '../SprocketTooltip';
import { EllipsisTypography } from '../EllipsisTypography';

export interface EditableTextProps extends Partial<TypographyProps> {
	text?: string;
	setText: (text: string) => void;
	isValidFunc?: (text: string) => boolean;
	size?: 'lg' | 'md' | 'sm';
}

const widths = {
	lg: '340px',
	md: '240px',
	sm: '140px',
} as const;

export function EditableText({
	text = '',
	setText,
	isValidFunc = (text) => text.length >= 1,
	sx,
	size = 'md',
	...props
}: EditableTextProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [typingText, setTypingText] = useState(text);

	const isValid = isValidFunc(text);

	const commitInput = () => {
		if (isValid) {
			setText(typingText);
			setIsEditing(false);
		}
	};

	const toggleEditing = () => {
		if (isEditing) {
			setIsEditing(false);
		} else {
			setTypingText(text);
			setIsEditing(true);
		}
	};

	useEffect(() => {
		setTypingText(text);
		setIsEditing(false);
	}, [text]);

	return (
		<Stack
			direction="row"
			maxWidth="calc(100% - 25px)"
			width="fit-content"
			alignItems="center"
			minHeight="2.5em"
			sx={{ position: 'relative', ...sx }}
		>
			{isEditing && (
				<Box width="100%" minWidth={widths[size]} sx={{ position: 'absolute', zIndex: 3 }}>
					<Input
						size={size}
						autoFocus
						fullWidth
						color="primary"
						variant="soft"
						placeholder={text}
						value={typingText}
						onChange={(e) => setTypingText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								commitInput();
							}
						}}
						error={!isValid}
						startDecorator={
							<SprocketTooltip text="Cancel">
								<IconButton sx={{ ml: '-10px' }} onClick={toggleEditing} size="sm">
									<CancelIcon />
								</IconButton>
							</SprocketTooltip>
						}
						endDecorator={
							<SprocketTooltip text="Save">
								<IconButton
									disabled={!isValid}
									color="success"
									variant="solid"
									sx={{ mr: '-10px' }}
									onClick={commitInput}
									size="sm"
								>
									<CheckIcon />
								</IconButton>
							</SprocketTooltip>
						}
					/>
				</Box>
			)}
			<Box>
				<SprocketTooltip text="Edit" sx={{ flexBasis: 0 }}>
					<IconButton onClick={toggleEditing} disabled={isEditing} size="sm">
						<ModeEditIcon />
					</IconButton>
				</SprocketTooltip>
			</Box>
			<Box position="relative" flexGrow={1} width="100%" minWidth={0} sx={{ opacity: isEditing ? 0 : 1 }}>
				<EllipsisTypography {...props}>{text}</EllipsisTypography>
			</Box>
		</Stack>
	);
}
