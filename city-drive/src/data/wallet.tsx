import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';

import type { IconName } from '@/components/ui';
import { formatWhen, minutesAgo } from '@/logic/time';
import { user } from './mock';
import { usePersistentState } from './storage';

export const OPERATORS: { id: string; name: string; label: string; icon: IconName }[] = [
  { id: 'wave', name: 'Wave Money', label: 'Wave', icon: 'waves' },
  { id: 'orange', name: 'Orange Money', label: 'Orange', icon: 'phone-iphone' },
  { id: 'mtn', name: 'MTN MoMo', label: 'MTN MoMo', icon: 'account-balance' },
  { id: 'moov', name: 'Moov Money', label: 'Moov', icon: 'currency-exchange' },
];

// Bonus Gold Club de 5 % crédité en plus de chaque recharge.
export const RECHARGE_BONUS = 0.05;
export const bonusOf = (amount: number) => Math.round(amount * RECHARGE_BONUS);
export const MIN_RECHARGE = 500;
export const MAX_RECHARGE = 500_000;

export type TxKind = 'course' | 'recharge' | 'peage' | 'pourboire' | 'annulation';

export type Transaction = {
  id: string;
  kind: TxKind;
  title: string;
  detail: string;
  /** Date ISO de l'opération. */
  at: string;
  /** Libellé relatif (« Hier 18:30 »), calculé à l'affichage. */
  when: string;
  amount: number; // négatif = débit
  bonus?: number;
};

type StoredTx = Omit<Transaction, 'when'>;

const initialTx = (): StoredTx[] => [
  { id: 't1', kind: 'course', title: 'Plateau CCIA ➔ Riviera 2', detail: 'Chauffeur Koffi T.', at: minutesAgo(90), amount: -1400 },
  { id: 't2', kind: 'recharge', title: 'Recharge Wave Money', detail: 'Réf #WV-88294', at: minutesAgo(60 * 20), amount: 10000, bonus: 500 },
  { id: 't3', kind: 'course', title: 'Marcory Zone 4 ➔ Siporex', detail: 'Berline VIP', at: minutesAgo(60 * 70), amount: -3200 },
  { id: 't4', kind: 'peage', title: 'Péage Pont HKB Express', detail: 'Passage fluide Débit Auto', at: minutesAgo(60 * 77), amount: -500 },
];

type Wallet = {
  balance: number;
  transactions: Transaction[];
  /** Crédite le montant et le bonus ; renvoie la référence de l'opération. */
  recharge: (amount: number, bonus: number, operator: string) => string;
  /** Débite si le solde suffit ; renvoie false sinon (rien n'est débité). */
  pay: (amount: number, title: string, detail: string, kind?: TxKind) => boolean;
  canPay: (amount: number) => boolean;
};

const WalletContext = createContext<Wallet | null>(null);

const txId = (p: string) => `${p}${Date.now()}${Math.floor(Math.random() * 1000)}`;

/** Solde et historique partagés par tous les écrans, sauvegardés sur l'appareil. */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = usePersistentState('wallet', { balance: user.balance, transactions: initialTx() });
  // Solde « engagé » tenu à jour immédiatement, pour refuser deux débits simultanés.
  const live = useRef(state.balance);
  live.current = state.balance;

  const value = useMemo<Wallet>(() => {
    const now = new Date();
    return {
      balance: state.balance,
      transactions: state.transactions.map((t) => ({ ...t, when: formatWhen(t.at, now) })),
      canPay: (amount) => amount > 0 && amount <= live.current,
      recharge: (amount, bonus, operator) => {
        if (!Number.isFinite(amount) || amount < MIN_RECHARGE || amount > MAX_RECHARGE) throw new Error('Montant de recharge invalide');
        live.current += amount + bonus;
        const ref = `${operator.slice(0, 2).toUpperCase()}-${String(Date.now()).slice(-5)}`;
        setState((s) => ({
          balance: s.balance + amount + bonus,
          transactions: [
            { id: txId('r'), kind: 'recharge', title: `Recharge ${operator}`, detail: `Réf #${ref}`, at: new Date().toISOString(), amount, bonus },
            ...s.transactions,
          ],
        }));
        return ref;
      },
      pay: (amount, title, detail, kind = 'course') => {
        if (!(amount > 0) || amount > live.current) return false;
        live.current -= amount;
        setState((s) => ({
          balance: s.balance - amount,
          transactions: [{ id: txId('p'), kind, title, detail, at: new Date().toISOString(), amount: -amount }, ...s.transactions],
        }));
        return true;
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet doit être utilisé dans <WalletProvider>');
  return ctx;
}
