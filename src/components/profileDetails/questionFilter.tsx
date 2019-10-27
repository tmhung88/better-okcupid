import React, { Fragment, FunctionComponent } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@material-ui/core'
import { Answer } from '../../okc/okcService'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
  },
  inline: {
    display: 'inline',
  },
}))

type Props = {
  answers: Answer[]
}
export const QuestionFilter: FunctionComponent<Props> = ({
  answers,
}: Props) => {
  const classes = useStyles()
  return (
    <Paper>
      <List className={classes.root}>
        {answers.map((answer, index) => (
          <Fragment key={index}>
            <ListItem
              alignItems="flex-start"
              key={answer.question.id}
            >
              <ListItemText
                primary={answer.question.text}
                secondary={
                  <Fragment>
                    <Box component="p">
                      <Typography
                        component="span"
                        variant="body2"
                        className={classes.inline}
                        color="textPrimary"
                      >
                        Answered
                      </Typography>
                      {answer.answerChoice()}
                    </Box>
                    <Box component="p">
                      <Typography
                        component="span"
                        variant="body2"
                        className={classes.inline}
                        color="textPrimary"
                      >
                        Wanted
                      </Typography>
                      {answer.acceptChoices()[0]}
                    </Box>
                  </Fragment>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </Fragment>
        ))}
      </List>
    </Paper>
  )
}
