import styles from './styles.module.scss';
import { ActiveLink } from '../ActiveLink';

export function Header(){
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo-full.svg" alt="xilodash" />
        <nav>
          <ActiveLink activeClassName={styles.active} href="/">
            <a>Ordens de Produção</a>
          </ActiveLink>
        </nav>
      </div>
    </header>
  )
}
