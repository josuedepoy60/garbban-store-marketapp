import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { user } from './mock';

export type TxKind = 'course' | 'recharge' | 'peage';

export type Transaction = {
  id: string;
  kind: TxKind;
  title: string;
  detail: string;
  when: string;
  amount: number; // négatif = débit
  bonus?: number;
};

const INITIAL_TX: Transaction[] = [
  { id: 't1', kind: 'course', title: 'Plateau CCIA ➔ Riviera 2', detail: 'Chauffeur Koffi T.', when: "Aujourd'hui 12:45", amount: -1400 },
  { id: 't2', kind: 'recharge', title: 'Recharge Wave Money', detail: 'Réf #WV-88294', when: 'Hier 18:30', amount: 10000, bonus: 500 },
  { id: 't3', kind: 'course', title: 'Marcory Zone 4 ➔ Siporex', detail: 'Berline VIP', when: 'Dimanche 21:10', amount: -3200 },
  { id: 't4', kind: 'peage', title: 'Péage Pont HKB Express', detail: 'Passage fluide Débit Auto', when: 'Dimanche 14:00', amount: -500 },
];

type Wallet = {
  balance: number;
  transactions: Transaction[];
  recharge: (amount: number, bonus: number, operator: string) => void;
  pay: (amount: number, title: string, detail: string) => boolean;
};

const WalletContext = createContext<Wallet | null>(null);

function now() {
  const d = new Date();
  return `Aujourd'hui ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Solde et historique partagés par tous les écrans (données locales en attendant l'API). */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(user.balance);
  const [transactions, setTransactions] = useState(INITIAL_TX);

  const value = useMemo<Wallet>(
    () => ({
      balance,
      transactions,
      recharge: (amount, bonus, operator) => {
        setBalance((b) => b + amount + bonus);
        setTransactions((t) => [
          { id: `r${Date.now()}`, kind: 'recharge', title: `Recharge ${operator}`, detail: `Réf #${operator.slice(0, 2).toUpperCase()}-${String(Date.now()).slice(-5)}`, when: now(), amount, bonus },
          ...t,
        ]);
      },
      pay: (amount, title, detail) => {
        if (amount > balance) return false;
        setBalance((b) => b - amount);
        setTransactions((t) => [{ id: `p${Date.now()}`, kind: 'course', title, detail, when: now(), amount: -amount }, ...t]);
        return true;
      },
    }),
    [balance, transactions],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet doit être utilisé dans <WalletProvider>');
  return ctx;
}
