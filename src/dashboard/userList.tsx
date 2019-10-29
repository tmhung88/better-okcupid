import React, { FunctionComponent, Fragment } from 'react'
import { Grid } from '@material-ui/core'
import { EmptyCard, UserCard } from '../components/userCard'
import { Profile } from '../okc/okcService'

type Props = {
  profilesPerRow: number
  profiles: Profile[]
  onRefresh: (profile: Profile) => void
  onDelete: (profile: Profile) => void
  onOpen: (profile: Profile) => void
}

export const UserList: FunctionComponent<Props> = ({
  profilesPerRow,
  profiles,
  onRefresh,
  onDelete,
  onOpen,
}: Props) => {
  const clonedProfiles = [...profiles]
  const profileRows: Profile[][] = []
  while (clonedProfiles.length > 0) {
    profileRows.push(clonedProfiles.splice(0, profilesPerRow))
  }
  if (profileRows.length === 0) {
    profileRows.push([])
  }

  const lastRowInd = profileRows.length - 1
  const numberOfMissingCards = profilesPerRow - profileRows[lastRowInd].length
  const emptyCards = Array.from(new Array(numberOfMissingCards).keys()).map(index => (
    <Grid item xs key={index}>
      <EmptyCard />
    </Grid>
  ))

  return (
    <Fragment>
      {profileRows.map((row, rowIndex) => (
        <Grid container spacing={3} key={rowIndex}>
          {row.map(profile => (
            <Grid item xs key={profile.userId}>
              <UserCard profile={profile} onRefresh={onRefresh} onDelete={onDelete} onOpen={onOpen} />
            </Grid>
          ))}
          {rowIndex === lastRowInd && emptyCards}
        </Grid>
      ))}
    </Fragment>
  )
}
