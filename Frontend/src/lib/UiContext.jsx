import { createContext, useContext } from 'react'

// Site-wide actions that live in the Layout (the donation dialog) but are triggered from inside pages.
const Ctx = createContext({ openDonate: () => {} })

export const UiProvider = Ctx.Provider
// eslint-disable-next-line react-refresh/only-export-components
export const useUi = () => useContext(Ctx)
