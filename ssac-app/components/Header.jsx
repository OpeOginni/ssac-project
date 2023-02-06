import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: 12,
        margin: 2,
      }}
    >
      <ConnectButton />
    </div>
  );
};

export default Header;
