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
  const [allAnswers, setAllAnswers] = useState<Answer[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [selectedCategory, setCategory] = useState<Genre>(
    Genre.dating,
  )

  useEffect(() => {
    botOkcService
      .getAllPublicAnswers(profile.userId)
      .then(payload => {
        const allAnswers = payload.data
        const filteredAnswer = allAnswers.filter(
          answer => answer.question.genre === selectedCategory,
        )
        setAnswers(filteredAnswer)
        setAllAnswers(allAnswers)

        const brokenAnswer = allAnswers.find(
          answer =>
            answer.question.text ===
            'How do you think your sex drive compares to what is typical for other people of your age and gender?',
        )
        console.log('brokenAnswer', brokenAnswer)
      })
  }, [allAnswers.length])

  const handleOnCategoryChanged = (category: string) => {
    const selected = Object.values(Genre).find(
      genre => genre === category,
    )
    if (!selected) {
      return
    }

    setCategory(selected)
    const filteredAnswers = allAnswers.filter(
      answer => answer.question.genre === category,
    )
    console.log('filteredAnswers', filteredAnswers)

    setAnswers(filteredAnswers)
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
        </FormControl>
      </form>
      <Container maxWidth="lg">
        <Box>
          <Typography variant={'h1'}>
            {profile.displayName}, {profile.age}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption">
            {profile.lastLogin}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption">
            {profile.distance}
          </Typography>
        </Box>
      </Container>

      <Container maxWidth="lg">
        <QuestionFilter answers={answers} />
      </Container>
    </Paper>
  )
}
