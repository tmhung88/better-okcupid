import React, { FunctionComponent, useState } from 'react'
import { Button, Paper, TextField, Typography } from '@material-ui/core'
import { botOkcService, Profile } from '../okc/okcService'
import { userBookmarkService } from '../services/bookmarkService'
import { isEmpty } from '../services/utils'
import { UserCard } from './card'

type Props = {
  onAdd: (profile: Profile) => void
}
export const UserBookmark: FunctionComponent<Props> = ({ onAdd }: Props) => {
  const [profileLink, setProfileLink] = useState<string>('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const extractUserId = (link: string): string | null => {
    const PREFIX = '.com/profile/'
    const SUFFIX = '?'
    const userIdStart = link.includes(PREFIX) ? link.indexOf(PREFIX) + PREFIX.length : -1
    if (userIdStart == -1) {
      return null
    }
    const userIdEnd = link.includes(SUFFIX) ? link.lastIndexOf(SUFFIX) : link.length
    return link.substring(userIdStart, userIdEnd)
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

    botOkcService.getProfile(userId).then(profile => {
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
      <TextField
        label="Profile Link"
        value={profileLink}
        onChange={({ target }): void => handleOnUserIdChanged(target.value)}
        margin="normal"
      />

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
