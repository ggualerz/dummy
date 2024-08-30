
export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({message: `Method ${req.method} is not allowed`});
	}

	try {
		// remove refresh cookie
		res.setHeader(
			'Set-Cookie',
			'refresh=; HttpOnly; Secure; Max-Age=0; SameSite=Strict; Path=/'
		);

		return res.status(200).json({ message: 'User has been logged out' });
	} catch (error) {
		return res.status(401).json({ message: error.message });
	}
}
