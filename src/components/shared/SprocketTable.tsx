import { Table, TableProps, useTheme } from '@mui/joy';

type SprocketTableRow = Record<string, React.ReactNode> & { key: string };

type ColumnInfo<T extends SprocketTableRow> = {
	key: Exclude<keyof T, symbol | 'key'>;
	style?: React.CSSProperties;
	label?: React.ReactNode;
	sort?: () => void;
};

interface SprocketTableProps<T extends SprocketTableRow> extends TableProps {
	columns: ColumnInfo<T>[];
	data: T[];
}

export function SprocketTable<T extends SprocketTableRow>({ data, columns, ...props }: SprocketTableProps<T>) {
	const showHeader = columns.some((header) => header.label != null);
	const theme = useTheme();
	return (
		<Table variant="outlined" {...props}>
			{showHeader && (
				<thead style={{ backgroundColor: theme.palette.background.level1 }}>
					<tr>
						{columns.map((column) => (
							<td key={column.key}>
								<strong>{column.label}</strong>
							</td>
						))}
					</tr>
				</thead>
			)}
			<tbody>
				{data.map(({ key, ...row }) => (
					<tr key={key}>
						{columns.map((column) => (
							<td key={`${key}-${column.key}`} style={column.style}>
								{row[column.key]}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</Table>
	);
}
