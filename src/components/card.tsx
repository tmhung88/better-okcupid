import React from 'react'
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from '@material-ui/core'
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
    <Card>
      <CardActionArea>
        <CardMedia
          component="img"
          alt="Contemplative Reptile"
          image={profile.photos[0].cardUrl()}
          title="Contemplative Reptile"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {profile.displayName}, {profile.age}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
          >
            {profile.distance}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
          >
            {profile.lastLogin}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
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
      </CardActions>
    </Card>
  )
}
