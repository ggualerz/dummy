import refreshToken from '../../../lib/refresh';

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: `Method ${req.method} is not allowed` });
	}

	try {
		const access = await refreshToken(
			req,
			() => {res.setHeader('Set-Cookie', 'refresh=; HttpOnly; Secure; Max-Age=0; SameSite=Strict; Path=/');}
		);
		if (!access) {
			throw new Error('Not logged in');
		}

		const { id } = req.body;
		if (!id) {
			throw new Error('No user id provided');
		}

		// Fetch user
		const userRes = await fetch(`https://backend:8000/api/members/${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!userRes) {
			throw new Error(`Could not fetch data for user ${id}`);
		}

		const userData = await userRes.json();
		if (!userData) {
			throw new Error(`Could not fetch data for user ${id}`);
		}
		if (userRes.status === 404) {
			return res.status(404).json({ message: userData.detail });
		}
		if (!userRes.ok) {
			throw new Error(userData.detail || `Could not fetch data for user ${id}`);
		}

		// Fetch user's friend list
		const friendRes = await fetch(`https://backend:8000/api/friends`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!friendRes) {
			throw new Error(`Could not fetch friend list for user ${id}`);
		}

		const friendData = await friendRes.json();
		if (!friendData) {
			throw new Error(`Could not fetch friend list for user ${id}`);
		}
		if (friendRes.status === 404) {
			return res.status(200).json({ user: userData, friends: null });
		}
		if (!friendRes.ok) {
			throw new Error(friendData.detail || `Could not fetch friend list for user ${id}`);
		}

		return res.status(200).json({ user: userData, friends: friendData });
	} catch (error) {
		return res.status(401).json({ message: error.message });
	}
}
