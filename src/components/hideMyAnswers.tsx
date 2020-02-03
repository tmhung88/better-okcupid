import React, { FunctionComponent, useEffect, useState } from 'react'
import { Box, Button, createStyles, makeStyles, TextField, Theme } from '@material-ui/core'
import { Answer, botOkcService } from '../services/okcService'
import Typography from '@material-ui/core/Typography'

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

export const HideMyAnswers: FunctionComponent = () => {
  const classes = useStyles()
  const [ready, setReady] = useState<boolean>(false)
  const [publicAnswers, setPublicAnswers] = useState<Answer[]>([])

  useEffect(() => {
    botOkcService.getAllPublicAnswers(botOkcService.okc.getAccountId()).then(payload => {
      setReady(true)
      setPublicAnswers(payload.data)
    })
  }, [])
  async function hideAnswer() {

    for (const answer of publicAnswers) {
      await botOkcService.hideAnswer(answer)
    }



  }
  return (
    <Box>
      <Typography variant="caption" component="p">
        {publicAnswers.length} answers
      </Typography>
      <Button
        className={classes.Button}
        variant="contained"
        color="primary"
        disabled={!ready}
        onClick={() => hideAnswer()}
      >
        Skip Question
      </Button>
    </Box>
  )
}
