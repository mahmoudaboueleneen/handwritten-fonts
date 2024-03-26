import { useAuth } from "../../../hooks/useAuth";
import { clearFontsFromLocalStorage } from "../../../utils/storage/LocalStorage";

const MyFonts = () => {
  const { selectedAccount } = useAuth();

  const onClearFonts = async () => {
    await clearFontsFromIPFS();
    clearFontsFromLocalStorage(selectedAccount);
  };

  const clearFontsFromIPFS = async () => {};

  return (
    <button className="btn btn-error" onClick={onClearFonts}>
      Clear Fonts
    </button>
  );
};

export default MyFonts;
