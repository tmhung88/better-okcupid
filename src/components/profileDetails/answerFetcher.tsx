import React, { useEffect, useState } from 'react'
import { botOkcService } from '../../okc/okcService'
import { AnswerFilter, QuestionFilterStats } from '../../okc/okcClient'
import { Typography } from '@material-ui/core'
import { delay } from '../../services/utils'
type Props = {
  userId: string
  onAnswersAvailable: (answersAvailable: boolean) => void
}
type Loading = {
  status: boolean
  info: string
}

export const AnswerFetcher = ({ userId, onAnswersAvailable }: Props) => {
  const defaultStats: QuestionFilterStats = {
    [AnswerFilter.FIND_OUT]: 0,
    [AnswerFilter.DISAGREE]: 0,
    [AnswerFilter.AGREE]: 0,
  }
  const defaultLoading: Loading = { status: true, info: 'Loading answers' }
  const [stats, setStats] = useState<QuestionFilterStats>(defaultStats)
  const [answersAvailable, setAnswersAvailable] = useState<boolean>(false)
  const [loading, setLoading] = useState<Loading>(defaultLoading)

  const resolveMissingAnswers = async (userId: string): Promise<void> => {
    const missingQuestionPayload = await botOkcService.bypassCache(true).getAllFindOuts(userId)
    const missingAnswers = missingQuestionPayload.data
    let answeredCount = 0

    for (const { question } of missingAnswers) {
      await botOkcService.answerQuestion(question.id)
      await delay(1000)
      answeredCount++
      setLoading({ status: true, info: `Answering ${answeredCount}/${missingAnswers.length} missing questions ...` })
    }
    setLoading({ status: true, info: `Fetching all available answers ...` })
    await botOkcService.bypassCache(true).getAllPublicAnswers(userId)
    setLoading({ status: true, info: `Fetching question stats ...` })
    /**
     * Force a cache update for the number of missing answers
     */
    await botOkcService
      .bypassCache(true)
      .getQuestionFilterStats(userId)
      .then(setStats)
    setAnswersAvailable(true)
  }

  useEffect(() => {
    setStats(defaultStats)
    botOkcService.getQuestionFilterStats(userId).then(stats => {
      const haveMissingAnswers = stats[AnswerFilter.FIND_OUT] !== 0
      setAnswersAvailable(!haveMissingAnswers)
      setStats(stats)
      if (haveMissingAnswers) {
        setLoading({ status: true, info: `Fetching ${stats[AnswerFilter.FIND_OUT]} questions ...` })
        resolveMissingAnswers(userId)
      }
    })
  }, [userId])

  useEffect(() => {
    onAnswersAvailable(answersAvailable)
    if (answersAvailable) {
      setLoading({ status: false, info: '' })
    } else {
      setLoading(defaultLoading)
    }
  }, [answersAvailable])

  function getAvailableAnswers(): number {
    const disagreeAnswers = stats[AnswerFilter.DISAGREE] || 0
    const agreeAnswers = stats[AnswerFilter.AGREE] || 0
    return disagreeAnswers + agreeAnswers
  }

  function getMissingAnswers(): number {
    return stats[AnswerFilter.FIND_OUT] || 0
  }

  return (
    <React.Fragment>
      {loading.status && (
        <Typography component="p" variant="body1">
          {loading.info}
        </Typography>
      )}
      {!loading.status && (
        <Typography component="p" variant="subtitle1">
          Available answers: {getAvailableAnswers()} || Missing answers: {getMissingAnswers()}
        </Typography>
      )}
    </React.Fragment>
  )
}
