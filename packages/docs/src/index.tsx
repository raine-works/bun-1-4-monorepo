import { App } from '@/App';
import '@/styles.css';
import '@app/tools/prototypes';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
if (container) {
	const root = createRoot(container);
	root.render(<App />);
}
