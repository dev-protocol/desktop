import {useEffect, useRef, useState} from "react"
import styles from "../../styles/addWallet.module.css"

const SeedTypeOptions = {
    Create: "create",
    Import: "import",
}

const AddSeed = ({onStoredSeed, onUserProvidedSeed, onBack, seedPhrase}) => {
    const [hasOwnSeed, setHasOwnSeed] = useState(false)
    const [hasEnteredInvalidSeedPhrase, setHasEnteredInvalidSeedPhrase] = useState(false)
    const userProvidedSeed = useRef()
    const defaultOption = useRef()

    useEffect(() => {
        defaultOption.current.checked = true
    }, [])

    const handleChooseAddSeed = (e) => {
        setHasOwnSeed(e.target.value !== SeedTypeOptions.Create)
    }

    const handleEnteredSeed = () => {
        const userSeed = userProvidedSeed.current.value
        const isInvalidSeedPhrase = onUserProvidedSeed(userSeed)
        if (isInvalidSeedPhrase) {
            setHasEnteredInvalidSeedPhrase(true)
        }
    }

    const handleEditImportedSeed = () => {
        if (hasEnteredInvalidSeedPhrase) {
            setHasEnteredInvalidSeedPhrase(false)
        }
    }

    const SeedOptionsCreate = () => {
        return (
            <div>
                <p>Here is the seed phrase for your new wallet:</p>
                <textarea className={styles.seedPhrase} readOnly rows="3">{seedPhrase}</textarea>
                <p>Store this seed securely. It will be used to recover your wallet.</p>
            </div>
        )
    }

    const SeedOptionsImport = () => {
        return (
            <div>
                <p>Enter your 12-word seed phrase.</p>
                <textarea className={styles.seedPhrase} ref={userProvidedSeed} onChange={handleEditImportedSeed} rows="3"></textarea>
            </div>
        )
    }

    return (
        <div className={styles.root}>
            <div className={styles.box}>
                <div><b>How would you like to add the seed for this wallet?</b></div>
                <div className={styles.boxMain}>
                    <div onChange={handleChooseAddSeed}>
                        <p><label>
                            <input ref={defaultOption} type="radio" name="seed" value={SeedTypeOptions.Create}/>
                            Create a new seed
                        </label></p>
                        <p><label>
                            <input type="radio" name="seed" value={SeedTypeOptions.Import}/>
                            I already have a seed
                        </label></p>
                    </div>
                    <div>
                        {hasOwnSeed ? <SeedOptionsImport/> : <SeedOptionsCreate/>}
                        {hasEnteredInvalidSeedPhrase &&
                        <p>Please enter a valid seed phrase.</p>
                        }
                    </div>
                </div>
            </div>
            <div className={styles.buttons}>
                <button onClick={onBack}>Back</button>
                <button onClick={hasOwnSeed ? handleEnteredSeed : onStoredSeed}>
                    Next
                </button>
            </div>
        </div>
    )
}

export default AddSeed
