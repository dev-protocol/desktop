import {useEffect, useRef, useState} from "react";
import GetWallet from "../util/wallet";
import styles from "../../styles/history.module.css";
import ShortHash from "../util/txs";
import {useReferredState} from "../util/state";
import {TitleCol} from "./snippets/title_col";

const Column = {
    Confirms: "confirms",
    Timestamp: "timestamp",
    Hash: "hash",
    Value: "value",
    Balance: "balance",
}

const History = ({lastUpdate}) => {
    const [loaded, setLoaded] = useState(false)
    const [txs, txsRef, setTxs] = useReferredState([])
    const [selectedTxHash, selectedTxHashRef, setSelectedTxHash] = useReferredState("")
    const [sortCol, sortColRef, setSortCol] = useReferredState(Column.Timestamp)
    const [sortDesc, sortDescRef, setSortDesc] = useReferredState(false)
    const historyDiv = useRef()
    useEffect(async () => {
        const wallet = await GetWallet()
        let txs = await window.electron.getTransactions(wallet.addresses)
        let balance = 0
        for (let i = txs.length - 1; i >= 0; i--) {
            balance += txs[i].value
            txs[i].balance = balance
        }
        setTxs(txs)
        setLoaded(true)
    }, [lastUpdate])
    const keyDownHandler = async (e) => {
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
            case "Enter":
                await window.electron.openTransaction({txHash: selectedTxHash})
                break
            default:
                return
        }
        e.preventDefault()
        const cur = historyDiv.current
        const clientHeight = cur.parentNode.clientHeight
        const scrollTop = cur.parentNode.scrollTop
        const hashPrefix = selectedTxHash.substr(0, 5)
        for (let i = 1; i < cur.childNodes.length; i++) {
            if (cur.childNodes[i].childNodes[1].innerText.substr(0, 5) === hashPrefix) {
                const offsetTop = cur.childNodes[i].childNodes[0].offsetTop
                if (offsetTop < scrollTop + 60) {
                    cur.parentNode.scrollTop = offsetTop - 60
                }
                if (offsetTop > clientHeight + scrollTop) {
                    cur.parentNode.scrollTop = offsetTop - clientHeight - 11
                }
                break
            }
        }
        setSelectedTxHash(selectedTxHash)
    }
    const doubleClickTx = async (txHash) => {
        await window.electron.openTransaction({txHash})
    }
    const clickRow = (e, txHash) => {
        e.stopPropagation()
        setSelectedTxHash(txHash)
    }
    const clickWrapper = () => {
        setSelectedTxHash("")
    }
    const sortTxs = (field) => {
        let desc = sortDescRef.current
        if (sortColRef.current === field) {
            desc = !desc
        } else {
            // Default false, except for hash column
            desc = field === Column.Hash
        }
        if (desc) {
            txsRef.current.sort((a, b) => (a[field] > b[field]) ? 1 : -1)
        } else {
            txsRef.current.sort((a, b) => (a[field] < b[field]) ? 1 : -1)
        }
        setTxs([...txsRef.current])
        setSortDesc(desc)
        setSortCol(field)
    }
    return (
        <div className={[styles.wrapper, styles.wrapper5].join(" ")} onClick={clickWrapper} onKeyDown={keyDownHandler} tabIndex={-1}
             ref={historyDiv}>
            {!txs.length ?
                <p className={styles.message}>{loaded ? <>No transactions</> : <>Loading...</>}</p>
                :
                <div className={[styles.row, styles.rowTitle].join(" ")}>
                    <TitleCol sortFunc={sortTxs} desc={sortDesc} sortCol={sortCol}
                              col={Column.Confirms} title={<>&#10004;</>}/>
                    <TitleCol sortFunc={sortTxs} desc={sortDesc} sortCol={sortCol}
                              col={Column.Timestamp} title={"Timestamp"}/>
                    <TitleCol sortFunc={sortTxs} desc={sortDesc} sortCol={sortCol}
                              col={Column.Hash} title={"Hash"}/>
                    <TitleCol sortFunc={sortTxs} desc={sortDesc} sortCol={sortCol}
                              col={Column.Value} title={"Value"}/>
                    <TitleCol sortFunc={sortTxs} desc={sortDesc} sortCol={sortCol}
                              col={Column.Balance} title={"Balance"}/>
                </div>
            }
            {txs.map((tx, i) => {
                return (
                    <div key={i} className={[styles.row, selectedTxHash === tx.hash && styles.rowSelected].join(" ")}
                         onClick={(e) => clickRow(e, tx.hash)} onDoubleClick={() => doubleClickTx(tx.hash)}>
                        <span>{tx.confirms >= 100 ? <>&#10004;</> : tx.confirms}</span>
                        <span>{tx.timestamp ? tx.timestamp.replace(/\.\d+/, "") : "Unknown"}</span>
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
