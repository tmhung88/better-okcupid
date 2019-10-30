import React, { FunctionComponent, useEffect, useState } from 'react'
import { Answer, botOkcService, Genre, Profile } from '../../okc/okcService'
import {
  Box,
  createStyles,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  Link,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core'
import { QuestionList } from './questionList'
import { questionStarService } from '../../services/bookmarkService'
import { AnswerFetcher } from './answerFetcher'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    formControl: {
      marginBottom: theme.spacing(2),
      marginLeft: theme.spacing(4),
      minWidth: 200,
    },
    info: {
      margin: theme.spacing(1),
      marginLeft: theme.spacing(4),
    },
  }),
)

const STAR_CATEGORY = 'star'
type Props = {
  profile: Profile
}

export const ProfileDetails: FunctionComponent<Props> = ({ profile }: Props) => {
  const classes = useStyles()
  const [keyword, setKeyword] = useState<string>('')
  const [allAnswers, setAllAnswers] = useState<Answer[]>([])
  const [answersAvailable, setAnswersAvailable] = useState<boolean>(false)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [starredQuestions, setStarredQuestions] = useState<number[]>(questionStarService.getAllBookmarks())
  const [selectedCategory, setCategory] = useState<string>(STAR_CATEGORY)

  const filterAnswers = (
    answers: Answer[],
    starredQuestions: number[],
    category: string,
    keyword: string,
  ): Answer[] => {
    if (category === STAR_CATEGORY) {
      return answers.filter(answer => starredQuestions.includes(answer.question.id))
    }
    const genre = Object.values(Genre).find(genre => genre === category)
    return answers
      .filter(answer => answer.question.genre === genre)
      .filter(answer => answer.question.text.toLowerCase().includes(keyword.toLowerCase()))
  }

  useEffect(() => {
    if (!answersAvailable) {
      setAllAnswers([])
      return
    }
    botOkcService.getAllPublicAnswers(profile.userId).then(payload => {
      setAllAnswers(payload.data)
    })
  }, [profile.userId, answersAvailable])

  useEffect(() => {
    setStarredQuestions(questionStarService.getAllBookmarks())
    setAnswers(filterAnswers(allAnswers, questionStarService.getAllBookmarks(), selectedCategory, keyword))
  }, [questionStarService.getAllBookmarks().length, allAnswers.length])

  const handleOnCategoryChanged = (category: string) => {
    setCategory(category)
    setAnswers(filterAnswers(allAnswers, starredQuestions, category, keyword))
  }

  const handleOnKeywordChanged = (updatedKeyword: string) => {
    setKeyword(updatedKeyword)
    setAnswers(filterAnswers(allAnswers, starredQuestions, selectedCategory, updatedKeyword))
  }

  const handleOnQuestionStarred = (questionId: number) => {
    questionStarService.bookmark(questionId)
    setStarredQuestions(questionStarService.getAllBookmarks())
  }

  const handleOnQuestionUnstarred = (questionId: number) => {
    questionStarService.unbookmark(questionId)
    setStarredQuestions(questionStarService.getAllBookmarks())
  }

  return (
    <Paper>
      <form className={classes.root}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="category">Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={event => {
              const value = event.target.value
              if (typeof value === 'string') {
                handleOnCategoryChanged(value)
              }
            }}
            inputProps={{
              name: 'category',
              id: 'category',
            }}
          >
            <MenuItem value={STAR_CATEGORY}>star</MenuItem>
            {Object.keys(Genre).map(genre => (
              <MenuItem value={genre} key={genre}>
                {genre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
          <TextField label="Keyword" value={keyword} onChange={({ target }) => handleOnKeywordChanged(target.value)} />
        </FormControl>
      </form>
      <Divider variant="fullWidth" />

      <Box className={classes.info}>
        <Typography variant={'h4'} component="p">
          <Link target="_blank" href={`https://www.okcupid.com/profile/${profile.userId}`} rel="noreferrer">
            {profile.displayName}, {profile.age}
          </Link>
        </Typography>
        <Typography variant="caption" component="p">
          {profile.lastLogin}
        </Typography>
        <Typography variant="caption" component="p">
          {profile.distance}
        </Typography>
        <AnswerFetcher
          userId={profile.userId}
          onAnswersAvailable={answersAvailable => setAnswersAvailable(answersAvailable)}
        />
      </Box>

      <QuestionList
        answers={answers}
        starredQuestions={starredQuestions}
        star={handleOnQuestionStarred}
        unstar={handleOnQuestionUnstarred}
      />
    </Paper>
  )
}
