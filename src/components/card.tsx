import React from 'react'
import { Box, IconButton, Paper, Typography } from '@material-ui/core'
import { Profile } from '../okc/okcService'
import RefreshIcon from '@material-ui/icons/Refresh'
import DeleteIcon from '@material-ui/icons/Delete'

type Props = {
  profile: Profile
  onRefresh?: (profile: Profile) => void
  onDelete?: (profile: Profile) => void
}
export const UserCard = ({ profile, onRefresh, onDelete }: Props) => {
  return (
    <Paper>
      <Typography variant="h4">
        {profile.displayName}, {profile.age}
      </Typography>
      {onRefresh && (
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => onRefresh(profile)}
        >
          <RefreshIcon />
        </IconButton>
      )}

      {onDelete && (
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => onDelete(profile)}
        >
          <DeleteIcon />
        </IconButton>
      )}

      <Box>
        <Typography variant="caption">{profile.lastLogin}</Typography>
      </Box>
      <Box>
        <Typography variant="caption">{profile.distance}</Typography>
      </Box>
    </Paper>
  )
}
