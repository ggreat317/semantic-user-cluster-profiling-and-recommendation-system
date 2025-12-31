import { useEffect, useState } from "react"

export function useCss(css : string[]) {
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    console.log("attempting to read css")
    console.log(css)
    if (!css ||  css.length == 0) return;

    const root = document.documentElement

    const readVars = () => {
      const styles = getComputedStyle(root)
      setValues(Object.fromEntries(css.map(c => [c, styles.getPropertyValue(c).trim()])))
    }

    readVars()
    console.log("attempting to read something")
    console.log(values)
    const observer = new MutationObserver(readVars)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"]
    })

    return () => observer.disconnect()
  }, [])

  return values
}