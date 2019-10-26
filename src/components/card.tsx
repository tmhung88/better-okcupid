import React from 'react'
import { Box, IconButton, Paper, Typography } from '@material-ui/core'
import { Profile } from '../okc/okcService'
import RefreshIcon from '@material-ui/icons/Refresh'

type Props = {
  profile: Profile
  onRefresh: (profile: Profile) => void
}
export const UserCard = ({ profile, onRefresh }: Props) => {
  return (
    <Paper>
      <Typography variant="h4">
        {profile.displayName}, {profile.age}
      </Typography>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="open drawer"
        onClick={() => onRefresh(profile)}
      >
        <RefreshIcon />
      </IconButton>

      <Box>
        <Typography variant="caption">{profile.lastLogin}</Typography>
      </Box>
      <Box>
        <Typography variant="caption">{profile.distance}</Typography>
      </Box>
    </Paper>
  )
}
