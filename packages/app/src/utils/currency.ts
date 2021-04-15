import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { CurrencyOption } from 'models/currencyOption'
import { CSSProperties } from 'react'

const currencies: Record<
  CurrencyOption,
  { name: string; symbol: string; style?: CSSProperties }
> = {
  '0': {
    name: 'WETH',
    symbol: 'Ξ',
    style: {
      fontFamily: 'sans-serif',
    },
  },
  '1': {
    name: 'USD',
    symbol: '$',
  },
}

export const currencyName = (curr?: BigNumberish) =>
  curr
    ? currencies[BigNumber.from(curr).toString() as CurrencyOption].name
    : undefined

export const currencySymbol = (curr?: BigNumberish) =>
  curr
    ? currencies[BigNumber.from(curr).toString() as CurrencyOption].symbol
    : undefined

export const currencyStyle = (curr?: BigNumberish) =>
  curr
    ? currencies[BigNumber.from(curr).toString() as CurrencyOption].style
    : undefined