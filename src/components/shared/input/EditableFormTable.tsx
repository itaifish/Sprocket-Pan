import { IconButton, Input, Sheet, Table } from '@mui/joy';
import { useDebounce } from '../../../hooks/useDebounce';
import { useEffect, useState } from 'react';
import { SprocketTooltip } from '../SprocketTooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';

type Table = Record<string, string>;

const getTransformedData = (data: Table) =>
	Object.entries(data).map(([key, value]) => ({
		key,
		value,
	}));

const getUntransformedData = (data: ReturnType<typeof getTransformedData>) => {
	const result: Record<string, string> = {};
	data.forEach((kvp) => (result[kvp.key] = kvp.value));
	return result;
};

interface EditableFormTableProps {
	data: Table;
	setData: (data: Table) => void;
}

export function EditableFormTable({ data, setData }: EditableFormTableProps) {
	const [transformedData, setTransformedData] = useState(getTransformedData(data));
	const { localDataState, setLocalDataState } = useDebounce({ state: transformedData, setState: setTransformedData });
	const dataKeysCount = new Map();
	localDataState.forEach((kvp) => dataKeysCount.set(kvp.key, 1 + (dataKeysCount.get(kvp.key) ?? 0)));
	useEffect(() => {
		const newData = getTransformedData(data);
		const saveFunc = () => {
			setTransformedData(newData);
		};
		if (newData.length !== transformedData.length) {
			saveFunc();
			return;
		}
		for (let i = 0; i < newData.length; i++) {
			if (newData[i].key !== transformedData[i].key || newData[i].value !== transformedData[i].value) {
				saveFunc();
				return;
			}
		}
	}, [data]);

	useEffect(() => {
		for (const kvp of transformedData) {
			if (kvp.key.length <= 1 || dataKeysCount.get(kvp.key) > 1) {
				return;
			}
		}
		const untransformed = getUntransformedData(transformedData);
		setData(untransformed);
	}, [transformedData]);

	return (
		<Sheet>
			<Table>
				<thead>
					<tr>
						<th style={{ maxWidth: '45%' }}>Name</th>
						<th style={{ width: '45%' }}>Value</th>
						<th style={{ width: '10%' }}></th>
					</tr>
				</thead>
				<tbody>
					{localDataState.map(({ key, value }, index) => (
						<tr key={index}>
							<td>
								<Input
									value={key}
									error={key === '' || dataKeysCount.get(key).length > 1}
									onChange={(e) => {
										setLocalDataState((localDataState) => {
											const newData = structuredClone(localDataState);
											newData[index].key = e.target.value;
											return newData;
										});
									}}
								></Input>
							</td>
							<td>
								<Input
									value={value}
									onChange={(e) => {
										setLocalDataState((localDataState) => {
											const newData = structuredClone(localDataState);
											newData[index].value = e.target.value;
											return newData;
										});
									}}
								></Input>
							</td>
							<td>
								<SprocketTooltip text="Delete Entry">
									<IconButton
										color="danger"
										variant="outlined"
										onClick={() => {
											setLocalDataState((localDataState) => {
												const newData = structuredClone(localDataState);
												delete newData[index];
												return newData;
											});
										}}
									>
										<DeleteIcon />
									</IconButton>
								</SprocketTooltip>
							</td>
						</tr>
					))}
				</tbody>
				<SprocketTooltip text="Add New Entry">
					<IconButton
						onClick={() => setLocalDataState((localDataState) => [...localDataState, { key: '', value: '' }])}
					>
						<AddBoxIcon />
					</IconButton>
				</SprocketTooltip>
			</Table>
		</Sheet>
	);
}
