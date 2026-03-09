import { useState, useEffect } from 'react'

export function useSessionState(key, initialValue) {
    const [state, setState] = useState(() => {
        try {
            const item = sessionStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (e) {
            console.error(e)
            return initialValue
        }
    })

    useEffect(() => {
        try {
            if (state === undefined) {
                sessionStorage.removeItem(key)
            } else {
                sessionStorage.setItem(key, JSON.stringify(state))
            }
        } catch (e) {
            console.error(e)
        }
    }, [key, state])

    return [state, setState]
}
