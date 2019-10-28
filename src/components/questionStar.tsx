import React, { Fragment, FunctionComponent, useState } from 'react'
import {
  Button,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core'
import { botOkcService, Question } from '../okc/okcService'
import { questionStarService } from '../services/bookmarkService'
import { isNumber } from '../services/utils'

export const QuestionStar: FunctionComponent = () => {
  const [questionId, setQuestionId] = useState<string>('')
  const [question, setQuestion] = useState<Question | null>(null)

  const handleOnQuestionIdChanged = (questionId: string) => {
    setQuestionId(questionId)
    if (questionId.length === 0) {
      setQuestion(null)
      return
    }

    botOkcService.getQuestion(Number(questionId)).then(question => {
      setQuestion(question)
    })
  }
  const handleOnAddClick = (questionId: string) => {
    if (!isNumber(questionId)) {
      return
    }
    questionStarService.bookmark(Number(questionId))
    setQuestionId('')
    setQuestion(null)
  }

  return (
    <Paper>
      <TextField
        label="Question ID"
        type="number"
        InputLabelProps={{
          shrink: true,
        }}
        value={questionId}
        onChange={({ target }): void =>
          handleOnQuestionIdChanged(target.value)
        }
        margin="normal"
      />

      <Button
        variant="contained"
        color="primary"
        disabled={!question}
        onClick={(): void => handleOnAddClick(questionId)}
      >
        Star
      </Button>
      {question && (
        <Typography variant={'h5'} component="p">
          {question.text}
        </Typography>
      )}
    </Paper>
  )
}
