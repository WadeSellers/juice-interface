import { Trans } from '@lingui/macro'
import { Button } from 'antd'
import ConfirmDeployV2ProjectModal from 'components/v2/V2Create/DeployProjectModal'
import {
  useAppSelector,
  useEditingV2FundAccessConstraintsSelector,
  useEditingV2FundingCycleDataSelector,
  useEditingV2FundingCycleMetadataSelector,
} from 'hooks/AppSelector'
import { useDeployProjectTx } from 'hooks/v2/transactor/DeployProjectTx'
import { useCallback, useContext, useState } from 'react'
import { uploadProjectMetadata } from 'utils/ipfs'
import { TransactionReceipt } from '@ethersproject/providers'
import { useHistory } from 'react-router-dom'
import { BigNumber } from '@ethersproject/bignumber'
import { NetworkContext } from 'contexts/networkContext'

import { readProvider } from 'constants/readProvider'

const CREATE_EVENT_IDX = 0
const PROJECT_ID_TOPIC_IDX = 3

/**
 * Return the project ID created from a `launchProjectFor` transaction.
 * @param txReceipt receipt of `launchProjectFor` transaction
 */
const getProjectIdFromReceipt = (txReceipt: TransactionReceipt): number => {
  const projectIdHex =
    txReceipt.logs[CREATE_EVENT_IDX]?.topics?.[PROJECT_ID_TOPIC_IDX]
  const projectId = BigNumber.from(projectIdHex).toNumber()

  return projectId
}

export default function DeployProjectButton({
  type = 'default',
}: {
  type?: 'default' | 'primary'
}) {
  const [deployProjectModalVisible, setDeployProjectModalVisible] =
    useState<boolean>(false)
  const deployProjectTx = useDeployProjectTx()
  const history = useHistory()

  const { userAddress, onSelectWallet } = useContext(NetworkContext)

  const [deployLoading, setDeployLoading] = useState<boolean>()
  const [transactionPending, setTransactionPending] = useState<boolean>()

  const { projectMetadata, reservedTokensGroupedSplits, payoutGroupedSplits } =
    useAppSelector(state => state.editingV2Project)
  const fundingCycleMetadata = useEditingV2FundingCycleMetadataSelector()
  const fundingCycleData = useEditingV2FundingCycleDataSelector()
  const fundAccessConstraints = useEditingV2FundAccessConstraintsSelector()

  const deployProject = useCallback(async () => {
    setDeployLoading(true)
    if (
      !(
        projectMetadata?.name &&
        fundingCycleData &&
        fundingCycleMetadata &&
        fundAccessConstraints
      )
    ) {
      setDeployLoading(false)
      throw new Error('Error deploying project.')
    }

    // Upload project metadata
    const uploadedMetadata = await uploadProjectMetadata(projectMetadata)

    if (!uploadedMetadata.IpfsHash) {
      console.error('Failed to upload project metadata.')
      setDeployLoading(false)
      return
    }

    const groupedSplits = [payoutGroupedSplits, reservedTokensGroupedSplits]

    const txSuccessful = await deployProjectTx(
      {
        projectMetadataCID: uploadedMetadata.IpfsHash,
        fundingCycleData,
        fundingCycleMetadata,
        fundAccessConstraints,
        groupedSplits,
      },
      {
        onDone() {
          console.info('Transaction executed. Awaiting confirmation...')
          setTransactionPending(true)
        },
        async onConfirmed(result) {
          const txHash = result?.transaction?.hash
          if (!txHash) {
            return
          }

          const txReceipt = await readProvider.getTransactionReceipt(txHash)
          const projectId = getProjectIdFromReceipt(txReceipt)
          if (projectId === undefined) {
            return
          }

          history.push(`/v2/p/${projectId}`)
        },
        onCancelled() {
          setDeployLoading(false)
          setTransactionPending(false)
        },
      },
    )

    if (!txSuccessful) {
      setDeployLoading(false)
      setTransactionPending(false)
    }
  }, [
    deployProjectTx,
    projectMetadata,
    payoutGroupedSplits,
    reservedTokensGroupedSplits,
    fundingCycleData,
    fundingCycleMetadata,
    fundAccessConstraints,
    history,
  ])

  return (
    <>
      <Button
        onClick={() => setDeployProjectModalVisible(true)}
        type={type}
        htmlType="submit"
        disabled={!projectMetadata?.name}
      >
        <Trans>Review & Deploy</Trans>
      </Button>
      <ConfirmDeployV2ProjectModal
        visible={deployProjectModalVisible}
        onOk={userAddress ? deployProject : onSelectWallet}
        onCancel={() => setDeployProjectModalVisible(false)}
        confirmLoading={deployLoading}
        transactionPending={transactionPending}
      />
    </>
  )
}
