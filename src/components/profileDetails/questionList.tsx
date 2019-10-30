import React, { Fragment, FunctionComponent } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@material-ui/core'
import StarsIcon from '@material-ui/icons/Stars'
import { Answer } from '../../okc/okcService'
import { questionStarService } from '../../services/bookmarkService'

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    maxWidth: 500,
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
  const starredQuestionMap: { [key: number]: boolean } = {}
  starredQuestions.forEach(questionId => (starredQuestionMap[questionId] = true))

  const handleOnQuestionClicked = (questionId: number): void => {
    if (starredQuestionMap[questionId]) {
      unstar(questionId)
    } else {
      star(questionId)
    }
  }
  return (
    <List className={classes.root}>
      {answers.map(answer => (
        <ListItem key={answer.question.id} divider>
          <IconButton onClick={() => handleOnQuestionClicked(answer.question.id)}>
            {starredQuestionMap[answer.question.id as number] ? <StarsIcon style={{ color: 'blue' }} /> : <StarsIcon />}
          </IconButton>
          <ListItemText primary={answer.question.text} secondary={answer.answerChoice()} />
        </ListItem>
      ))}
    </List>
  )
}
