import { useState } from 'react';
import invoke from './utils/invoke';

function App() {
	const [greetMsg, setGreetMsg] = useState('');
	const [name, setName] = useState('');

	async function greet() {
		// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
		const greetMsg = await invoke('greet', { name });
		setGreetMsg(greetMsg);
	}

	return (
		<div className="container">
			<h1>Welcome to Tauri!</h1>

			<p>Click on the Tauri, Vite, and React logos to learn more.</p>

			<form
				className="row"
				onSubmit={(e) => {
					e.preventDefault();
					greet();
				}}
			>
				<input id="greet-input" onChange={(e) => setName(e.currentTarget.value)} placeholder="Enter a name..." />
				<button type="submit">Greet</button>
			</form>

			<p>{greetMsg}</p>
		</div>
	);
}

export default App;
