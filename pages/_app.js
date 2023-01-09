import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";
import Header from "./components/Header";

export default function App({ Component, pageProps }) {
	return (
		<MoralisProvider initializeOnMount={false}>
            <Header />
			<Component {...pageProps} />
		</MoralisProvider>
	);
}
