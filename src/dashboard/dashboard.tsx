import React, { FunctionComponent, useEffect, useState } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import Badge from '@material-ui/core/Badge'
import Container from '@material-ui/core/Container'
import Link from '@material-ui/core/Link'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import NotificationsIcon from '@material-ui/icons/Notifications'
import { mainListItems } from './listItems'
import { UserList } from './userList'
import {
  Credentials,
  CredentialsInput,
} from '../components/credentialsInput'
import { botOkcService, Profile } from '../okc/okcService'
import { BookmarkInput } from '../components/bookmarkInput'
import bookmarkService from '../services/bookmarkService'

const Copyright: FunctionComponent = () => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  )
}

const drawerWidth = 240

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
}))

export const Dashboard: FunctionComponent = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    username: localStorage.getItem('username') || '',
    password: localStorage.getItem('password') || '',
  })
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    botOkcService
      .getProfiles(bookmarkService.getAllBookmarkUsers())
      .then(setProfiles)
  })

  const classes = useStyles()
  const [open, setOpen] = React.useState(true)
  const handleDrawerOpen = (): void => {
    setOpen(true)
  }
  const handleDrawerClose = (): void => {
    setOpen(false)
  }

  const handleSubmit = (updated: Credentials): void => {
    setCredentials(updated)
    localStorage.setItem('username', updated.username)
    localStorage.setItem('password', updated.password)
    botOkcService.refreshSession(updated.username, updated.password)
  }

  const handleRefreshProfile = (profile: Profile): void => {
    botOkcService
      .bypassCache(true)
      .getProfile(profile.userId)
      .then(latestProfile => {
        const profileIndex = profiles.findIndex(
          profile => profile.userId === latestProfile.userId,
        )
        profiles[profileIndex] = latestProfile
        setProfiles(profiles)
      })
  }

  const handleOnProfileDeleted = (profile: Profile) => {
    bookmarkService.unbookmark(profile.userId)
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(
              classes.menuButton,
              open && classes.menuButtonHidden,
            )}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Dashboard
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !open && classes.drawerPaperClose,
          ),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>{mainListItems}</List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <CredentialsInput
            credentials={credentials}
            onSubmit={handleSubmit}
          />
        </Container>

        <Container maxWidth="lg" className={classes.container}>
          <BookmarkInput
            onAdd={profile => setProfiles([profile, ...profiles])}
          />
        </Container>

        <Container maxWidth="lg" className={classes.container}>
          {profiles && (
            <UserList
              profiles={profiles}
              onRefresh={handleRefreshProfile}
              onDelete={handleOnProfileDeleted}
            />
          )}
        </Container>
        <Copyright />
      </main>
    </div>
  )
}
