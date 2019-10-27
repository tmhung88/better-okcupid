import React, { FunctionComponent } from 'react'
import { Profile } from '../../okc/okcService'
import { Box, Paper, Typography } from '@material-ui/core'
import Container from '@material-ui/core/Container'
import { QuestionFilter } from './questionFilter'
type Props = {
  profile: Profile
}
export const ProfileDetails: FunctionComponent<Props> = ({
  profile,
}: Props) => {
  return (
    <Paper>
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
        <QuestionFilter questions={[]} />
      </Container>
    </Paper>
  )
}
