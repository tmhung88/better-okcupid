import React, { FunctionComponent, Fragment } from 'react'
import { Grid } from '@material-ui/core'
import { UserCard } from '../components/card'
import { Profile } from '../okc/okcService'

type Props = {
  profilesPerRow?: number
  profiles: Profile[]
  onRefresh: (profile: Profile) => void
  onDelete: (profile: Profile) => void
}

export const UserList: FunctionComponent<Props> = ({
  profilesPerRow,
  profiles,
  onRefresh,
  onDelete,
}: Props) => {
  const profileRows: Profile[][] = []
  while (profiles.length > 0) {
    profileRows.push(profiles.splice(0, profilesPerRow))
  }
  return (
    <Fragment>
      {profileRows.map((row, rowIndex) => (
        <Grid container spacing={3} key={rowIndex}>
          {row.map(profile => (
            <Grid item xs key={profile.userId}>
              <UserCard
                profile={profile}
                onRefresh={onRefresh}
                onDelete={onDelete}
              />
            </Grid>
          ))}
        </Grid>
      ))}
    </Fragment>
  )
}
