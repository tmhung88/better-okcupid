import React, { FunctionComponent, useState } from 'react'
import { Box, Button, makeStyles, Paper, TextField, Typography } from '@material-ui/core'
import { botOkcService, Profile } from '../okc/okcService'
import { userBookmarkService } from '../services/bookmarkService'
import { isEmpty } from '../services/utils'
import { UserCard } from './userCard'

const useStyles = makeStyles(() => ({
  Box: {
    display: 'inline-block',
    width: '75%',
  },
}))

type Props = {
  onAdd: (profile: Profile) => void
}

export const UserBookmark: FunctionComponent<Props> = ({ onAdd }: Props) => {
  const classes = useStyles()
  const [profileLink, setProfileLink] = useState<string>('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Possible values
   * https://www.okcupid.com/profile/34689075435893759834
   * https://www.okcupid.com/profile/iamarobot
   * https://www.okcupid.com/profile/iamarobot?cf=
   * https://www.okcupid.com/profile/iamarobot/question?cf=
   * @param link
   */
  const extractUserId = (link: string): string | null => {
    const PREFIX = '.com/profile/'
    const SUFFIX = '?cf'
    const start = link.includes(PREFIX) ? link.indexOf(PREFIX) + PREFIX.length : -1
    if (start == -1) {
      return null
    }
    const possibleEnd = link.includes(SUFFIX) ? link.lastIndexOf(SUFFIX) : link.length
    return link.substring(start, possibleEnd).replace('/questions', '')
  }
  const handleOnUserIdChanged = (updatedProfileLink: string) => {
    setProfileLink(updatedProfileLink)
    if (isEmpty(updatedProfileLink)) {
      setProfile(null)
      return
    }

    const userId = extractUserId(updatedProfileLink)
    if (userId === null) {
      setError(
        'Profile link is invalid. Valid ones look like https://www.okcupid.com/profile/robot , https://www.okcupid.com/profile/589275343647',
      )
      return
    }

    botOkcService
      .bypassCache(true)
      .getProfile(userId)
      .then(profile => {
        setProfile(profile)
        setError(null)
      })
  }
  const handleOnAddClick = (profile: Profile | null) => {
    if (!profile) {
      return
    }
    userBookmarkService.bookmark(profile.userId)
    onAdd(profile)
    setProfileLink('')
    setProfile(null)
  }

  return (
    <Paper>
      <Box className={classes.Box}>
        <TextField
          label="Profile Link"
          value={profileLink}
          onChange={({ target }): void => handleOnUserIdChanged(target.value)}
          fullWidth={true}
          placeholder="https://www.okcupid.com/profile/589275343647...."
        />
      </Box>

      <Button variant="contained" color="primary" disabled={!profile} onClick={(): void => handleOnAddClick(profile)}>
        Add
      </Button>
      {error && (
        <Typography color="error" component="p">
          {error}
        </Typography>
      )}
      {profile && <UserCard profile={profile} />}
    </Paper>
  )
}
