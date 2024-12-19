import { SelectOption } from '@/components/shared/SprocketSelect/GroupedOptions';
import { SprocketSelect } from '@/components/shared/SprocketSelect/SprocketSelect';
import { WorkspaceItem } from '@/types/data/workspace';
import { Stack } from '@mui/joy';

export enum OrphanResolution {
	revive = 'revive',
	create = 'create',
	delete = 'delete',
	assign = 'assign',
	none = 'none',
}

interface OrphanResolutionDropdownProps {
	name: string;
	parent?: WorkspaceItem;
	parentType: string;
	adoptors: WorkspaceItem[];
	onChange: (id: string) => void;
	value: string;
}

export function OrphanResolutionDropdown({
	name,
	parent,
	parentType,
	adoptors,
	onChange,
	value,
}: OrphanResolutionDropdownProps) {
	const options: SelectOption<string>[] = [{ value: OrphanResolution.delete, label: `Discard ${name}` }];
	if (parent == null) {
		options.push({ value: OrphanResolution.create, label: `New ${parentType}`, group: 'Assign to' });
		options.push(...adoptors.map((adoptor) => ({ value: adoptor.id, label: adoptor.name, group: 'Assign to' })));
	} else {
		options.push({ value: OrphanResolution.revive, label: `Revive ${parent.name} ${parentType}` });
	}
	return (
		<Stack direction="row">
			{name}
			<SprocketSelect value={value} onChange={onChange} options={options}></SprocketSelect>
		</Stack>
	);
}

/**
import * as React from 'react';
import Select from '@mui/joy/Select';
import Option, { optionClasses } from '@mui/joy/Option';
import Chip from '@mui/joy/Chip';
import List from '@mui/joy/List';
import ListItemDecorator, {
  listItemDecoratorClasses,
} from '@mui/joy/ListItemDecorator';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import Typography from '@mui/joy/Typography';
import Check from '@mui/icons-material/Check';

export default function SelectGroupedOptions() {
  const group = {
    Land: ['Cat', 'Dog', 'Tiger', 'Reindeer', 'Raccoon'],
    Water: ['Dolphin', 'Flounder', 'Eel'],
    Air: ['Falcon', 'Winged Horse', 'Owl'],
  };
  const colors = {
    Land: 'neutral',
    Water: 'primary',
    Air: 'success',
  } as const;
  return (
    <Select
      placeholder="Choose your animal"
      slotProps={{
        listbox: {
          component: 'div',
          sx: {
            maxHeight: 240,
            overflow: 'auto',
            '--List-padding': '0px',
            '--ListItem-radius': '0px',
          },
        },
      }}
      sx={{ width: 240 }}
    >
      {Object.entries(group).map(([name, animals], index) => (
        <React.Fragment key={name}>
          {index !== 0 && <ListDivider role="none" />}
          <List
            aria-labelledby={`select-group-${name}`}
            sx={{ '--ListItemDecorator-size': '28px' }}
          >
            <ListItem id={`select-group-${name}`} sticky>
              <Typography level="body-xs" sx={{ textTransform: 'uppercase' }}>
                {name} ({animals.length})
              </Typography>
            </ListItem>
            {animals.map((anim) => (
              <Option
                key={anim}
                value={anim}
                label={
                  <React.Fragment>
                    <Chip
                      size="sm"
                      color={colors[name as keyof typeof group]}
                      sx={{ borderRadius: 'xs', mr: 1 }}
                    >
                      {name}
                    </Chip>{' '}
                    {anim}
                  </React.Fragment>
                }
                sx={{
                  [`&.${optionClasses.selected} .${listItemDecoratorClasses.root}`]:
                    {
                      opacity: 1,
                    },
                }}
              >
                <ListItemDecorator sx={{ opacity: 0 }}>
                  <Check />
                </ListItemDecorator>
                {anim}
              </Option>
            ))}
          </List>
        </React.Fragment>
      ))}
    </Select>
  );
} 




 */
