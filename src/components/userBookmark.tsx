import React, { Fragment, FunctionComponent, useState } from 'react'
import { Box, Button, Paper, TextField } from '@material-ui/core'
import { botOkcService, Profile } from '../okc/okcService'
import { UserCard } from './card'
import bookmarkService from '../services/bookmarkService'

type Props = {
  onAdd: (profile: Profile) => void
}
export const UserBookmark: FunctionComponent<Props> = ({
  onAdd,
}: Props) => {
  const [userId, setUserId] = useState<string>('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const handleOnUserIdChanged = (userId: string) => {
    setUserId(userId)
    if (userId.length === 0) {
      setProfile(null)
      return
    }

    botOkcService.getProfile(userId).then(profile => {
      setProfile(profile)
    })
  }
  const handleOnAddClick = (profile: Profile | null) => {
    if (!profile) {
      return
    }
    bookmarkService.bookmark(profile.userId)
    onAdd(profile)
    setUserId('')
    setProfile(null)
  }

  return (
    <Paper>
      <TextField
        label="User ID"
        value={userId}
        onChange={({ target }): void =>
          handleOnUserIdChanged(target.value)
        }
        margin="normal"
      />

      <Button
        variant="contained"
        color="primary"
        disabled={!profile}
        onClick={(): void => handleOnAddClick(profile)}
      >
        Add
      </Button>
      {profile && <UserCard profile={profile} />}
    </Paper>
  )
}
