import React, { FunctionComponent, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { UserList } from './userList'
import { botOkcService, Profile } from '../services/okcService'
import { UserBookmark } from './userBookmark'
import { userBookmarkService } from '../services/bookmarkService'
import { ProfileDetails } from './profileDetails/profileDetails'
import { CredentialsManager } from './credentialsManager'
import moment from 'moment'
import { isEmpty } from '../services/utils'
import { HideMyAnswers } from './hideMyAnswers'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
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

  const handleProfileOpened = (profile: Profile): void => {
    setSelectedProfile(profile)
  }

  const handleOnProfileDeleted = ({ userId }: Profile) => {
    userBookmarkService.unbookmark(userId)
    setProfiles(profiles.filter(profile => profile.userId !== userId))
    if (selectedProfile && selectedProfile.userId === userId) {
      setSelectedProfile(null)
    }
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <main className={classes.content}>
        {!isTokenValid && (
          <Container maxWidth="lg" className={classes.container}>
            <CredentialsManager onChange={isValid => setTokenValid(isValid)} />
          </Container>
        )}
        {isTokenValid && (
          <React.Fragment>
            <Container>
              <HideMyAnswers></HideMyAnswers>
            </Container>
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
      </main>
    </div>
  )
}
