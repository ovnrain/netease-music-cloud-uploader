// import styles from './App.module.scss';
import UserInfoProvider from './providers/UserInfoProvider';

function App() {
  return (
    <UserInfoProvider>
      <div>123</div>
    </UserInfoProvider>
  );
}

export default App;
