import React from 'react';
import ReactDOM from 'react-dom';

class Layout extends React.Component {
	render() {
		return (
			<div style={{textAlign: 'center'}}>
				<h1>Hello World</h1>
			</div>
		);
	}
}

const app = document.getElementById('app');
ReactDOM.render(<Layout/>, app);