import React from 'react';
import styles from '../styles/base.module.css';
import Head from 'next/head';

const ErrorPage = () => {
	return (
		<div className={styles.container}>
			<Head>
				<title>Not Found</title>
			</Head>
			<h5 className={styles.background_title}>Oops!</h5>
			<div className={styles.cardInfo}>
				<p>Something went wrong.</p>
				<p>We couldn't retrieve the requested resource.</p>
				<p>Here's some pretty stuff to apologize:</p>
				<div className={styles.buttonContainer} >
					<img src="images/uranus.webp" alt="ArrowsGif" style={{height: '5cm'}}/>
					<img src="images/saturnus.webp" alt="ArrowsGif" style={{height: '5cm'}}/>
					<img src="images/flowers.webp" alt="ArrowsGif" style={{height: '5cm'}}/>
				</div>
				<p className='mt-5'>Reloading the page might resolve the problem.</p>
			</div>
		</div>
	);
};

export default ErrorPage;
