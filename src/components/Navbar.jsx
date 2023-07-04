import React from 'react';
import { AppBar, Box, Toolbar, Typography, Button, IconButton } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase-config';

const Navbar = () => {
  return (
    <Box sx={{ flexGrow: 1, minWidth: '450px' }}>
      <AppBar position="static" style={{backgroundColor: '#102E44'}}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit" 
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <AccessTimeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Time Tracker
          </Typography>
          <Button color="inherit" onClick={() => signOut(auth)}>Logout</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
