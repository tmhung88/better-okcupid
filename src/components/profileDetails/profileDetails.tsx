import React, { FunctionComponent, useEffect, useState } from 'react'
import {
  Answer,
  botOkcService,
  Genre,
  Profile,
} from '../../okc/okcService'
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@material-ui/core'
import Container from '@material-ui/core/Container'
import { QuestionFilter } from './questionFilter'

type Props = {
  profile: Profile
}
export const ProfileDetails: FunctionComponent<Props> = ({
  profile,
}: Props) => {
  const [keyword, setKeyword] = useState<string>('')
  const [allAnswers, setAllAnswers] = useState<Answer[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [selectedCategory, setCategory] = useState<Genre>(
    Genre.dating,
  )
  const filterAnswers = (
    answers: Answer[],
    genre: Genre,
    keyword: string,
  ): Answer[] => {
    return answers
      .filter(answer => answer.question.genre === genre)
      .filter(answer =>
        answer.question.text
          .toLowerCase()
          .includes(keyword.toLowerCase()),
      )
  }

  useEffect(() => {
    botOkcService
      .getAllPublicAnswers(profile.userId)
      .then(payload => {
        const allAnswers = payload.data
        setAnswers(
          filterAnswers(allAnswers, selectedCategory, keyword),
        )
        setAllAnswers(allAnswers)
      })
  }, [profile.userId, allAnswers.length])

  const handleOnCategoryChanged = (category: string) => {
    const selected = Object.values(Genre).find(
      genre => genre === category,
    )
    if (!selected) {
      return
    }

    setCategory(selected)

    setAnswers(filterAnswers(allAnswers, selected, keyword))
  }

  const handleOnKeywordChanged = (updatedKeyword: string) => {
    setKeyword(updatedKeyword)
    setAnswers(
      filterAnswers(allAnswers, selectedCategory, updatedKeyword),
    )
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
          </Select>

          <TextField
            id="keyword"
            label="Keyword"
            value={keyword}
            onChange={({ target }) =>
              handleOnKeywordChanged(target.value)
            }
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

      <QuestionFilter answers={answers} />
    </Paper>
  )
}
