import { EditableData, TableData } from '../../shared/input/EditableData';
import { EnvironmentEditableTableSettings } from './EnvironmentEditableTable';

interface KeyValueEditableTableProps extends EnvironmentEditableTableSettings {
	values: Record<string, string>;
	onChange: (values: Record<string, string>) => void;
}

export function KeyValueEditableTable({ values, onChange, ...props }: KeyValueEditableTableProps) {
	const displayData = Object.entries(values ?? []).map((datum, index) => ({
		key: datum[0],
		value: datum[1],
		id: index,
	}));

	function setTableData(newData: TableData<number>) {
		onChange(Object.fromEntries(newData.map((datum) => [datum.key, datum.value])));
	}

	return <EditableData tableData={displayData} setTableData={setTableData} unique={true} {...props} />;
}
