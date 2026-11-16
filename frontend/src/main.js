
import "./style.css";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionHashVariant } from "genlayer-js/types";

const CONTRACT_ADDRESS =
  "0x48f711c6FeBB1f084D4861feCc2fdCFE38E11986";

const connection = document.getElementById("connection");
const bountyElement = document.getElementById("bounty");
const verdictElement = document.getElementById("verdict");
const connectButton = document.getElementById("connectWallet");
const walletAddress = document.getElementById("walletAddress");

const adjudicateButton = document.getElementById("adjudicateButton");
const prNumberInput = document.getElementById("prNumber");
const actionStatus = document.getElementById("actionStatus");

const readClient = createClient({ chain: studionet });
let walletClient = null;

function displayData(value) {
  if (value === null || value === undefined || value === "") {
    return "No data available.";
  }

  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value, null, 2);
}

function renderVerdict(verdict) {
  let data = verdict;

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      verdictElement.textContent = data;
      return;
    }
  }

  if (!data || !data.decision) {
    verdictElement.textContent = displayData(data);
    return;
  }

  const decision = String(data.decision).toUpperCase();

  verdictElement.innerHTML = `
    <div class="verdict-result ${decision.toLowerCase()}">
      <span class="verdict-label">COURT DECISION</span>
      <strong class="verdict-decision"></strong>
    </div>
    <p class="verdict-rationale"></p>
    <div class="verdict-assessment"></div>
  `;

  verdictElement.querySelector(".verdict-decision").textContent = decision;

  verdictElement.querySelector(".verdict-rationale").textContent =
    data.rationale || "No rationale supplied.";

  const assessment = verdictElement.querySelector(".verdict-assessment");

  if (
    data.criteria_assessment &&
    typeof data.criteria_assessment === "object"
  ) {
    for (const [key, value] of Object.entries(data.criteria_assessment)) {
      const item = document.createElement("p");
      item.textContent = `${key.replaceAll("_", " ")}: ${
        typeof value === "object" ? JSON.stringify(value) : value
      }`;
      assessment.appendChild(item);
    }
  } else {
    assessment.textContent = data.criteria_assessment || "";
  }
}

async function loadContractData() {
  try {
    connection.textContent = "Connecting to GenLayer Studio...";

    const bounty = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_bounty",
      args: [],
      transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
    });

    const verdict = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_verdict",
      args: [],
      transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
    });

    connection.textContent = "Connected - GenLayer Studio";
    bountyElement.textContent = displayData(bounty);
    renderVerdict(verdict);

  } catch (error) {
    connection.textContent = "Connection failed";
    bountyElement.textContent = "Could not load bounty data.";
    verdictElement.textContent = error.message || String(error);
    console.error("GenLayer read error:", error);
  }
}

connectButton.addEventListener("click", async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask was not detected.");
    }

    connectButton.disabled = true;
    connectButton.textContent = "Connecting...";

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts.length) {
      throw new Error("No wallet account selected.");
    }

    const address = accounts[0];

    walletClient = createClient({
      chain: studionet,
      account: address,
      provider: window.ethereum,
    });

    walletAddress.textContent =
      `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;

    connectButton.textContent = "Wallet Connected";

  } catch (error) {
    walletClient = null;
    walletAddress.textContent = error.message || String(error);
    connectButton.textContent = "Connect Wallet";

  } finally {
    connectButton.disabled = false;
  }
});

if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    walletClient = null;
    walletAddress.textContent = "Wallet not connected";
    connectButton.textContent = "Connect Wallet";

    if (accounts.length) {
      walletAddress.textContent = "Account changed. Reconnect wallet.";
    }
  });
}

adjudicateButton.addEventListener("click", async () => {
  try {
    if (!walletClient) {
      throw new Error("Connect your wallet first.");
    }

    const prNumber = Number(prNumberInput.value);

    if (!Number.isInteger(prNumber) || prNumber < 1) {
      throw new Error("Enter a valid GitHub PR number.");
    }

    adjudicateButton.disabled = true;
    actionStatus.textContent = "Submitting adjudication to GenLayer...";

    const transaction = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: "adjudicate_pull_request",
      args: [BigInt(prNumber)],
      value: 0n,
    });

    actionStatus.textContent =
      "Transaction submitted. Waiting for GenLayer finalization...";

    const receipt = await walletClient.waitForTransactionReceipt({
      hash: transaction,
      interval: 3000,
      retries: 100,
    });

    actionStatus.textContent =
      `Transaction finalized: ${receipt.status}`;

    await loadContractData();

  } catch (error) {
    actionStatus.textContent =
      "Error: " + (error.message || String(error));

  } finally {
    adjudicateButton.disabled = false;
  }
});

loadContractData();
