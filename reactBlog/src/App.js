import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Post from './posts/postExample';
import Nav from './Nav';
import { Container } from '@material-ui/core';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <p>Blog title</p>
        </header>
        <Container maxWidth="sm">
          <div>
            <Nav />
            <switch>
              <Route path="/" exact component={Home} />
              <Route path="/about" exact component={About} />
              <Route path="/post" component={Post} />
              <Route path="/post/:postId" component={Post} />
            </switch>
          </div>
        </Container>
      </div>
    </Router>
  );
}

const About = () => (
  <div>
    <h1>About page</h1>
  </div>
);

const Home = () => (
  <div>
    <h1>Home page</h1>
  </div>
);

export default App;
