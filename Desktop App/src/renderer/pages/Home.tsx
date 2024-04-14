import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        className=" btn btn-lg btn-success"
        onClick={() => {
          navigate('/font-creation');
        }}
      >
        Get Started
      </button>
    </div>
  );
};

export default Home;
