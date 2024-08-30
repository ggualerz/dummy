import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

const StatusCircle = ({ userId, updateStatus }) => {
	const { getUserStatus } = useUser();
	const	[status, setStatus] = useState('unknown');
	const	[color, setColor] = useState('#212529');
	const [hoverTip, setHoverTip] = useState('Unknown');

	useEffect(() => {
		if (!userId)
			return ;

		const updateStatusWrapper = ({ newStatus }) => {
			if (!updateStatus)
				return ;
			updateStatus({ newStatus: newStatus });
		}

		const checkStatus = async () => {
			const status = await getUserStatus({ target_id: userId });
			if (status === null) {
				setStatus('unknown');
				updateStatusWrapper({ newStatus: 'unknown' });
			} else {
				setStatus(status.message);
				updateStatusWrapper({ newStatus: status.message });
			}
		}

		checkStatus();

		const intervalId = setInterval(checkStatus, 10000); // Every 10 seconds

		return () => clearInterval(intervalId);
	}, [userId]);

	useEffect(() => {
		switch (status) {
			case 'online':
				setHoverTip('Online');
				setColor('seagreen');
				break ;
			case 'ingame':
				setHoverTip('In game');
				setColor('#7753C1'); // Purple
				break ;
			case 'offline':
				setHoverTip('Offline');
				setColor('#ff1a1a'); // Red
				break ;
			case 'unknown':
			default:
				setHoverTip('Unknown');
				setColor('#212529'); // Gray
				break ;
		}
	}, [status]);

	const tooltip = (
		<Tooltip
			id='tooltip'
			style={{
				position: 'fixed',
				zIndex: 1000,
				pointerEvents: 'none'
			}}
		>
			{hoverTip}
		</Tooltip>
	);

	return (
		<OverlayTrigger
			placement="top"
			overlay={tooltip}
		>
			<div
				style={{
					display: 'inline-block',
					width: '15px',
					height: '15px',
					borderRadius: '50%',
					backgroundColor: color,
					marginRight: '5px',
					verticalAlign: 'middle'
				}}
			>
			</div>
		</OverlayTrigger>
	);
};

export default StatusCircle;
