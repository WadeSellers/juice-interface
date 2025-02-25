import { Trans } from '@lingui/macro'
import { CSSProperties, useState } from 'react'

import { FormItemExt } from 'components/shared/formItems/formItemExt'
import { FormItems } from 'components/shared/formItems'
import { toMod, toSplit } from 'utils/v2/splits'
import { Split } from 'models/v2/splits'

export default function ReservedTokensFormItem({
  name,
  hideLabel,
  value,
  reservedTokensSplits,
  onReservedTokensSplitsChange,
  style = {},
  onChange,
  disabled,
  toggleDisabled,
}: {
  value: number | undefined
  reservedTokensSplits: Split[]
  onReservedTokensSplitsChange: (splits: Split[]) => void
  style?: CSSProperties
  onChange: (val?: number) => void
  disabled?: boolean
  toggleDisabled?: (checked: boolean) => void
} & FormItemExt) {
  // Using a state here because relying on the form does not
  // pass through updated reservedRate to ProjectTicketMods
  const [reservedRate, setReservedRate] = useState<number | undefined>(value)

  return (
    <div style={style}>
      <FormItems.ProjectReserved
        value={value}
        onChange={val => {
          setReservedRate(val)
          onChange(val)
        }}
        disabled={disabled}
        toggleDisabled={toggleDisabled}
        hideLabel={hideLabel}
        name={name}
      />

      {!disabled ? (
        <FormItems.ProjectTicketMods
          mods={reservedTokensSplits.map(split => toMod(split))}
          onModsChanged={mods => {
            const splits = mods.map(mod => toSplit(mod))
            onReservedTokensSplitsChange(splits)
          }}
          formItemProps={{
            label: <Trans>Reserved token allocation (optional)</Trans>,
            extra: (
              <Trans>
                Allocate a portion of your project's reserved tokens to other
                Ethereum wallets or Juicebox projects.
              </Trans>
            ),
          }}
          reservedRate={reservedRate ?? 0}
        />
      ) : null}
    </div>
  )
}
