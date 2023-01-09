import Link from "next/link";
import { ConnectButton } from "web3uikit";

export default function Header() {
	return (
		<>
			<nav>
				<Link href="/">Home</Link>
				<Link href="/sell-nft">Sell NFT</Link>
				<ConnectButton />
			</nav>
		</>
	);
}
