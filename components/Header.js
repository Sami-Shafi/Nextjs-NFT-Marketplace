import Link from "next/link";
import { ConnectButton } from "web3uikit";

export default function Header() {
	return (
		<>
			<nav className="p-5 border-b-2 flex flex-row jusitfy-between items-center w-100">
				<h1 className="py-4 px-4 font-bold text-3xl">NFT SEA</h1>
				<div className="flex flex-row items-center gap-2 ml-auto">
					<Link href="/" className="mr-4 p-6">
						Home
					</Link>
					<Link href="/sell-nft" className="mr-4 p-6">
						Sell NFT
					</Link>
					<ConnectButton moralisAuth={false} />
				</div>
			</nav>
		</>
	);
}
