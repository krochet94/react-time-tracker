import React, { useState } from 'react';
import { Grid, Button, Snackbar } from '@mui/material';
import { Google } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import HomeLogo from '../time-tracker-logo.png'
import { signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase-config';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vh',
        minHeight: '100vh',
        minWidth: '300px',
        backgroundColor: '#102E44',
        padding: '20px',
    },
    gridContainer: {
        display: 'flex',
        justifyContent: 'center'
    }, 
    snackbar: {
        minWidth: '50px'
    }
});

const Login = ({ provider }) => {
    const classes = useStyles();
    const [error, setError] = useState(false);
    
    const handleLogin = async () => {
        try {
            provider.setCustomParameters({
                prompt: 'select_account'
              });
              await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
            setError(true);
        }
    }

    return (
        <Grid container className={classes.container}>
            <Grid item xs={12} className={classes.gridContainer}>
                <img src={HomeLogo} alt="Home Logo" style={{ maxWidth: '70vw' }}></img>
            </Grid>
            <Grid item xs={12} className={classes.gridContainer}>
                <Button variant="contained" color="primary" startIcon={<Google />} onClick={handleLogin}>
                    Sign in with Google
                </Button>
            </Grid>
            <Snackbar
                open={error}
                autoHideDuration={3000}
                onClose={() => setError(false)}
                className={classes.snackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                message='Login Failed'
            />
        </Grid>
    );
};
export default Login;