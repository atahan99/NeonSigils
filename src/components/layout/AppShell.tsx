import type { ReactNode } from "react"
import { useSettings } from "../../hooks/useSettings"
import { Header } from "./Header"
import { Footer } from "./Footer"
import styles from "./AppShell.module.css"

type AppShellProps = {
  children: ReactNode
  /** Hide chrome (header/footer) for immersive game screens if needed. */
  bare?: boolean
}

export const AppShell = ({ children, bare = false }: AppShellProps) => {
  const { settings } = useSettings()
  const shellClass = [styles.shell, settings.scanlines ? "scanlines" : ""]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={shellClass}>
      <div className={styles.inner}>
        {!bare && <Header />}
        <main className={styles.main}>{children}</main>
        {!bare && <Footer />}
      </div>
    </div>
  )
}
