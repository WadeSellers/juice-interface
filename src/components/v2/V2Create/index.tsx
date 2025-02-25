import { NetworkName } from 'models/network-name'
import { Tabs } from 'antd'
import { PropsWithChildren, useContext, useState } from 'react'

import V2UserProvider from 'providers/v2/UserProvider'

import { t, Trans } from '@lingui/macro'
import { ThemeContext } from 'contexts/themeContext'

import V2CurrencyProvider from 'providers/v2/V2CurrencyProvider'

import { readNetwork } from 'constants/networks'
import V2WarningBanner from './V2WarningBanner'
import V2MainnetWarning from '../shared/V2MainnetWarning'
import ProjectDetailsTabContent from './tabs/ProjectDetailsTab/ProjectDetailsTabContent'
import FundingTabContent from './tabs/FundingTab/FundingTabContent'
import TokenTabContent from './tabs/TokenTab/TokenTabContent'
import RulesTabContent from './tabs/RulesTab/RulesTabContent'
import { TabContentProps } from './models'

const { TabPane } = Tabs

const TabText = ({ children }: PropsWithChildren<{}>) => {
  return <span style={{ fontSize: 18 }}>{children}</span>
}

type TabConfig = {
  title: string
  component: ({ onFinish }: TabContentProps) => JSX.Element
}

const TABS: TabConfig[] = [
  {
    title: t`1. Project details`,
    component: ProjectDetailsTabContent,
  },
  {
    title: t`2. Funding`,
    component: FundingTabContent,
  },
  {
    title: t`3. Token`,
    component: TokenTabContent,
  },
  {
    title: t`4. Rules`,
    component: RulesTabContent,
  },
]

export default function V2Create() {
  const isRinkeby = readNetwork.name === NetworkName.rinkeby
  const { colors } = useContext(ThemeContext).theme
  const [activeTab, setActiveTab] = useState<string>('0')

  return (
    <V2UserProvider>
      <V2CurrencyProvider>
        {isRinkeby ? <V2WarningBanner /> : null}
        <div
          style={{
            maxWidth: 1500,
            margin: '0 auto',
            padding: '2rem 4rem',
          }}
        >
          {!isRinkeby && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <V2MainnetWarning />
            </div>
          )}

          {isRinkeby && (
            <div>
              <h1
                style={{
                  color: colors.text.primary,
                  fontSize: 28,
                }}
              >
                <Trans>Design your project</Trans> 🎨
              </h1>

              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                tabBarGutter={50}
                size="large"
              >
                {TABS.map((tab, idx) => (
                  <TabPane tab={<TabText>{tab.title}</TabText>} key={`${idx}`}>
                    <tab.component
                      showPreview
                      onFinish={() => {
                        // bail if on last tab.
                        if (idx === TABS.length - 1) return

                        setActiveTab(`${idx + 1}`)
                        window.scrollTo(0, 0)
                      }}
                    />
                  </TabPane>
                ))}
              </Tabs>
            </div>
          )}
        </div>
      </V2CurrencyProvider>
    </V2UserProvider>
  )
}
