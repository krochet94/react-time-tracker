import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Grid, CircularProgress, Typography, IconButton, Container, TextField, Select, InputLabel, FormControl, MenuItem, Modal, Button, Box, Snackbar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { query, getDocs, collection, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase-config';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100vh',
        minWidth: '350px',
        paddingTop: '50px',
        paddingLeft: '10vw',
        paddingRight: '10vw',
        spacing: 2
    },
    gridContainer: {
        display: 'flex',
        justifyContent: 'center',
        width: '100vh',
        minWidth: '300px',
        marginTop: '10px',
        border: '1px solid #102E44',
    },
    gridInputContainer: {
        display: 'flex',
        justifyContent: 'center',
        width: '100vh',
        minWidth: '300px',
        marginTop: '10px',
        border: '1px solid #102E44',
        paddingTop: '10px',
        paddingBottom: '10px',
    },
    card: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInput: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px',
    },
    gridHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#102E44',
        color: 'whitesmoke',
        padding: '10px',
    },
    snackbar: {
        minWidth: '50px'
    },
    modal: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        boxShadow: 24,
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '10px'
    }
});

const TimeTracker = () => {
    const classes = useStyles();
    const isMounted = useRef(false);
    const uid = auth.currentUser.uid;
    const [tasks, setTasks] = useState({});
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortedWeek, setSortedWeek] = useState([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [tagName, setTagName] = useState('');
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [time, setTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const intervalRef = useRef(0);

    const timeConverter = (timeStamp) => {
        // convers timestamp to time HH:MM:SS
        const date = new Date(timeStamp * 1000);
        // Hours part from the timestamp
        const hours = date.getHours();
        // Minutes part from the timestamp
        const minutes = "0" + date.getMinutes();
        // Seconds part from the timestamp
        const seconds = "0" + date.getSeconds();

        const formattedTime = hours + ':' + minutes.slice(-2) + ':' + seconds.slice(-2);
        return formattedTime;
    };

    const totalTime = (week) => {
        // calculates total time for a week
        let total = 0;
        tasks[week].forEach((day) => {
            day.forEach((task) => {
                total += task.endTime - task.startTime;
            });
        });
        return (new Date(total * 1000).toISOString().slice(11, 19));
    };

    const currentTime = () => {
        return (new Date(time * 1000).toISOString().slice(11, 19));
    };

    const getData = useCallback(async () => {
        isMounted.current = true;
        // retrieves tasks and tags from database
        setLoading(true);
        // gets tasks data
        const tasksObj = {};
        const querySnapshot = await getDocs(query(collection(db, 'tasks')));
        querySnapshot.docs.map(doc => {
            const data = doc.data()
            if (data.user === 'all' || data.user === uid) {
                // group tasks by week then by day
                const day = new Date(data.endTime * 1000).getDay();
                const startOfWeek = (data.endTime - ( day * 24 * 60 * 60 )) * 1000;
                const endOfWeek = startOfWeek + ( 6 * 24 * 60 * 60 * 1000 );
                const startOfWeekStr = new Date(startOfWeek).toLocaleDateString();
                const endOfWeekStr = new Date(endOfWeek).toLocaleDateString();
                if (!tasksObj[`${startOfWeekStr}-${endOfWeekStr}`]) tasksObj[`${startOfWeekStr}-${endOfWeekStr}`] = new Array(7).fill([]);
                tasksObj[`${startOfWeekStr}-${endOfWeekStr}`][day] = [ ...tasksObj[`${startOfWeekStr}-${endOfWeekStr}`][day], {...data, id: doc.id} ];
            }
            return null;
        });
        
        const sortedWeekArray = Object.keys(tasksObj).sort((a, b) => {
            const aDate = new Date(a.split('-')[0]);
            const bDate = new Date(b.split('-')[0]);
            return bDate - aDate;
        });

        // gets tags data
        const tagsArray = [];
        const tagsQuerySnapshot = await getDocs(query(collection(db, 'tags')));
        tagsQuerySnapshot.docs.map(doc => {
            const data = doc.data()
            if (data.user === 'all' || data.user === uid) tagsArray.push({...data, id: doc.id});
            return null;
        });
        // sort tags by name
        tagsArray.sort((a, b) => a.name.localeCompare(b.name));
        if (isMounted.current) {
            setTasks(tasksObj);
            setTags(tagsArray);
            setSortedWeek(sortedWeekArray);
            setLoading(false);
            console.log(tasksObj);
            console.log(tagsArray);
        }
        return () => {
            isMounted.current = false;
        }
    }, [uid]);

    const addTag = async () => {
        const date = Date.now();
        setLoading(true);
        try {
            await addDoc(collection(db, 'tags'), {name: tagName, createdAt: date, user: uid});
            setOpenModal(false);
        } catch (error) {
            console.error(error);
            setError(true);
            setErrorMessage('Adding tag failed. Please try again.');
        } finally {
            getData();
            setLoading(false);
            setTagName('');
        }
        
    };

    const addTask = async () => {
        const date = Math.floor( Date.now() / 1000);
        setLoading(true);
        const tagObj = {
            name: newTaskName,
            user: uid,
            tag: selectedTag,
            startTime: startTime,
            endTime: date
        };
        try {
            await addDoc(collection(db, 'tasks'), tagObj);
            setIsActive(false);
            setNewTaskName('');
            setSelectedTag('');
            setTime(0);
            setStartTime(0);
        } catch (error) {
            console.error(error);
            setError(true);
            setErrorMessage('Adding task failed. Please try again.');
        } finally {
            getData();
            setLoading(false);
        }
    };

    const deleteTask = async (id) => {
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'tasks', id));
            getData();
        } catch (error) {
            console.error(error);
            setError(true);
            setErrorMessage('Deleting task failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, [getData]);

    useEffect(() => {
        if (isActive) {
          intervalRef.current = setTimeout(() => setTime(time + 1), 1000);
          return () => clearTimeout(intervalRef.current);
        }
      }, [time, isActive]);

  return (
    <Grid container className={classes.container}>
        <Container style={{marginTop: '30px', marginBottom: '30px'}}>
            <Grid container className={classes.gridInputContainer} columns={{ xs: 4, md: 12 }}>
                <Grid item xs={2} md={4} className={classes.cardInput}>
                    <TextField
                        label="Task Name"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                    />
                </Grid>
                <Grid item xs={2} md={3} className={classes.cardInput}>
                    <FormControl fullWidth>
                        <InputLabel id='tagLabel'>Tag</InputLabel>
                        <Select fullWidth value={selectedTag} labelId='tagLabel' label='Tag' onChange={(e) => setSelectedTag(e.target.value)}>
                            {tags.map((tag) => (
                                <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
                            ))}
                            <MenuItem value='' onClick={() => setOpenModal(true)}>+ Add Tag</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={3} md={4} className={classes.cardInput}>
                    {isActive ? (
                        <Grid container style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
                            <Typography noWrap>{currentTime()}</Typography>
                            <IconButton
                                size="large"
                                edge="start"
                                color="error" 
                                aria-label="menu"
                                onClick={addTask}
                            >
                                <StopIcon />
                            </IconButton>
                        </Grid>
                    ) : (
                        <IconButton
                            size="large"
                            edge="start"
                            color="primary" 
                            aria-label="menu"
                            disabled={!newTaskName || !selectedTag}
                            onClick={() => {
                                const date = Math.floor( Date.now() / 1000);
                                setIsActive(true);
                                setStartTime(date);
                            }}
                        >
                            <PlayArrowIcon />
                        </IconButton>
                    )}
                </Grid>
                <Grid item xs={1} md={1} className={classes.cardInput}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="error" 
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        disabled={!isActive}
                        onClick={() => {
                            setIsActive(false);
                            setNewTaskName('');
                            setSelectedTag('');
                            setTime(0);
                            setStartTime(0);
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Grid>
            </Grid>
        </Container>
        {loading ? <CircularProgress /> : (
            <>
            {sortedWeek.map((week) => {
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                const startWeek = new Date(week.split('-')[0]).toLocaleDateString(undefined, options);
                const endWeek = new Date(week.split('-')[1]).toLocaleDateString(undefined, options);
                return (
                    <Container style={{marginTop: '30px'}} key={week}>
                        <Grid container className={classes.gridHeader}>
                            <Typography noWrap>{startWeek} - {endWeek}</Typography>
                            {tasks[week] && <Typography noWrap>{totalTime(week)}</Typography>}
                        </Grid>
                        {tasks[week] && tasks[week].toReversed().map((dayData) => {
                                if (dayData.length < 1) return null;
                                const sortedByTime = dayData.sort((a, b) => b.endTime - a.endTime);
                                return sortedByTime.map((task) => (
                                    <Grid container key={task.endTime} columns={{ xs: 4, md: 12 }} className={classes.gridContainer}>
                                        <Grid item xs={2} md={3} className={classes.card}>
                                            <Typography noWrap>{task.name}</Typography>
                                        </Grid>
                                        <Grid item xs={2} md={2} className={classes.card}>
                                            <Typography noWrap>#{tags.filter(tag => tag.id === task.tag)[0].name}</Typography>
                                        </Grid>
                                        <Grid item xs={3} md={6} className={classes.card}>
                                            <Typography noWrap>{new Date(task.endTime * 1000).toLocaleDateString(undefined, options)} || {timeConverter(task.startTime)} - {timeConverter(task.endTime)}</Typography>
                                        </Grid>
                                        <Grid item xs={1} md={1} className={classes.card}>
                                            <IconButton
                                                size="large"
                                                edge="start"
                                                color="error" 
                                                aria-label="menu"
                                                sx={{ mr: 2 }}
                                                disabled={task.user === 'all'}
                                                onClick={() => deleteTask(task.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ));
                            })}
                    </Container>
                );
            })}
            </>
        )}
       
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box className={classes.modal}>
          <Grid container spacing={3}>
            <Grid item xs={12} className={classes.card}>
                <TextField
                    label="Tag Name"
                    placeholder="Tag Name"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                />
            </Grid>
            <Grid item xs={12} className={classes.card}>
                {loading ? <CircularProgress /> : 
                <Button variant="contained" color="primary" disabled={!tagName} onClick={addTag}>
                    Add
                </Button>
                }
            </Grid>
          </Grid>
        </Box>
      </Modal>
      <Snackbar
        open={error}
        autoHideDuration={3000}
        onClose={() => {
            setError(false);
            setErrorMessage('');
        }}
        className={classes.snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={errorMessage}
        />
    </Grid>
  );
}

export default TimeTracker;
