import Head from 'next/head';
import styles from './home.module.scss';

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | Xilo Dash</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.main}>
          <span>👏 Oi, bem vindo</span>
        </section>
      </main>

    </>
  )
}
