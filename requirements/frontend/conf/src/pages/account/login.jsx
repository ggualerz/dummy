import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthenticationContext';
import Link from 'next/link';
import LoginResult from '../../components/LoginResult';
import ToastList from '../../components/toasts/ToastList';
import ErrorToast from '../../components/toasts/ErrorToast';
import Head from 'next/head';

const LoginFormUsernameField = ({ username, setUsername }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-user fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="username">Username</label>
				<input
					type="text"
					id="username"
					autoComplete="username"
					className="form-control"
					onChange={e => setUsername(e.target.value)}
					value={username}
					required />
			</div>
		</div>
	);
}

const LoginFormPasswordField = ({ password, setPassword }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-lock fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="current-password">Password</label>
				<input
					type="password"
					id="current-password"
					autoComplete="current-password"
					className="form-control"
					onChange={e => setPassword(e.target.value)}
					value={password}
					required />
			</div>
		</div>
	);
}

const LoginFormOTPField = ({ otp, setOtp }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-key fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="otp">One-Time Password (OTP)</label>
				<input
					type="text"
					id="otp"
					autoComplete="one-time-code"
					className="form-control"
					onChange={e => setOtp(e.target.value)}
					value={otp}
					required />
			</div>
		</div>
	);
}

const LoginFormFields = ({
	username, setUsername,
	password, setPassword,
	submitHandler
}) => {
	return (
		<form className="mx-1 mx-md-4" onSubmit={submitHandler}>

			<LoginFormUsernameField username={username} setUsername={setUsername} />
			<LoginFormPasswordField password={password} setPassword={setPassword} />

			<div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
				<button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg">Login</button>
			</div>

		</form>
	);
}

const LoginForm2FA = ({
	otp, setOtp,
	submitHandler
}) => {
	return (
		<>
			<p className="text-center h4 fw-bold mb-4">Check you authenticator app<br/>for your 6-digit code</p>
			<form className="mx-1 mx-md-4" onSubmit={submitHandler}>

				<LoginFormOTPField otp={otp} setOtp={setOtp} />

				<div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
					<button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg">Login with 2FA</button>
				</div>

			</form>
		</>
	);
}

const LoginToasts = ({ showError, setShowError, errorMessage, setErrorMessage }) => {
	return (
		<ToastList position="top-left">
			<ErrorToast
				name="Login failed"
				show={showError}
				setShow={setShowError}
				errorMessage={errorMessage}
				setErrorMessage={setErrorMessage}
			/>
		</ToastList>
	);
}

const LoginForm2FAOrNot = ({}) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [otp, setOtp] = useState('');
	const [show2FA, setShow2FA] = useState(false);
	const [userId, setUserId] = useState(null);

	const { login, login2FA, error, setError } = useAuth();

	useEffect(() => {
		if (error) {
			setUsername('');
			setPassword('');
			setOtp('');
		}
	}, [error]);

	const submitHandler = async (event) => {
		event.preventDefault();

		if (show2FA) {
			const otpPattern = /^[0-9]{6}$/;

			if (!otpPattern.test(otp)) {
				setError(`Invalid one-time password`);
				return ;
			}

			login2FA({ user_id: userId, otp });
		} else {
			const usernamePattern = /^[a-zA-Z0-9]{4,8}$/;
			const passwordLengthPattern = /^.{8,20}$/;
			const passwordAlnumPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/;
			const passwordSymbolPattern = /^(?=.*[!@#$*?\-+~_=]).{8,20}$/;
			const passwordForbiddenPattern = /^[a-zA-Z0-9!@#$*?\-+~_=]{8,20}$/;

			if (!usernamePattern.test(username)) {
				setError(`Username must be 4 to 8 characters long and only contain alphanumeric characters`);
				return ;
			}
	
			if (!passwordLengthPattern.test(password)) {
				setError(`Password must be 8 to 20 characters long`);
				return ;
			}
			if (!passwordAlnumPattern.test(password)) {
				setError(`Password must have at least 1 lowercase, 1 uppercase, 1 digit, and 1 special character`);
				return ;
			}
			if (!passwordSymbolPattern.test(password)) {
				setError(`Password must have at least 1 special character from this list: \"!@#$*?-+~_=\"`);
				return ;
			}
			if (!passwordForbiddenPattern.test(password)) {
				setError(`Password must only contain lowercase and uppercase letters, digits, and special characters from this list: \"!@#$*?-+~_=\"`);
				return ;
			}

			const response = await login({ username, password });
			if (response && response.requires_2fa) {
				setShow2FA(true);
				setUserId(response.user_id);
			}
		}
	}

	return (
		<>
			{show2FA ? (
				<LoginForm2FA
					otp={otp} setOtp={setOtp}
					submitHandler={submitHandler}
				/>
			) : (
				<LoginFormFields
					username={username} setUsername={setUsername}
					password={password} setPassword={setPassword}
					submitHandler={submitHandler}
				/>
			)}
			<p className="text-center text-muted mt-5 mb-0">
				Don't have an account?&nbsp;
				<Link href="/account/register" className="fw-bold text-body">
					<u>Sign up here</u>
				</Link>
			</p>
		</>
	);
}

const LoginForm = () => {
	const [showError, setShowError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

	const { user, error, clearError } = useAuth();

	useEffect(() => {
		if (error) {
			setErrorMessage(error);
			setShowError(true);
			clearError();
		}
	}, [error]);

	useEffect(() => {
		if (user)
			setAlreadyLoggedIn(true);
		else
			setAlreadyLoggedIn(false);
	}, [user]);

	return (
		<section className="vh-100" style={{backgroundColor: '#eee'}}>
			<LoginToasts
				showError={showError}
				setShowError={setShowError}
				errorMessage={errorMessage}
				setErrorMessage={setErrorMessage}
			/>
			<div className="container h-100">
				<div className="row d-flex justify-content-center align-items-center h-100">
					<div className="col-lg-12 col-xl-11">
						<div className="card text-black" style={{borderRadius: '25px'}}>
							<div className="card-body p-md-5">
								<div className="row justify-content-center">
									<div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">

										<p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Login</p>
										{alreadyLoggedIn ? (
											<LoginResult />
										) : (
											<LoginForm2FAOrNot />
										)}

									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default function LoginPage () {
	return (
		<div>
			<Head>
				<title>Login</title>
			</Head>
			<LoginForm/>
		</div>
	);
}