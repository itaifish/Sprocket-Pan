import { CopyToClipboardButton } from '@/components/shared/buttons/CopyToClipboardButton';
import { HoverDecorator } from '@/components/shared/HoverDecorator';
import { SprocketTable } from '@/components/shared/SprocketTable';
import { BREAK_ALL_TEXT } from '@/styles/text';
import { KeyValuePair } from '@/types/shared/keyValues';
import { toKeyValuePairs } from '@/utils/application';
import { Box, Typography } from '@mui/joy';

interface HeadersDisplayTableProps {
	headers?: KeyValuePair[] | null | Record<string, string>;
	label: 'request' | 'response';
	title?: string | null;
}

export function HeadersDisplayTable({ headers, label, title = 'Headers' }: HeadersDisplayTableProps) {
	if (headers == null) return <></>;
	headers = Array.isArray(headers) ? headers : toKeyValuePairs(headers);
	if (headers.length === 0) return <></>;
	return (
		<>
			{title != null && <Typography level="title-md">{title}</Typography>}
			<SprocketTable
				aria-label={`${label} Headers Table`}
				sx={{ overflowWrap: 'break-word' }}
				columns={[
					{ key: 'headerKey', label: 'Key', style: { width: '30%' } },
					{ key: 'value', label: 'Value' },
				]}
				data={headers.map(({ key, value }) => ({
					key,
					headerKey: key,
					value: (
						<HoverDecorator
							startDecorator={
								value != null && (
									<Box height="1.5em" width="0">
										<CopyToClipboardButton size="sm" copyText={value} />
									</Box>
								)
							}
							sx={BREAK_ALL_TEXT}
						>
							{value}
						</HoverDecorator>
					),
				}))}
			/>
		</>
	);
}
