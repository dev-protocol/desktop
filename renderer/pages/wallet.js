import Frame, {Tabs} from "../components/wallet/frame";
import Addresses from "../components/wallet/addresses";
import {useEffect, useState} from "react";
import History from "../components/wallet/history";
import Send from "../components/wallet/send";
import Receive from "../components/wallet/receive";
import Coins from "../components/wallet/coins";
import Update from "../components/wallet/update";

const StorageKeyWalletTab = "wallet-tab"

const WalletLoaded = () => {
    const [tab, setTab] = useState("")
    const [connected, setConnected] = useState(false)
    useEffect(async () => {
        const tab = await window.electron.getWindowStorage(StorageKeyWalletTab) || Tabs.History
        setTab(tab)
    }, [])
    const handleClicked = (tab) => {
        setTab(tab)
        window.electron.setWindowStorage(StorageKeyWalletTab, tab)
    }
    return (
        <>
            <Frame selected={tab} clicked={handleClicked} connected={connected}>
                {tab === Tabs.History && <History/>}
                {tab === Tabs.Send && <Send/>}
                {tab === Tabs.Receive && <Receive/>}
                {tab === Tabs.Addresses && <Addresses/>}
                {tab === Tabs.Coins && <Coins/>}
            </Frame>
            <Update setConnected={setConnected}/>
        </>
    )
}

export default WalletLoaded
