import Form from 'react-bootstrap/Form';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { useGame } from '../context/GameContext';

function PerformanceSwitch() {
	const { performanceMode, setPerformanceMode, setCameraMode } = useGame();

	const tooltip = (
		<Tooltip
			id='performance-switch-tooltip'
			style={{
				position: 'fixed',
				zIndex: 1000,
				pointerEvents: 'none'
			}}
		>
			Activating Performance Mode might help if you are experiencing slowdowns.
		</Tooltip>
	);

	return (
		<OverlayTrigger
			placement="right"
			overlay={tooltip}
		>
			<Form style={{
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				padding: '5px',
				borderRadius: '10px',
				color: 'white',
				marginTop: '2vh',
				userSelect: 'none'
			}}>
				<Form.Check
					type="switch"
					id="performance-switch"
					label="Performance mode"
					checked={performanceMode}
					onChange={(e) => {
						setPerformanceMode(e.target.checked);
						if (e.target.checked)
							setCameraMode(false);
					}}
				/>
			</Form>
		</OverlayTrigger>
	);
}

export default PerformanceSwitch;