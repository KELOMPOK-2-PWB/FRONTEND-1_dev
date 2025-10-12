import React from "react";
import styles from "./users-register.module.css";

export default function RegisterUserPage() {
  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.logoWrapper}>
          <img src="/A-logo.png" alt="Ashura Logo" className={styles.logoImg} />
        </div>
      </div>
      <div className={styles.rightSection}>
        <form className={styles.form}>
          <h2 className={styles.title}>Daftar Sekarang</h2>
          <p className={styles.subtitle}>
            Sudah punya akun Ashura? <a href="/login/users" className={styles.link}>Masuk</a>
          </p>
          <input type="email" placeholder="Email" className={styles.input} required />
          <input type="text" placeholder="Username" className={styles.input} required />
          <input type="password" placeholder="Password" className={styles.input} required />
          <input type="password" placeholder="Confirm Password" className={styles.input} required />
          <input type="text" placeholder="Nomor Handphone" className={styles.input} required />
          <button type="submit" className={styles.button}>Daftar</button>
        </form>
      </div>
    </div>
  );
}
