import {useEffect} from "react";
import GetWallet from "../util/wallet";
import styles from "../../styles/history.module.css";
import ShortHash from "../util/txs";
import {useReferredState} from "../util/state";

const History = () => {
    const [txs, txsRef, setTxs] = useReferredState([])
    const [selectedTxHash, selectedTxHashRef, setSelectedTxHash] = useReferredState("")
    useEffect(async () => {
        let wallet = await GetWallet()
        let txs = await window.electron.getTransactions(wallet.addresses)
        let balance = 0
        for (let i = txs.length - 1; i >= 0; i--) {
            balance += txs[i].value
            txs[i].balance = balance
        }
        setTxs(txs)
    }, [])
    const keyDownHandler = (e) => {
        let selectedTxHash = selectedTxHashRef.current
        if (!selectedTxHash || !selectedTxHash.length) {
            return
        }
        const txs = txsRef.current
        switch (e.key) {
            case "ArrowUp":
                for (let i = 1; i < txs.length; i++) {
                    if (txs[i].hash === selectedTxHash) {
                        selectedTxHash = txs[i - 1].hash
                        break
                    }
                }
                break
            case "ArrowDown":
                for (let i = 0; i < txs.length - 1; i++) {
                    if (txs[i].hash === selectedTxHash) {
                        selectedTxHash = txs[i + 1].hash
                        break
                    }
                }
                break
            case "Escape":
                selectedTxHash = ""
                break
            default:
                return selectedTxHash
        }
        e.preventDefault()
        setSelectedTxHash(selectedTxHash)
    }
    const doubleClickTx = async (txHash) => {
        await window.electron.openPreviewSend({txHash})
    }
    const clickRow = (e, txHash) => {
        e.stopPropagation()
        setSelectedTxHash(txHash)
    }
    const clickWrapper = () => {
        setSelectedTxHash("")
    }
    return (
        <div className={styles.wrapper} onClick={clickWrapper} onKeyDown={keyDownHandler} tabIndex={-1}>
            {!txs.length ?
                <p>No transactions</p>
                :
                <div className={[styles.row, styles.rowTitle].join(" ")}>
                    <span>Timestamp</span>
                    <span>Hash</span>
                    <span>Value</span>
                    <span>Balance</span>
                </div>
            }
            {txs.map((tx, i) => {
                return (
                    <div key={i} className={[styles.row, selectedTxHash === tx.hash && styles.rowSelected].join(" ")}
                         onClick={(e) => clickRow(e, tx.hash)} onDoubleClick={() => doubleClickTx(tx.hash)}>
                        <span>{tx.timestamp}</span>
                        <span>{ShortHash(tx.hash)}</span>
                        <span className={styles.itemValue}>{tx.value.toLocaleString()}</span>
                        <span className={styles.itemValue}>{tx.balance.toLocaleString()}</span>
                    </div>
                )
            })}
        </div>
    )
}

export default History
