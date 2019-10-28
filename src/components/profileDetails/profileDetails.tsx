import React, { FunctionComponent, useEffect, useState } from 'react'
import { Answer, botOkcService, Genre, Profile } from '../../okc/okcService'
import { Box, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@material-ui/core'
import { QuestionList } from './questionList'
import { questionStarService } from '../../services/bookmarkService'

type Props = {
  profile: Profile
}
export const ProfileDetails: FunctionComponent<Props> = ({ profile }: Props) => {
  const [keyword, setKeyword] = useState<string>('')
  const [allAnswers, setAllAnswers] = useState<Answer[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [starredQuestions, setStarredQuestions] = useState<number[]>(questionStarService.getAllBookmarks())
  const [selectedCategory, setCategory] = useState<string>(Genre.dating)

  const filterAnswers = (
    answers: Answer[],
    starredQuestions: number[],
    category: string,
    keyword: string,
  ): Answer[] => {
    if (category === 'star') {
      return answers.filter(answer => starredQuestions.includes(answer.question.id))
    }
    const genre = Object.values(Genre).find(genre => genre === category)
    return answers
      .filter(answer => answer.question.genre === genre)
      .filter(answer => answer.question.text.toLowerCase().includes(keyword.toLowerCase()))
  }

  useEffect(() => {
    botOkcService.getAllPublicAnswers(profile.userId).then(payload => {
      setAllAnswers(payload.data)
    })
  }, [profile.userId])

  useEffect(() => {
    setStarredQuestions(questionStarService.getAllBookmarks())
    filterAnswers(allAnswers, questionStarService.getAllBookmarks(), selectedCategory, keyword)
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
    console.log('Star question ' + questionId)
    questionStarService.bookmark(questionId)
    setStarredQuestions(questionStarService.getAllBookmarks())
  }

  const handleOnQuestionUnstarred = (questionId: number) => {
    console.log('Unstar question ' + questionId)
    questionStarService.unbookmark(questionId)
    setStarredQuestions(questionStarService.getAllBookmarks())
  }

  return (
    <Paper>
      <form autoComplete="off">
        <FormControl>
          <InputLabel htmlFor="category">Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={event => {
              const value = event.target.value
              if (typeof value === 'string') {
                handleOnCategoryChanged(value)
              } else {
                console.log('Something else', value)
              }
            }}
            inputProps={{
              name: 'category',
              id: 'category',
            }}
          >
            {Object.keys(Genre).map(genre => (
              <MenuItem value={genre} key={genre}>
                {genre}
              </MenuItem>
            ))}
            <MenuItem value={'star'}>star</MenuItem>
          </Select>

          <TextField
            id="keyword"
            label="Keyword"
            value={keyword}
            onChange={({ target }) => handleOnKeywordChanged(target.value)}
            margin="normal"
          />
        </FormControl>
      </form>

      <Box>
        <Typography variant={'h1'}>
          {profile.displayName}, {profile.age}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption">{profile.lastLogin}</Typography>
      </Box>
      <Box>
        <Typography variant="caption">{profile.distance}</Typography>
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
