import Header from 'components/Header';
import CreateBountyNFTForm from 'components/CreateBountyNFTForm';
import Container from '../components/Container';
// eslint-disable-next-line import/no-named-as-default
import Main from '../components/Main';
import DarkModeSwitch from '../components/DarkModeSwitch';

function Index() {
  return (
    <Container height="100vh">
      <Header />
      <Main>
        <CreateBountyNFTForm />
      </Main>

      <DarkModeSwitch />
    </Container>
  );
}

export default Index;
