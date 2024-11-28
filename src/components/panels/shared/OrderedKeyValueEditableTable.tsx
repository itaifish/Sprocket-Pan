import { OrderedKeyValuePair } from '../../../types/application-data/application-data';
import { KeyValuePairUtils } from '../../../utils/data-utils';
import { EditableData, TableData } from '../../shared/input/EditableData';

interface OrderedKeyValueEditableTableProps {
	values: OrderedKeyValuePair;
	onChange: (values: OrderedKeyValuePair) => void;
	fullSize?: boolean;
}

export function OrderedKeyValueEditableTable({ values, onChange, fullSize }: OrderedKeyValueEditableTableProps) {
	const displayData = KeyValuePairUtils.toTableData(values);

	function setTableData(newData: TableData<number>) {
		onChange(newData.map((datum) => ({ value: datum.value, key: datum.key })));
	}

	return <EditableData tableData={displayData} setTableData={setTableData} unique={true} fullSize={fullSize} />;
}
