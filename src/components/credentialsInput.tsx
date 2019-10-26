import React, { FunctionComponent, useState } from 'react'
import { Button, Paper, TextField } from '@material-ui/core'

export type Credentials = {
  username: string
  password: string
}

type Props = {
  credentials: Credentials
  onSubmit: (credentials: Credentials) => void
}

export const CredentialsInput: FunctionComponent<Props> = ({
  credentials,
  onSubmit,
}: Props) => {
  const [username, setUsername] = useState(credentials.username)
  const [password, setPassword] = useState(credentials.password)
  return (
    <Paper>
      <form noValidate autoComplete="off">
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
        <Button
          variant="contained"
          color="primary"
          onClick={(): void =>
            onSubmit({ username: username, password: password })
          }
        >
          Submit
        </Button>
      </form>
    </Paper>
  )
}
