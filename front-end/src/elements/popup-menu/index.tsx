import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import './index.css'

export default function BasicMenu({ el, handleMenuPopup }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(el);
  let open = Boolean(anchorEl);

  return (
    <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={(e: React.MouseEvent<any>) => handleMenuPopup(null)}>Sort by first name</MenuItem>
        <MenuItem onClick={(e: React.MouseEvent<any>) => handleMenuPopup(null)}>Sort by last name</MenuItem>
    </Menu>
  );
}