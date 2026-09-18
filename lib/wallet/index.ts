import { createConfig, type CreateConfigParameters, http } from 'wagmi'

import connectors from './connectors'
import networks from './networks'

const getTransports = (chains: typeof networks) => {
    return chains.reduce((acc, chain) => {
        return {
            ...acc,
            [chain.id]: http()
        }
    }, {})
}

const parameters: CreateConfigParameters = {
    chains: networks,
    connectors: connectors,
    multiInjectedProviderDiscovery: true,
    transports: getTransports(networks),
    syncConnectedChain: true,
    ssr: true
    // storage: createStorage({
    //     storage: cookieStorage
    // })
}

const config = createConfig(parameters)
export default config
