import React, { useEffect, useState } from 'react'
import { botOkcService } from '../okc/okcService'
import { isEmpty } from '../services/utils'
import { Box, Button, createStyles, makeStyles, Paper, TextField, Theme, Typography } from '@material-ui/core'
import { UserSession } from '../okc/okcClient'

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
  }),
)

type Props = {
  onChange: (isTokenValid: boolean) => void
}

export const CredentialsManager = ({ onChange }: Props) => {
  const classes = useStyles()
  const [isTokenValid, setTokenValid] = useState<boolean>(false)
  const [session, setSession] = useState<UserSession | null>(botOkcService.getCurrentSession())
  const [username, setUsername] = useState<string>(localStorage.getItem('username') || '')
  const [password, setPassword] = useState<string>(localStorage.getItem('password') || '')
  const [error, setError] = useState<string | null>(null)

  const refreshToken = (username: string, password: string): void => {
    if (isEmpty(username) || isEmpty(password)) {
      return
    }
    botOkcService
      .refreshSession(username, password)
      .then(session => {
        setSession(session)
        setTokenValid(true)
        localStorage.setItem('username', username)
        localStorage.setItem('password', password)
        setError(null)
      })
      .catch(() => setError('Wrong username/password'))
  }

  useEffect(() => {
    if (!session) {
      return
    }
    botOkcService
      .bypassCache(true)
      .getMyProfile()
      .then(() => setTokenValid(true))
      .catch(() => refreshToken(username, password))
  }, [])

  useEffect(() => {
    onChange(isTokenValid)
  }, [onChange, isTokenValid])

  return (
    <Box>
      {(isEmpty(username) || isEmpty(password)) && (
        <Typography color="secondary" component="p">
          Please input username and password
        </Typography>
      )}
      <TextField
        className={classes.TextField}
        label="Name"
        value={username}
        onChange={({ target }): void => setUsername(target.value)}
        margin="normal"
      />
      <TextField
        className={classes.TextField}
        label="Password"
        margin="normal"
        value={password}
        onChange={({ target }): void => setPassword(target.value)}
      />
      <Button
        className={classes.Button}
        variant="contained"
        color="primary"
        onClick={(): void => refreshToken(username, password)}
      >
        Save
      </Button>
      {error && (
        <Typography color="error" component="p">
          ${error}
        </Typography>
      )}
    </Box>
  )
}
