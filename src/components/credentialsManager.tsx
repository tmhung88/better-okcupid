import React, { useEffect, useState } from 'react'
import { botOkcService, Profile } from '../services/okcService'
import { isEmpty } from '../services/utils'
import {
  Avatar,
  Box,
  Button,
  Chip,
  createStyles,
  makeStyles,
  Paper,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core'
import { UserSession } from '../services/okcClient'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    TextField: {
      margin: theme.spacing(4),
      marginLeft: theme.spacing(0),
      marginBottom: theme.spacing(0),
      minWidth: 250,
    },
    Button: {
      margin: theme.spacing(4),
      marginBottom: theme.spacing(0),
    },
    large: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
  }),
)

type Props = {
  onChange: (isTokenValid: boolean) => void
}

export const CredentialsManager = ({ onChange }: Props) => {
  const classes = useStyles()
  const [isTokenValid, setTokenValid] = useState<boolean>(false)

  const [username, setUsername] = useState<string>(localStorage.getItem('username') || '')
  const [password, setPassword] = useState<string>(localStorage.getItem('password') || '')
  const [botProfile, setBotProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshToken = async (username: string, password: string): Promise<void> => {
    if (isEmpty(username) || isEmpty(password)) {
      return
    }
    try {
      const userSession = await botOkcService.refreshSession(username, password)
      setTokenValid(true)
      localStorage.setItem('username', username)
      localStorage.setItem('password', password)
      const botProfile = await botOkcService.getProfile(userSession.userId)
      setBotProfile(botProfile)
      console.log(botProfile)
    } catch (error) {
      setTokenValid(false)
      setError(`${error.status}. ${error.reason}`)
    }
  }

  useEffect(() => {
    refreshToken(username, password)
  }, [])

  useEffect(() => {
    onChange(isTokenValid)
  }, [onChange, isTokenValid])

  if (botProfile) {
    return (
      <Chip
        avatar={<Avatar alt="Bot Account" src={botProfile.photos[0].payload.full_small} />}
        label={botProfile.displayName}
      />
    )
  }
  return (
    <Box>
      {(isEmpty(username) || isEmpty(password)) && (
        <Typography color="secondary" component="p">
          Please input username and password
        </Typography>
      )}
      <TextField
        className={classes.TextField}
        label="Username"
        value={username}
        onChange={({ target }): void => setUsername(target.value)}
        margin="normal"
        inputProps={{ 'data-cy': 'username' }}
      />
      <TextField
        className={classes.TextField}
        label="Password"
        margin="normal"
        value={password}
        onChange={({ target }): void => setPassword(target.value)}
        inputProps={{ 'data-cy': 'password' }}
      />
      <Button
        data-cy="save"
        className={classes.Button}
        variant="contained"
        color="primary"
        onClick={() => refreshToken(username, password)}
      >
        Save
      </Button>
      {error && (
        <Typography color="error" component="p">
          {error}
        </Typography>
      )}
    </Box>
  )
}
