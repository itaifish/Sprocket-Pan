import { FileSystemDropdown } from './FileSystemDropdown';
import { FileSystemLeafProps } from './FileSystemLeaf';

interface FileSystemEntryProps extends Omit<FileSystemLeafProps, 'color'> {
	isSelected?: boolean;
}

export function FileSystemEntry({ children, id, menuOptions, isSelected = false }: FileSystemEntryProps) {
	return (
		<li
			id={`file_${id}`}
			style={{ display: 'flex' }}
			className={isSelected ? 'selected onHoverContainer' : 'onHoverContainer'}
		>
			{children}
			{menuOptions != null && (
				<div
					className="onHoverButton"
					style={{
						opacity: 0,
						transition: 'opacity 0.25s',
					}}
				>
					<FileSystemDropdown options={menuOptions} />
				</div>
			)}
		</li>
	);
}
