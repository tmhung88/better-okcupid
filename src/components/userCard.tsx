import React from 'react'
import { Card, CardActionArea, CardActions, CardContent, CardMedia, IconButton, Typography } from '@material-ui/core'
import { Profile } from '../okc/okcService'
import DeleteIcon from '@material-ui/icons/Delete'

const styles = {
  card: {
    display: 'block',
    width: '270px',
    position: 'relative' as 'relative',
  },
  overlay: {
    bottom: '7px',
    right: '7px',
    color: 'red',
    backgroundColor: 'inherits',
    position: 'absolute' as 'absolute',
  },
}

type Props = {
  disabled?: boolean
  profile: Profile
  onDelete?: (profile: Profile) => void
  onOpen?: (profile: Profile) => void
}

export const UserCard = ({ disabled = false, profile, onDelete, onOpen }: Props) => {
  return (
    <Card style={styles.card}>
      <CardActionArea onClick={onOpen ? (): void => onOpen(profile) : undefined} disabled={disabled}>
        <CardMedia
          component="img"
          alt="Contemplative Reptile"
          image={profile.photos[0].cardUrl()}
          title="Contemplative Reptile"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="p">
            {profile.displayName}, {profile.age}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {profile.lastLogin}
          </Typography>
        </CardContent>
      </CardActionArea>
      {onDelete && (
        <IconButton
          style={styles.overlay}
          edge="start"
          color="inherit"
          onClick={() => onDelete(profile)}
          disabled={disabled}
        >
          <DeleteIcon />
        </IconButton>
      )}
    </Card>
  )
}

export const EmptyCard = () => {
  return <Card style={styles.card}></Card>
}
