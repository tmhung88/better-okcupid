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
import { botOkcService, Profile } from '../okc/okcService'
import { UserBookmark } from '../components/userBookmark'
import { userBookmarkService } from '../services/bookmarkService'
import { ProfileDetails } from '../components/profileDetails/profileDetails'
import { CredentialsManager } from '../components/credentialsManager'
import moment from 'moment'
import { isEmpty } from '../services/utils'

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
  const [isTokenValid, setTokenValid] = useState<boolean>(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')

  /**
   * Auto refresh profiles every 5 minutes
   */
  const autoRefreshProfiles = () => {
    const MINUTE = 60 * 1000
    const DELAY_BETWEEN_REQUESTS = 1000
    const AUTO_REFESH_INTERVAL = userBookmarkService.getAllBookmarks().length * DELAY_BETWEEN_REQUESTS + 5 * MINUTE
    return setInterval(() => {
      botOkcService
        .bypassCache(true)
        .getProfiles(userBookmarkService.getAllBookmarks(), DELAY_BETWEEN_REQUESTS)
        .then(setProfiles)
      setLastUpdated(moment().format('hh:MM A'))
    }, AUTO_REFESH_INTERVAL)
  }
  useEffect(() => {
    if (!isTokenValid) {
      return
    }

    botOkcService.getProfiles(userBookmarkService.getAllBookmarks()).then(setProfiles)
    const refreshProfileInterval = autoRefreshProfiles()
    return () => {
      clearInterval(refreshProfileInterval)
    }
  }, [userBookmarkService.getAllBookmarks().length, isTokenValid])

  const classes = useStyles()
  const [open, setOpen] = React.useState(true)
  const handleDrawerOpen = (): void => {
    setOpen(true)
  }
  const handleDrawerClose = (): void => {
    setOpen(false)
  }

  const handleProfileOpened = (profile: Profile): void => {
    setSelectedProfile(profile)
  }

  const handleOnProfileDeleted = ({ userId }: Profile) => {
    userBookmarkService.unbookmark(userId)
    setProfiles(profiles.filter(profile => profile.userId !== userId))
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
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
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
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
        {!isTokenValid && (
          <Container maxWidth="lg" className={classes.container}>
            <CredentialsManager onChange={isValid => setTokenValid(isValid)} />
          </Container>
        )}
        {isTokenValid && (
          <React.Fragment>
            <Container maxWidth="lg" className={classes.container}>
              <UserBookmark onAdd={profile => setProfiles([profile, ...profiles])} />
            </Container>

            <Container maxWidth="lg" className={classes.container}>
              {!isEmpty(lastUpdated) && (
                <Typography variant="subtitle1" component="p">
                  Refreshed at {lastUpdated}
                </Typography>
              )}
              {profiles && (
                <UserList
                  profilesPerRow={4}
                  profiles={profiles}
                  onDelete={handleOnProfileDeleted}
                  onOpen={handleProfileOpened}
                />
              )}
            </Container>
          </React.Fragment>
        )}
        {selectedProfile && (
          <Container maxWidth="lg" className={classes.container}>
            <ProfileDetails profile={selectedProfile} />
          </Container>
        )}
        <Copyright />
      </main>
    </div>
  )
}
