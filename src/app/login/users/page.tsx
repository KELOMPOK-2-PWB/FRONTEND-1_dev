import React from "react";
import styles from "./users-login.module.css";
import Link from "next/link";

export default function PageUtama() {
    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <div className={styles.logoWrapper}>
                    <img src="/A-logo.png" alt="Ashura Logo" className={styles.logoImg} />
                </div>
            </div>
            <div className={styles.right}>
                <form className={styles.form}>
                    <h2 className={styles.title}>Masuk dengan akun kamu</h2>
                    <input type="text" placeholder="Username" className={styles.input} />
                    <input type="password" placeholder="Password" className={styles.input} />
                    <button type="submit" className={styles.button}>LOG IN</button>
                    <div className={styles.links}>
                        <Link href="#" className={styles.forgot}>Lupa Password</Link>
                    </div>
                    <div className={styles.registerText}>
                        Belum memiliki akun?<Link href="/register/users" className={styles.registerLink}>Daftar</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}