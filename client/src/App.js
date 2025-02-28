import React, { Component } from 'react';
import AppRoutes from './routes'; // Import AppRoutes

class App extends Component {
  render() {
    return (
      <div className="App">
        <AppRoutes /> {/* Use AppRoutes for routing */}
      </div>
    );
  }
}

export default App;
