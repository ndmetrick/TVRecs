import { useRef, useLayoutEffect } from 'react'

export function useFirstRender() {
  const firstRender = useRef(true)

  useLayoutEffect(() => {
    if (firstRender.current) {
      console.log('this is the first render')
      firstRender.current = false
    }
    return
  })

  return firstRender.current
}

export default { useFirstRender }

// import React, { useEffect, useRef } from 'react'

// const useDidMountEffect = (func, deps) => {
//   const didMount = useRef(false)

//   useEffect(() => {
//     if (didMount.current) func()
//     else didMount.current = true
//   }, deps)
// }

// export default useDidMountEffect
