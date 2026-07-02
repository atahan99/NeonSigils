import { useRouter } from "../../router"
import styles from "./Footer.module.css"

export const Footer = () => {
  const { navigate } = useRouter()
  return (
    <footer className={styles.footer}>
      <span>
        NeonSigils // educational fan project. All trademarks belong to their owners.
      </span>
      <span>
        <button type="button" onClick={() => navigate("about")}>
          Archive &amp; Legal
        </button>
      </span>
    </footer>
  )
}
