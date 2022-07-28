import {Status} from "../../util/connect"

const UpdateHistory = async ({wallet, setConnected, setLastUpdate}) => {
    const recentAddresses = await window.electron.getRecentAddressTransactions(wallet.addresses)
    let addresses = new Array(wallet.addresses.length)
    for (let i = 0; i < wallet.addresses.length; i++) {
        addresses[i] = {
            address: wallet.addresses[i],
            hash: "", index: 0, height: 0,
        }
        for (let j = 0; j < recentAddresses.length; j++) {
            if (!recentAddresses[j].address === wallet.addresses[i]) {
                continue
            }
            addresses[i].height = recentAddresses[j].height - 1
        }
    }
    for (let i = 0; i < 100 && addresses.length; i++) {
        let data
        try {
            data = await loadOutputs({addresses})
        } catch (e) {
            setConnected(Status.Disconnected)
            console.log("Error connecting to index server")
            console.log(e)
            return
        }
        let txs = []
        for (let name in data) {
            if (data[name].outputs == null) {
                console.log("ERROR: null outputs for address: " + data[name].address)
                console.log(data[name])
                continue
            }
            let maxHash, maxHashIndex, maxHeight
            for (let j = 0; j < data[name].outputs.length; j++) {
                txs.push(data[name].outputs[j].tx)
                if (data[name].outputs[j].tx.blocks && (maxHeight === undefined ||
                    data[name].outputs[j].tx.blocks[0].height >= maxHeight)) {
                    if (maxHeight === undefined || data[name].outputs[j].tx.blocks[0].height > maxHeight) {
                        maxHeight = data[name].outputs[j].tx.blocks[0].height
                        maxHash = undefined
                    }
                    if (maxHash === undefined || data[name].outputs[j].tx.hash > maxHash) {
                        maxHash = data[name].outputs[j].tx.hash
                        maxHashIndex = data[name].outputs[j].index
                    }
                }
                for (let h = 0; h < data[name].outputs[j].tx.outputs.length; h++) {
                    if (!data[name].outputs[j].tx.outputs[h].spends) {
                        continue
                    }
                    for (let k = 0; k < data[name].outputs[j].tx.outputs[h].spends.length; k++) {
                        txs.push(data[name].outputs[j].tx.outputs[h].spends[k].tx)
                    }
                }
            }
            for (let i = 0; i < addresses.length; i++) {
                if (data[name].address !== addresses[i].address) {
                    continue
                }
                if (data[name].outputs.length < 1000) {
                    addresses.splice(i, 1)
                    i--
                    continue
                }
                addresses[i].hash = maxHash
                addresses[i].index = maxHashIndex
                addresses[i].height = maxHeight
                console.log("looping address: " + addresses[i].address + ", height: " + addresses[i].height,
                    ", hashIndex: " + addresses[i].hash + ":" + addresses[i].index)
            }
        }
        await window.electron.saveTransactions(txs)
    }
    await window.electron.generateHistory(wallet.addresses)
    if (typeof setLastUpdate === "function") {
        setLastUpdate((new Date()).toISOString())
    }
    setConnected(Status.Connected)
}
const loadOutputs = async ({addresses}) => {
    let variables = {}
    let paramsStrings = []
    let subQueries = []
    for (let i = 0; i < addresses.length; i++) {
        paramsStrings.push(`$address${i}: String!, $start${i}: HashIndex, $height${i}: Int`)
        variables["address" + i] = addresses[i].address
        variables["start" + i] = addresses[i].hash.length ? JSON.stringify({
            hash: addresses[i].hash,
            index: addresses[i].index,
        }) : null
        variables["height" + i] = addresses[i].height
        subQueries.push(`
        address${i}: address(address: $address${i}) {
            address
            outputs(start: $start${i}, height: $height${i}) {
                hash
                index
                amount
                tx {
                    hash
                    seen
                    raw
                    inputs {
                        index
                        prev_hash
                        prev_index
                    }
                    outputs {
                        index
                        amount
                        lock {
                            address
                        }
                        spends {
                            tx {
                                hash
                                seen
                                raw
                                inputs {
                                    index
                                    prev_hash
                                    prev_index
                                }
                                outputs {
                                    index
                                    amount
                                    lock {
                                        address
                                    }
                                }
                                blocks {
                                    hash
                                    timestamp
                                    height
                                }
                            }
                        }
                    }
                    blocks {
                        hash
                        timestamp
                        height
                    }
                }
            }
        }
        `)
    }
    const query = `
    query (${paramsStrings.join(", ")}) {
        ${subQueries.join("\n")}
    }
    `
    let data = await window.electron.graphQL(query, variables)
    return data.data
}

export default UpdateHistory
