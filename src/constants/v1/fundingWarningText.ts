import { t } from '@lingui/macro'
import { decodeFundingCycleMetadata } from 'utils/v1/fundingCycle'
import { V1FundingCycle } from 'models/v1/fundingCycle'
import { percentToPerbicent } from 'utils/formatNumber'

export const RESERVED_RATE_WARNING_THRESHOLD_PERCENT = 90

export type FundingCycleRiskFlags = {
  duration: boolean
  ballot: boolean
  metadataTicketPrintingIsAllowed: boolean
  metadataReservedRate: boolean
}

export const FUNDING_CYCLE_WARNING_TEXT: (fc: V1FundingCycle) => {
  [k in keyof FundingCycleRiskFlags]: string
} = fc => {
  const metadata = decodeFundingCycleMetadata(fc.metadata)

  return {
    duration: t`The project owner may reconfigure this funding cycle at any time, without notice.`,
    ballot: t`Funding cycles can be reconfigured moments before a new cycle begins, without notifying contributors.`,
    metadataTicketPrintingIsAllowed: t`The project owner may mint any supply of tokens at any time, diluting the token share of all existing contributors.`,
    metadataReservedRate:
      metadata?.reservedRate === percentToPerbicent(100).toNumber()
        ? t`Contributors will not receive any tokens in exchange for paying this project.`
        : t`Contributors will receive a relatively small portion of tokens in exchange for paying this project.`,
  }
}
