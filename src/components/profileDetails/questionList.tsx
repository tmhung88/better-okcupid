import React, { Fragment, FunctionComponent } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { Box, Divider, IconButton, List, ListItem, ListItemText, Typography } from '@material-ui/core'
import StarsIcon from '@material-ui/icons/Stars'
import { Answer } from '../../okc/okcService'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 500,
  },
  inline: {
    display: 'inline',
  },
  StarsIcon: {
    width: 15,
  },
}))

type Props = {
  answers: Answer[]
  starredQuestions: number[]
  star: (questionId: number) => void
  unstar: (questionId: number) => void
}

export const QuestionList: FunctionComponent<Props> = ({ answers, starredQuestions, unstar, star }: Props) => {
  const classes = useStyles()

  return (
    <List className={classes.root}>
      {answers.map(answer => (
        <Fragment key={answer.question.id}>
          <ListItem alignItems="flex-start" key={answer.question.id}>
            <ListItemText
              primary={
                <React.Fragment>
                  <IconButton>
                    {starredQuestions.includes(answer.question.id) ? (
                      <StarsIcon style={{ color: 'yellow' }} onClick={() => unstar(answer.question.id)} />
                    ) : (
                      <StarsIcon onClick={() => star(answer.question.id)} />
                    )}
                  </IconButton>
                  {`${answer.question.id}. ${answer.question.text}`}
                </React.Fragment>
              }
              secondary={
                <Fragment>
                  <Box component="p">
                    <Typography component="span" variant="body2" className={classes.inline} color="textPrimary">
                      Answered
                    </Typography>
                    {answer.answerChoice()}
                  </Box>
                  <Box component="p">
                    <Typography component="span" variant="body2" className={classes.inline} color="textPrimary">
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
  )
}
