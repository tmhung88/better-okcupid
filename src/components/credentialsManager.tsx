import React, { useEffect, useState } from 'react'
import { botOkcService } from '../okc/okcService'
import { isEmpty } from '../services/utils'
import { Button, Paper, TextField, Typography } from '@material-ui/core'
import { UserSession } from '../okc/okcClient'

type Props = {
  onChange: (isTokenValid: boolean) => void
}

export const CredentialsManager = ({ onChange }: Props) => {
  const [isTokenValid, setTokenValid] = useState<boolean>(false)
  const [session, setSession] = useState<UserSession | null>(botOkcService.getCurrentSession())
  const [username, setUsername] = useState<string>(localStorage.getItem('username') || '')
  const [password, setPassword] = useState<string>(localStorage.getItem('password') || '')
  const [error, setError] = useState<string | null>(null)

  const refreshToken = (): void => {
    if (isEmpty(username) || isEmpty(password)) {
      return
    }
    botOkcService
      .refreshSession(username, password)
      .then(session => {
        setSession(session)
        localStorage.setItem('username', username)
        localStorage.setItem('password', password)
        setError(null)
      })
      .catch(() => setError('Wrong username/password'))
  }

  useEffect(() => {
    console.log('Validate session', session)
    botOkcService
      .bypassCache(true)
      .getMyProfile()
      .then(() => setTokenValid(true))
      .catch(() => refreshToken())
  }, [session ? session.oauthToken : null])

  useEffect(() => {
    console.log('isTokenValid ', isTokenValid)
    onChange(isTokenValid)
  }, [isTokenValid])

  return (
    <Paper>
      {(isEmpty(username) || isEmpty(password)) && (
        <Typography color="secondary" component="p">
          Please input username and password
        </Typography>
      )}
      <TextField
        label="Name"
        value={username}
        onChange={({ target }): void => setUsername(target.value)}
        margin="normal"
      />
      <TextField
        label="Password"
        margin="normal"
        value={password}
        onChange={({ target }): void => setPassword(target.value)}
      />
      <Button variant="contained" color="primary" onClick={(): void => refreshToken()}>
        Save
      </Button>
      {error && (
        <Typography color="error" component="p">
          ${error}
        </Typography>
      )}
    </Paper>
  )
}
